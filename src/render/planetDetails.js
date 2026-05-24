/**
 * 行星细节渲染
 * 木星四大卫星、土星环、月球表面特征
 */

import * as THREE from "three";

// 木星卫星数据
const JUPITER_MOONS = [
  {
    name: "木卫一 (Io)",
    distance: 0.003,
    period: 1.769,
    size: 0.0025,
    color: 0xffff99,
  },
  {
    name: "木卫二 (Europa)",
    distance: 0.005,
    period: 3.551,
    size: 0.0022,
    color: 0xaaccff,
  },
  {
    name: "木卫三 (Ganymede)",
    distance: 0.008,
    period: 7.155,
    size: 0.0035,
    color: 0x887766,
  },
  {
    name: "木卫四 (Callisto)",
    distance: 0.014,
    period: 16.689,
    size: 0.0032,
    color: 0x554433,
  },
];

// 土星环数据
const SATURN_RINGS = [
  { inner: 1.3, outer: 1.5, opacity: 0.8, color: 0xc4a060 }, // A环
  { inner: 1.1, outer: 1.25, opacity: 0.6, color: 0xb89050 }, // B环
  { inner: 1.0, outer: 1.08, opacity: 0.4, color: 0x8a7040 }, // C环 (暗淡)
  { inner: 1.95, outer: 2.1, opacity: 0.3, color: 0xa08050 }, // F环
];

export class PlanetDetailsRenderer {
  constructor(scene) {
    this.scene = scene;
    this.jupiterMoons = [];
    this.saturnRings = [];
    this.moonFeatures = null;
    this.jupiterGroup = null;
    this.saturnRingGroup = null;
  }

  /**
   * 创建木星卫星系统
   */
  createJupiterMoons() {
    const group = new THREE.Group();
    group.name = "jupiter_moons";

    for (const moonData of JUPITER_MOONS) {
      const moonGroup = new THREE.Group();

      // 卫星本体
      const geometry = new THREE.SphereGeometry(moonData.size, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: moonData.color,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      moonGroup.add(mesh);

      // 轨道线
      const orbitGeometry = new THREE.RingGeometry(
        moonData.distance - 0.0002,
        moonData.distance + 0.0002,
        64,
      );
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      moonGroup.add(orbit);

      moonGroup.userData = { ...moonData, angle: Math.random() * Math.PI * 2 };
      group.add(moonGroup);
      this.jupiterMoons.push(moonGroup);
    }

    // 初始隐藏，等木星位置更新后显示
    group.visible = false;
    this.scene.add(group);
    this.jupiterGroup = group;
    return group;
  }

  /**
   * 更新木星卫星位置（跟随木星）
   */
  updateJupiterMoons(jd, jupiterWorldPos) {
    if (!this.jupiterGroup) return;

    // 将卫星组移动到木星位置
    if (jupiterWorldPos) {
      this.jupiterGroup.position.copy(jupiterWorldPos);
      this.jupiterGroup.visible = true;
    }

    for (const moon of this.jupiterMoons) {
      const data = moon.userData;
      const angle = (jd / data.period) * Math.PI * 2 + data.angle;

      moon.position.x = Math.cos(angle) * data.distance;
      moon.position.z = Math.sin(angle) * data.distance;
    }
  }

  /**
   * 创建土星环系统
   */
  createSaturnRings() {
    const group = new THREE.Group();
    group.name = "saturn_rings";

    for (const ringData of SATURN_RINGS) {
      const geometry = new THREE.RingGeometry(
        ringData.inner * 0.015,
        ringData.outer * 0.015,
        64,
      );
      const material = new THREE.MeshBasicMaterial({
        color: ringData.color,
        transparent: true,
        opacity: ringData.opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = (27 * Math.PI) / 180; // 土星倾角

      group.add(ring);
      this.saturnRings.push(ring);
    }

    group.visible = false;
    this.scene.add(group);
    this.saturnRingGroup = group;
    return group;
  }

  /**
   * 创建月球表面特征 (简化版)
   */
  createMoonFeatures() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // 基础颜色
    ctx.fillStyle = "#888888";
    ctx.fillRect(0, 0, 512, 256);

    // 月海 (暗区)
    const maria = [
      { x: 100, y: 80, r: 40, name: "Mare Imbrium" },
      { x: 200, y: 120, r: 50, name: "Oceanus Procellarum" },
      { x: 300, y: 90, r: 35, name: "Mare Tranquillitatis" },
      { x: 350, y: 140, r: 30, name: "Mare Crisium" },
      { x: 150, y: 180, r: 25, name: "Mare Humorum" },
      { x: 400, y: 100, r: 20, name: "Mare Serenitatis" },
    ];

    for (const mare of maria) {
      const gradient = ctx.createRadialGradient(
        mare.x,
        mare.y,
        0,
        mare.x,
        mare.y,
        mare.r,
      );
      gradient.addColorStop(0, "#555555");
      gradient.addColorStop(1, "#777777");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mare.x, mare.y, mare.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 陨石坑
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = 2 + Math.random() * 8;

      ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, 0.5)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // 陨石坑边缘亮边
      ctx.strokeStyle = "rgba(150, 150, 150, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * 更新月球纹理 (根据相位)
   */
  updateMoonPhase(moonMesh, phase) {
    if (!this.moonFeatures) {
      this.moonFeatures = this.createMoonFeatures();
    }

    // 创建相位遮罩
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // 绘制月球表面
    ctx.drawImage(this.moonFeatures.image, 0, 0);

    // 应用相位阴影
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.beginPath();

    const phaseAngle = phase * Math.PI * 2;
    const terminatorX = 256 + Math.cos(phaseAngle) * 256;

    if (phase < 0.5) {
      // 新月到满月
      ctx.ellipse(
        256,
        128,
        Math.abs(terminatorX - 256),
        128,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else {
      // 满月到新月
      ctx.rect(0, 0, 512, 256);
      ctx.globalCompositeOperation = "destination-out";
      ctx.ellipse(
        256,
        128,
        Math.abs(terminatorX - 256),
        128,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    const phaseTexture = new THREE.CanvasTexture(canvas);

    if (moonMesh) {
      moonMesh.material.map = phaseTexture;
      moonMesh.material.needsUpdate = true;
    }
  }

  dispose() {
    for (const moon of this.jupiterMoons) {
      this.scene.remove(moon);
    }
    for (const ring of this.saturnRings) {
      this.scene.remove(ring);
    }
    this.jupiterMoons = [];
    this.saturnRings = [];
  }
}
