/**
 * 人造卫星轨道渲染
 * 支持 ISS 等明亮卫星
 */

import * as THREE from "three";

// TLE 数据格式 (简化版)
const SATELLITES = {
  iss: {
    name: "国际空间站 (ISS)",
    noradId: "25544",
    // 简化的轨道参数 (实际应使用 TLE 数据)
    inclination: 51.64,
    period: 92.68, // 分钟
    altitude: 408, // km
  },
};

export class SatelliteRenderer {
  constructor(scene) {
    this.scene = scene;
    this.satellites = new Map();
    this.visible = false;
    this.trailLength = 50;
  }

  createMarkers() {
    for (const [key, sat] of Object.entries(SATELLITES)) {
      const group = new THREE.Group();
      group.name = `satellite_${key}`;

      // 卫星标记
      const geometry = new THREE.SphereGeometry(0.008, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      // 辉光
      const glowGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);

      // 标签
      const label = this._createLabel(sat.name);
      group.add(label);

      // 轨道轨迹
      const trailGeometry = new THREE.BufferGeometry();
      const trailPositions = new Float32Array(this.trailLength * 3);
      trailGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(trailPositions, 3),
      );

      const trailMaterial = new THREE.LineBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.4,
      });

      const trail = new THREE.Line(trailGeometry, trailMaterial);
      trail.frustumCulled = false;
      group.add(trail);

      group.visible = false;
      this.scene.add(group);

      this.satellites.set(key, {
        group,
        data: sat,
        trail: [],
        trailMesh: trail,
      });
    }

    console.log("✅ 卫星标记创建完成");
  }

  _createLabel(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    if (ctx.roundRect) {
      ctx.roundRect(4, 4, 248, 56, 8);
    } else {
      // Fallback for browsers without roundRect
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(244, 4);
      ctx.quadraticCurveTo(252, 4, 252, 12);
      ctx.lineTo(252, 52);
      ctx.quadraticCurveTo(252, 60, 244, 60);
      ctx.lineTo(12, 60);
      ctx.quadraticCurveTo(4, 60, 4, 52);
      ctx.lineTo(4, 12);
      ctx.quadraticCurveTo(4, 4, 12, 4);
      ctx.closePath();
    }
    ctx.fill();

    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#88ccff";
    ctx.textAlign = "center";
    ctx.fillText("🛰️", 40, 38);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, 150, 38);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.15, 0.04, 1);
    sprite.position.y = 0.04;

    return sprite;
  }

  /**
   * 更新卫星位置 (简化轨道计算)
   */
  updatePositions(jd, latitude, longitude) {
    if (!this.visible) return;

    for (const [key, sat] of this.satellites) {
      // 简化的轨道计算
      const minutesSinceEpoch = (jd - 2459000.5) * 24 * 60;
      const orbitAngle =
        ((minutesSinceEpoch % sat.data.period) / sat.data.period) * Math.PI * 2;

      // 轨道平面 (简化)
      const inclination = (sat.data.inclination * Math.PI) / 180;
      const ra = orbitAngle;
      const dec = Math.asin(Math.sin(inclination) * Math.sin(orbitAngle));

      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.sin(dec);
      const z = Math.cos(dec) * Math.sin(ra);

      sat.group.position.set(x, y, z);
      sat.group.visible = true;

      // 更新轨迹
      sat.trail.push(new THREE.Vector3(x, y, z));
      if (sat.trail.length > this.trailLength) {
        sat.trail.shift();
      }

      // 更新轨迹几何
      const positions = sat.trailMesh.geometry.attributes.position.array;
      for (let i = 0; i < sat.trail.length; i++) {
        positions[i * 3] = sat.trail[i].x;
        positions[i * 3 + 1] = sat.trail[i].y;
        positions[i * 3 + 2] = sat.trail[i].z;
      }
      sat.trailMesh.geometry.attributes.position.needsUpdate = true;
    }
  }

  toggleVisible() {
    this.visible = !this.visible;
    for (const sat of this.satellites.values()) {
      sat.group.visible = this.visible;
    }
    return this.visible;
  }
}
