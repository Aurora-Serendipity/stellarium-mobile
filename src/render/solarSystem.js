/**
 * 太阳系天体渲染
 * 太阳、月球、行星实时位置显示
 */

import * as THREE from "three";
import { DEG2RAD, RAD2DEG } from "../astronomy/math.js";

// 行星视觉参数
const PLANET_VISUALS = {
  sun: {
    color: 0xffdd44,
    emissive: 0xffaa00,
    size: 0.025,
    glowSize: 0.08,
    glowColor: 0xffaa00,
    name: "太阳",
    symbol: "☉",
  },
  moon: {
    color: 0xdddddd,
    emissive: 0x444444,
    size: 0.018,
    glowSize: 0.03,
    glowColor: 0xffffff,
    name: "月球",
    symbol: "☽",
  },
  mercury: {
    color: 0x8c8c8c,
    size: 0.008,
    glowSize: 0.015,
    name: "水星",
    symbol: "☿",
  },
  venus: {
    color: 0xe6e6b8,
    size: 0.012,
    glowSize: 0.02,
    name: "金星",
    symbol: "♀",
  },
  mars: {
    color: 0xcc4422,
    size: 0.01,
    glowSize: 0.018,
    name: "火星",
    symbol: "♂",
  },
  jupiter: {
    color: 0xd4a574,
    size: 0.02,
    glowSize: 0.035,
    name: "木星",
    symbol: "♃",
  },
  saturn: {
    color: 0xf0d080,
    size: 0.018,
    glowSize: 0.03,
    name: "土星",
    symbol: "♄",
    hasRings: true,
  },
};

export class SolarSystemRenderer {
  constructor(scene) {
    this.scene = scene;
    this.objects = new Map();
    this.labels = new Map();
    this.visible = true;
  }

  /**
   * 创建太阳系天体标记
   */
  createMarkers() {
    for (const [key, visual] of Object.entries(PLANET_VISUALS)) {
      const group = new THREE.Group();
      group.name = `planet_${key}`;

      // 主球体
      const geometry = new THREE.SphereGeometry(visual.size, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: visual.color,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { type: "planet", planetKey: key, visual: visual };
      group.add(mesh);

      // 辉光效果
      if (visual.glowSize) {
        const glowGeometry = new THREE.SphereGeometry(visual.glowSize, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: visual.glowColor || visual.color,
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
      }

      // 土星环
      if (visual.hasRings) {
        const ringGeometry = new THREE.RingGeometry(
          visual.size * 1.4,
          visual.size * 2.2,
          32,
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xc4a060,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      }

      // 标签
      const label = this._createLabel(visual);
      group.add(label);

      group.visible = false; // 初始隐藏
      this.scene.add(group);
      this.objects.set(key, group);
    }

    console.log("✅ 太阳系天体标记创建完成");
  }

  _createLabel(visual) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    if (ctx.roundRect) {
      ctx.roundRect(4, 4, 120, 56, 8);
    } else {
      // Fallback for browsers without roundRect
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(116, 4);
      ctx.quadraticCurveTo(124, 4, 124, 12);
      ctx.lineTo(124, 52);
      ctx.quadraticCurveTo(124, 60, 116, 60);
      ctx.lineTo(12, 60);
      ctx.quadraticCurveTo(4, 60, 4, 52);
      ctx.lineTo(4, 12);
      ctx.quadraticCurveTo(4, 4, 12, 4);
      ctx.closePath();
    }
    ctx.fill();

    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(visual.symbol, 64, 30);

    ctx.font = "14px sans-serif";
    ctx.fillText(visual.name, 64, 50);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.08, 0.04, 1);
    sprite.position.y = 0.05;

    return sprite;
  }

  /**
   * 更新天体位置
   */
  updatePositions(positions) {
    for (const [key, pos] of Object.entries(positions)) {
      const obj = this.objects.get(key);
      if (!obj) continue;

      const ra = pos.ra * DEG2RAD;
      const dec = pos.dec * DEG2RAD;

      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.sin(dec);
      const z = Math.cos(dec) * Math.sin(ra);

      obj.position.set(x, y, z);
      obj.visible = this.visible && pos.altitude > 0; // 只在地平线以上显示

      // 让标记面向相机
      obj.lookAt(0, 0, 0);
    }
  }

  /**
   * 更新月相
   */
  updateMoonPhase(phase) {
    const moon = this.objects.get("moon");
    if (!moon) return;

    // phase: 0=新月, 0.5=满月
    const mainMesh = moon.children[0];
    if (mainMesh) {
      // 根据月相调整亮度
      const brightness = 0.3 + 0.7 * Math.abs(Math.cos(phase * Math.PI));
      mainMesh.material.opacity = brightness;
    }
  }

  toggleVisible() {
    this.visible = !this.visible;
    for (const obj of this.objects.values()) {
      obj.visible = this.visible;
    }
    return this.visible;
  }

  dispose() {
    for (const obj of this.objects.values()) {
      this.scene.remove(obj);
    }
    this.objects.clear();
  }
}
