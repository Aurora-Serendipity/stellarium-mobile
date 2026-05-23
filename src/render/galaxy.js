/**
 * 银河背景渲染
 * 程序化生成银河系光带
 */

import * as THREE from 'three';

export class GalaxyRenderer {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.visible = true;
  }

  create() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }

    // 创建银河粒子系统
    const particleCount = 8000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // 银河参数
    const galaxyRadius = 0.8;
    const galaxyThickness = 0.15;

    for (let i = 0; i < particleCount; i++) {
      // 使用螺旋分布
      const angle = Math.random() * Math.PI * 4; // 2圈螺旋
      const radius = Math.random() * galaxyRadius;
      const spiralOffset = angle * 0.3;

      const x = Math.cos(angle + spiralOffset) * radius;
      const z = Math.sin(angle + spiralOffset) * radius;
      const y = (Math.random() - 0.5) * galaxyThickness * (1 - radius / galaxyRadius);

      // 银河坐标系转换到天球坐标
      // 银道坐标: 银经 l, 银纬 b
      // 银心方向: 赤经 266.4°, 赤纬 -29.0°
      const galacticCenterRA = 266.4 * Math.PI / 180;
      const galacticCenterDec = -29.0 * Math.PI / 180;
      const galacticTilt = 60.0 * Math.PI / 180; // 银道面与赤道面夹角

      // 简化的坐标转换
      const cosTilt = Math.cos(galacticTilt);
      const sinTilt = Math.sin(galacticTilt);

      const x1 = x;
      const y1 = y * cosTilt - z * sinTilt;
      const z1 = y * sinTilt + z * cosTilt;

      // 旋转到银心位置
      const cosGC = Math.cos(galacticCenterDec);
      const sinGC = Math.sin(galacticCenterDec);

      const x2 = x1 * cosGC - y1 * sinGC;
      const y2 = x1 * sinGC + y1 * cosGC;
      const z2 = z1;

      const cosRA = Math.cos(galacticCenterRA);
      const sinRA = Math.sin(galacticCenterRA);

      const x3 = x2 * cosRA - z2 * sinRA;
      const y3 = y2;
      const z3 = x2 * sinRA + z2 * cosRA;

      positions[i * 3] = x3;
      positions[i * 3 + 1] = y3;
      positions[i * 3 + 2] = z3;

      // 颜色：中心偏黄，边缘偏蓝
      const distFromCenter = radius / galaxyRadius;
      const r = 0.8 + 0.2 * (1 - distFromCenter);
      const g = 0.7 + 0.2 * distFromCenter;
      const b = 0.9 - 0.3 * distFromCenter;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;

      // 大小：中心更亮更大
      sizes[i] = 0.002 + 0.004 * (1 - distFromCenter) + Math.random() * 0.002;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: window.devicePixelRatio || 1 }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (400.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 2.0) * 0.6;

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    this.mesh = new THREE.Points(geometry, material);
    this.mesh.name = 'galaxy';
    this.scene.add(this.mesh);

    console.log('✅ 银河背景创建完成');
  }

  toggleVisible() {
    this.visible = !this.visible;
    if (this.mesh) this.mesh.visible = this.visible;
    return this.visible;
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}
