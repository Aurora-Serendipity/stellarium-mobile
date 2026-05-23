/**
 * Three.js 星空渲染引擎
 * 高性能点精灵渲染 + 星座连线 + 深空天体标记
 */

import * as THREE from 'three';
import { DEG2RAD, RAD2DEG } from '../astronomy/math.js';

export class SkyRenderer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);
    this.container.appendChild(this.renderer.domElement);

    // 相机初始方向（朝北，地平线上）
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(0, 0, -1);

    // 渲染状态
    this.objects = new Map();
    this.visible = {
      stars: true,
      constellations: true,
      dso: true,
      grid: false,
      labels: false
    };

    // 交互状态
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedObject = null;
    this.onObjectClick = null;

    // 动画
    this.clock = new THREE.Clock();
    this.frameCount = 0;

    // 绑定事件
    this._bindEvents();

    console.log('🎨 渲染器初始化完成');
  }

  // ============================================
  // 星空渲染
  // ============================================

  createStarField(stars) {
    if (this.objects.has('stars')) {
      this.scene.remove(this.objects.get('stars'));
    }

    const count = stars.length;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const starData = new Float32Array(count * 4); // mag, ci, id, con

    for (let i = 0; i < count; i++) {
      const star = stars[i];
      const ra = star.ra * DEG2RAD;
      const dec = star.dec * DEG2RAD;

      // 天球坐标转方向向量
      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.sin(dec);
      const z = Math.cos(dec) * Math.sin(ra);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 颜色
      const color = this._getStarColor(star.colorIndex || 0);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // 大小（星等越小越亮越大）
      const mag = star.magnitude || 6;
      sizes[i] = Math.max(1.0, 8.0 - mag) * 1.5;

      // 数据
      starData[i * 4] = mag;
      starData[i * 4 + 1] = star.colorIndex || 0;
      starData[i * 4 + 2] = i;
      starData[i * 4 + 3] = star.constellation ? 1 : 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('starData', new THREE.BufferAttribute(starData, 4));

    // 自定义 ShaderMaterial 实现点精灵
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec4 starData;
        varying vec3 vColor;
        varying float vMag;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vMag = starData.x;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vMag;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          // 辉光效果
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 1.5);

          // 亮星增强
          if (vMag < 2.0) {
            alpha *= 1.5;
          }

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const points = new THREE.Points(geometry, material);
    points.name = 'stars';
    this.scene.add(points);
    this.objects.set('stars', points);

    console.log(`✅ 星空渲染: ${count} 颗恒星`);
  }

  _getStarColor(colorIndex) {
    // B-V 色指数到 RGB 转换
    const ci = colorIndex || 0;
    if (ci < -0.3) return { r: 0.6, g: 0.8, b: 1.0 };      // O/B 蓝白
    if (ci < 0.0) return { r: 0.85, g: 0.95, b: 1.0 };     // A 白
    if (ci < 0.4) return { r: 1.0, g: 1.0, b: 0.95 };      // F 黄白
    if (ci < 0.8) return { r: 1.0, g: 0.95, b: 0.7 };      // G 黄
    if (ci < 1.2) return { r: 1.0, g: 0.8, b: 0.5 };       // K 橙
    return { r: 1.0, g: 0.6, b: 0.4 };                       // M 红
  }

  // ============================================
  // 星座连线
  // ============================================

  createConstellationLines(linesData) {
    if (this.objects.has('constellations')) {
      this.scene.remove(this.objects.get('constellations'));
    }

    const group = new THREE.Group();
    group.name = 'constellations';

    const material = new THREE.LineBasicMaterial({
      color: 0x4466aa,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });

    for (const [conName, points] of Object.entries(linesData)) {
      if (!points || points.length < 2) continue;

      const vertices = [];
      for (const [ra, dec] of points) {
        const raRad = ra * DEG2RAD;
        const decRad = dec * DEG2RAD;
        vertices.push(
          Math.cos(decRad) * Math.cos(raRad),
          Math.sin(decRad),
          Math.cos(decRad) * Math.sin(raRad)
        );
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    group.visible = this.visible.constellations;
    this.scene.add(group);
    this.objects.set('constellations', group);

    console.log(`✅ 星座连线渲染: ${Object.keys(linesData).length} 个星座`);
  }

  // ============================================
  // 深空天体标记
  // ============================================

  createDSOMarkers(dsoList) {
    if (this.objects.has('dso')) {
      this.scene.remove(this.objects.get('dso'));
    }

    const group = new THREE.Group();
    group.name = 'dso';

    const typeColors = {
      'G': 0xffaa66,   // 星系
      'N': 0x66aaff,   // 星云
      'PN': 0xaa66ff,  // 行星状星云
      'OC': 0xffff66,  // 疏散星团
      'GC': 0xffcc66,  // 球状星团
      'SNR': 0xff6666, // 超新星遗迹
      'DN': 0x666666,  // 暗星云
      'HII': 0xff88aa, // HII区
      'MUL': 0x88ffaa  // 复合
    };

    for (const obj of dsoList) {
      const ra = obj.ra * DEG2RAD;
      const dec = obj.dec * DEG2RAD;
      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.sin(dec);
      const z = Math.cos(dec) * Math.sin(ra);

      const color = typeColors[obj.type] || 0xffffff;
      const size = Math.max(0.003, 0.01 * (8 - (obj.mag || 8)) / 5);

      // 使用圆环表示深空天体
      const geometry = new THREE.RingGeometry(size * 0.7, size, 16);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(x, y, z);
      marker.lookAt(0, 0, 0);
      marker.userData = { type: 'dso', data: obj };

      group.add(marker);
    }

    group.visible = this.visible.dso;
    this.scene.add(group);
    this.objects.set('dso', group);

    console.log(`✅ 深空天体标记: ${dsoList.length} 个`);
  }

  // ============================================
  // 坐标网格
  // ============================================

  createCoordGrid() {
    if (this.objects.has('grid')) {
      this.scene.remove(this.objects.get('grid'));
    }

    const group = new THREE.Group();
    group.name = 'grid';

    // 赤道网格（每隔 15°）
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.3
    });

    // 赤纬圈
    for (let dec = -75; dec <= 75; dec += 15) {
      const points = [];
      for (let ra = 0; ra <= 360; ra += 5) {
        const raRad = ra * DEG2RAD;
        const decRad = dec * DEG2RAD;
        points.push(
          Math.cos(decRad) * Math.cos(raRad),
          Math.sin(decRad),
          Math.cos(decRad) * Math.sin(raRad)
        );
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      group.add(new THREE.Line(geometry, gridMaterial));
    }

    // 赤经线
    for (let ra = 0; ra < 360; ra += 15) {
      const points = [];
      for (let dec = -90; dec <= 90; dec += 5) {
        const raRad = ra * DEG2RAD;
        const decRad = dec * DEG2RAD;
        points.push(
          Math.cos(decRad) * Math.cos(raRad),
          Math.sin(decRad),
          Math.cos(decRad) * Math.sin(raRad)
        );
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      group.add(new THREE.Line(geometry, gridMaterial));
    }

    group.visible = this.visible.grid;
    this.scene.add(group);
    this.objects.set('grid', group);
  }

  // ============================================
  // 相机控制
  // ============================================

  setCameraOrientation(azimuth, altitude, roll = 0) {
    // 方位角(azimuth): 从北顺时针 0-360°
    // 高度角(altitude): 从地平线向上 0-90°
    // roll: 设备旋转

    const azRad = azimuth * DEG2RAD;
    const altRad = altitude * DEG2RAD;

    // 计算观察方向
    const x = Math.cos(altRad) * Math.sin(azRad);
    const y = Math.sin(altRad);
    const z = -Math.cos(altRad) * Math.cos(azRad);

    this.camera.lookAt(x, y, z);

    // 应用 roll
    if (roll !== 0) {
      this.camera.rotateZ(-roll * DEG2RAD);
    }
  }

  setCameraDirection(ra, dec) {
    // 直接设置指向赤道坐标
    const raRad = ra * DEG2RAD;
    const decRad = dec * DEG2RAD;

    const x = Math.cos(decRad) * Math.cos(raRad);
    const y = Math.sin(decRad);
    const z = Math.cos(decRad) * Math.sin(raRad);

    this.camera.lookAt(x, y, z);
  }

  // ============================================
  // 交互
  // ============================================

  _bindEvents() {
    // 触摸/鼠标事件
    this.renderer.domElement.addEventListener('pointerdown', this._onPointerDown.bind(this));
    this.renderer.domElement.addEventListener('pointermove', this._onPointerMove.bind(this));
    this.renderer.domElement.addEventListener('pointerup', this._onPointerUp.bind(this));
    this.renderer.domElement.addEventListener('wheel', this._onWheel.bind(this));

    // 窗口大小变化
    window.addEventListener('resize', this._onResize.bind(this));
  }

  _onPointerDown(event) {
    this.isDragging = true;
    this.lastPointer = { x: event.clientX, y: event.clientY };
  }

  _onPointerMove(event) {
    if (!this.isDragging) return;

    const dx = event.clientX - this.lastPointer.x;
    const dy = event.clientY - this.lastPointer.y;

    // 手动旋转相机（当传感器关闭时）
    if (!this.sensorEnabled) {
      this.camera.rotateY(-dx * 0.005);
      this.camera.rotateX(-dy * 0.005);
    }

    this.lastPointer = { x: event.clientX, y: event.clientY };
  }

  _onPointerUp(event) {
    this.isDragging = false;

    // 点击检测
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 检测深空天体
    const dsoGroup = this.objects.get('dso');
    if (dsoGroup) {
      const intersects = this.raycaster.intersectObjects(dsoGroup.children);
      if (intersects.length > 0) {
        const obj = intersects[0].object.userData.data;
        if (this.onObjectClick) this.onObjectClick(obj);
        return;
      }
    }

    // 检测恒星（简化：检测星空球面）
    const starPoints = this.objects.get('stars');
    if (starPoints) {
      // 使用球面交点估算最近恒星
      const ray = this.raycaster.ray;
      const dir = ray.direction;

      // 找到天球上的交点
      const ra = Math.atan2(dir.z, dir.x) * RAD2DEG;
      const dec = Math.asin(Math.max(-1, Math.min(1, dir.y))) * RAD2DEG;

      if (this.onObjectClick) {
        this.onObjectClick({ type: 'sky', ra, dec });
      }
    }
  }

  _onWheel(event) {
    event.preventDefault();
    const fov = this.camera.fov + event.deltaY * 0.05;
    this.camera.fov = Math.max(10, Math.min(120, fov));
    this.camera.updateProjectionMatrix();
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ============================================
  // 显示控制
  // ============================================

  toggleLayer(name) {
    this.visible[name] = !this.visible[name];
    const obj = this.objects.get(name);
    if (obj) obj.visible = this.visible[name];
    return this.visible[name];
  }

  // ============================================
  // 渲染循环
  // ============================================

  render() {
    this.frameCount++;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
