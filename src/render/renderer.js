/**
 * 星空渲染器
 * 整合恒星、星座、深空、太阳系、银河
 */

import * as THREE from 'three';
import { DEG2RAD, RAD2DEG } from '../astronomy/math.js';
import { SolarSystemRenderer } from './solarSystem.js';
import { GalaxyRenderer } from './galaxy.js';

// 色指数到色温映射
const CI_TO_TEMP = [
  { ci: -0.4, temp: 42000, color: new THREE.Color(0.6, 0.7, 1.0) },
  { ci: -0.2, temp: 18500, color: new THREE.Color(0.7, 0.8, 1.0) },
  { ci: 0.0, temp: 9500, color: new THREE.Color(0.85, 0.9, 1.0) },
  { ci: 0.2, temp: 8500, color: new THREE.Color(0.95, 0.95, 1.0) },
  { ci: 0.4, temp: 7200, color: new THREE.Color(1.0, 1.0, 1.0) },
  { ci: 0.6, temp: 6000, color: new THREE.Color(1.0, 0.95, 0.9) },
  { ci: 0.8, temp: 5200, color: new THREE.Color(1.0, 0.9, 0.8) },
  { ci: 1.0, temp: 4500, color: new THREE.Color(1.0, 0.85, 0.7) },
  { ci: 1.4, temp: 3700, color: new THREE.Color(1.0, 0.75, 0.6) },
  { ci: 2.0, temp: 3100, color: new THREE.Color(1.0, 0.65, 0.5) }
];

function ciToColor(ci) {
  for (let i = 0; i < CI_TO_TEMP.length - 1; i++) {
    if (ci <= CI_TO_TEMP[i+1].ci) {
      const t = (ci - CI_TO_TEMP[i].ci) / (CI_TO_TEMP[i+1].ci - CI_TO_TEMP[i].ci);
      return CI_TO_TEMP[i].color.clone().lerp(CI_TO_TEMP[i+1].color, t);
    }
  }
  return CI_TO_TEMP[CI_TO_TEMP.length-1].color.clone();
}

export class SkyRenderer {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    // 场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // 相机
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.001, 100);
    this.camera.position.set(0, 0, 0);

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);
    container.appendChild(this.renderer.domElement);

    // 相机控制
    this.cameraTarget = new THREE.Vector3(0, 0, -1);
    this.azimuth = 0;
    this.altitude = 0;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    // 图层
    this.layers = {
      stars: true,
      constellations: true,
      dso: true,
      grid: false,
      galaxy: true,
      planets: true
    };

    // 交互
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.onObjectClick = null;

    // 子渲染器
    this.solarSystem = new SolarSystemRenderer(this.scene);
    this.galaxy = new GalaxyRenderer(this.scene);

    this._setupInteraction();
    this._setupResize();
  }

  // ============================================
  // 恒星渲染
  // ============================================

  createStarField(stars) {
    const count = stars.length;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const starData = new Float32Array(count * 2); // magnitude, id

    for (let i = 0; i < count; i++) {
      const star = stars[i];
      const ra = star.ra * DEG2RAD;
      const dec = star.dec * DEG2RAD;

      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.sin(dec);
      const z = Math.cos(dec) * Math.sin(ra);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const color = ciToColor(star.colorIndex || 0.4);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      const mag = star.magnitude || 5;
      sizes[i] = Math.max(0.003, 0.012 * Math.pow(10, -0.2 * mag));

      starData[i * 2] = mag;
      starData[i * 2 + 1] = star.id || i;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('starData', new THREE.BufferAttribute(starData, 2));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: this.renderer.getPixelRatio() }
      },
      vertexShader: `
        attribute float size;
        attribute vec2 starData;
        varying vec3 vColor;
        varying float vMag;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vMag = starData.x;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (400.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vMag;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 2.0);

          // 亮星增加辉光
          if (vMag < 2.0) {
            float glow = 1.0 - smoothstep(0.0, 0.5, dist * 2.0);
            alpha += glow * 0.3 * (2.0 - vMag);
          }

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    this.starMesh = new THREE.Points(geometry, material);
    this.starMesh.name = 'stars';
    this.scene.add(this.starMesh);
  }

  // ============================================
  // 星座连线
  // ============================================

  createConstellationLines(lines) {
    const group = new THREE.Group();
    group.name = 'constellations';

    const material = new THREE.LineBasicMaterial({
      color: 0x4466aa,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });

    for (const line of lines) {
      const points = [];
      for (const coord of line.coords) {
        const ra = coord.ra * DEG2RAD;
        const dec = coord.dec * DEG2RAD;
        points.push(new THREE.Vector3(
          Math.cos(dec) * Math.cos(ra),
          Math.sin(dec),
          Math.cos(dec) * Math.sin(ra)
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineObj = new THREE.Line(geometry, material);
      group.add(lineObj);
    }

    this.constellationGroup = group;
    this.scene.add(group);
  }

  // ============================================
  // 深空天体标记
  // ============================================

  createDSOMarkers(dsoObjects) {
    const group = new THREE.Group();
    group.name = 'dso';

    for (const obj of dsoObjects) {
      const ra = obj.ra * DEG2RAD;
      const dec = obj.dec * DEG2RAD;
      const pos = new THREE.Vector3(
        Math.cos(dec) * Math.cos(ra),
        Math.sin(dec),
        Math.cos(dec) * Math.sin(ra)
      );

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      ctx.strokeStyle = 'rgba(100, 200, 100, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 32, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(100, 200, 100, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(32, 8); ctx.lineTo(32, 56);
      ctx.moveTo(8, 32); ctx.lineTo(56, 32);
      ctx.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.copy(pos);
      sprite.scale.set(0.03, 0.03, 1);
      sprite.userData = { type: 'dso', data: obj };

      group.add(sprite);
    }

    this.dsoGroup = group;
    this.scene.add(group);
  }

  // ============================================
  // 坐标网格
  // ============================================

  createCoordGrid() {
    const group = new THREE.Group();
    group.name = 'grid';

    const material = new THREE.LineBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.3
    });

    // 赤纬线
    for (let dec = -80; dec <= 80; dec += 20) {
      const points = [];
      for (let ra = 0; ra <= 360; ra += 5) {
        const r = ra * DEG2RAD;
        const d = dec * DEG2RAD;
        points.push(new THREE.Vector3(
          Math.cos(d) * Math.cos(r),
          Math.sin(d),
          Math.cos(d) * Math.sin(r)
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.Line(geometry, material));
    }

    // 赤经线
    for (let ra = 0; ra < 360; ra += 30) {
      const points = [];
      for (let dec = -90; dec <= 90; dec += 5) {
        const r = ra * DEG2RAD;
        const d = dec * DEG2RAD;
        points.push(new THREE.Vector3(
          Math.cos(d) * Math.cos(r),
          Math.sin(d),
          Math.cos(d) * Math.sin(r)
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.Line(geometry, material));
    }

    this.gridGroup = group;
    this.scene.add(group);
  }

  // ============================================
  // 相机控制
  // ============================================

  setCameraOrientation(azimuth, altitude, roll) {
    this.azimuth = azimuth * DEG2RAD;
    this.altitude = altitude * DEG2RAD;

    const cosAlt = Math.cos(this.altitude);
    const sinAlt = Math.sin(this.altitude);
    const cosAz = Math.cos(this.azimuth);
    const sinAz = Math.sin(this.azimuth);

    this.cameraTarget.set(
      cosAlt * sinAz,
      sinAlt,
      -cosAlt * cosAz
    );

    this.camera.lookAt(this.cameraTarget);
  }

  // ============================================
  // 交互
  // ============================================

  _setupInteraction() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = (e.clientX - this.lastMouse.x) / this.width * Math.PI;
        const dy = (e.clientY - this.lastMouse.y) / this.height * Math.PI;

        this.azimuth += dx;
        this.altitude = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.altitude - dy));

        this.setCameraOrientation(
          this.azimuth * RAD2DEG,
          this.altitude * RAD2DEG,
          0
        );

        this.lastMouse = { x: e.clientX, y: e.clientY };
      }
    });

    canvas.addEventListener('mouseup', () => this.isDragging = false);
    canvas.addEventListener('mouseleave', () => this.isDragging = false);

    // 触摸支持
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const dx = (e.touches[0].clientX - this.lastMouse.x) / this.width * Math.PI;
        const dy = (e.touches[0].clientY - this.lastMouse.y) / this.height * Math.PI;

        this.azimuth += dx;
        this.altitude = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.altitude - dy));

        this.setCameraOrientation(
          this.azimuth * RAD2DEG,
          this.altitude * RAD2DEG,
          0
        );

        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      e.preventDefault();
    });

    canvas.addEventListener('touchend', () => this.isDragging = false);

    // 滚轮缩放
    canvas.addEventListener('wheel', (e) => {
      const fov = this.camera.fov + e.deltaY * 0.05;
      this.camera.fov = Math.max(10, Math.min(120, fov));
      this.camera.updateProjectionMatrix();
      e.preventDefault();
    });

    // 点击检测
    canvas.addEventListener('click', (e) => {
      if (this.isDragging) return;

      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      for (const hit of intersects) {
        if (hit.object.userData?.type === 'dso') {
          if (this.onObjectClick) {
            this.onObjectClick(hit.object.userData);
          }
          return;
        }
      }

      // 点击天空
      if (this.onObjectClick) {
        const direction = this.raycaster.ray.direction.clone();
        const ra = Math.atan2(direction.z, direction.x) * RAD2DEG;
        const dec = Math.asin(Math.max(-1, Math.min(1, direction.y))) * RAD2DEG;
        this.onObjectClick({ type: 'sky', ra, dec });
      }
    });
  }

  _setupResize() {
    window.addEventListener('resize', () => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  // ============================================
  // 图层控制
  // ============================================

  toggleLayer(name) {
    this.layers[name] = !this.layers[name];

    switch (name) {
      case 'stars':
        if (this.starMesh) this.starMesh.visible = this.layers.stars;
        break;
      case 'constellations':
        if (this.constellationGroup) this.constellationGroup.visible = this.layers.constellations;
        break;
      case 'dso':
        if (this.dsoGroup) this.dsoGroup.visible = this.layers.dso;
        break;
      case 'grid':
        if (this.gridGroup) this.gridGroup.visible = this.layers.grid;
        break;
      case 'galaxy':
        this.galaxy.toggleVisible();
        break;
      case 'planets':
        this.solarSystem.toggleVisible();
        break;
    }

    return this.layers[name];
  }

  // ============================================
  // 渲染循环
  // ============================================

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // ============================================
  // 清理
  // ============================================

  dispose() {
    this.solarSystem.dispose();
    this.galaxy.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
