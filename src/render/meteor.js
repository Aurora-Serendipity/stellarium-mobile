/**
 * 流星雨渲染器
 * 支持主要流星雨活动
 */

import * as THREE from "three";

// 主要流星雨数据
const METEOR_SHOWERS = [
  {
    name: "象限仪座流星雨",
    radiant: { ra: 230, dec: 49 },
    peak: "0103",
    rate: 120,
    active: "1228-0112",
  },
  {
    name: "天琴座流星雨",
    radiant: { ra: 271, dec: 34 },
    peak: "0422",
    rate: 18,
    active: "0416-0425",
  },
  {
    name: "宝瓶座η流星雨",
    radiant: { ra: 338, dec: -1 },
    peak: "0505",
    rate: 50,
    active: "0419-0528",
  },
  {
    name: "英仙座流星雨",
    radiant: { ra: 48, dec: 58 },
    peak: "0812",
    rate: 100,
    active: "0717-0824",
  },
  {
    name: "猎户座流星雨",
    radiant: { ra: 95, dec: 16 },
    peak: "1021",
    rate: 20,
    active: "1002-1107",
  },
  {
    name: "狮子座流星雨",
    radiant: { ra: 152, dec: 22 },
    peak: "1117",
    rate: 15,
    active: "1106-1130",
  },
  {
    name: "双子座流星雨",
    radiant: { ra: 112, dec: 33 },
    peak: "1214",
    rate: 150,
    active: "1204-1217",
  },
  {
    name: "小熊座流星雨",
    radiant: { ra: 217, dec: 76 },
    peak: "1222",
    rate: 10,
    active: "1217-1226",
  },
];

export class MeteorRenderer {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.meteors = [];
    this.radiant = null;
    this.rate = 0;
    this.lastSpawn = 0;
  }

  /**
   * 检查当前是否有流星雨活动
   */
  checkActivity(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = month + day;

    for (const shower of METEOR_SHOWERS) {
      const [start, end] = shower.active.split("-");
      let isActive = false;
      let daysFromPeak = 999;

      // 处理跨年活动期（如 1228-0112）
      if (parseInt(start) > parseInt(end)) {
        // 跨年：如 1228 到 0112
        isActive = dateStr >= start || dateStr <= end;
      } else {
        // 同一年
        isActive = dateStr >= start && dateStr <= end;
      }

      if (isActive) {
        // 计算活动强度 (峰值时最强)
        const peak = shower.peak;
        // 处理峰值跨年的情况
        if (parseInt(start) > parseInt(end) && dateStr >= start) {
          // 在活动期前段（如12月），峰值可能在明年1月
          daysFromPeak = Math.abs(parseInt(dateStr) - parseInt(peak));
          if (parseInt(dateStr) > 1200 && parseInt(peak) < 200) {
            daysFromPeak = Math.abs(parseInt(dateStr) - 1231 + parseInt(peak));
          }
        } else {
          daysFromPeak = Math.abs(parseInt(dateStr) - parseInt(peak));
        }
        const intensity = Math.max(0.1, 1 - daysFromPeak / 7);

        return {
          ...shower,
          intensity,
          isPeak: dateStr === peak,
        };
      }
    }

    return null;
  }

  /**
   * 开始显示流星雨
   */
  start(shower) {
    this.active = true;
    this.radiant = shower.radiant;
    this.rate = shower.rate * shower.intensity;
    this.meteors = [];
    console.log(
      `🌠 ${shower.name} 开始，强度: ${(shower.intensity * 100).toFixed(0)}%`,
    );
  }

  stop() {
    this.active = false;
    // 清除所有流星
    for (const meteor of this.meteors) {
      this.scene.remove(meteor.mesh);
    }
    this.meteors = [];
  }

  /**
   * 更新流星
   */
  update(deltaTime) {
    if (!this.active) return;

    // 生成新流星
    this.lastSpawn += deltaTime;
    const spawnInterval = 60 / this.rate; // 每秒生成数量

    if (this.lastSpawn > spawnInterval) {
      this._spawnMeteor();
      this.lastSpawn = 0;
    }

    // 更新现有流星
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const meteor = this.meteors[i];
      meteor.life -= deltaTime;

      if (meteor.life <= 0) {
        this.scene.remove(meteor.mesh);
        this.meteors.splice(i, 1);
        continue;
      }

      // 移动流星
      meteor.mesh.position.add(
        meteor.velocity.clone().multiplyScalar(deltaTime),
      );

      // 淡出效果
      const alpha = meteor.life / meteor.maxLife;
      meteor.mesh.material.opacity = alpha;
    }
  }

  _spawnMeteor() {
    if (!this.radiant) return;

    // 从辐射点方向生成
    const ra = (this.radiant.ra * Math.PI) / 180;
    const dec = (this.radiant.dec * Math.PI) / 180;

    // 随机偏移
    const spread = 0.3; // 辐射点扩散角度
    const offsetRa = (Math.random() - 0.5) * spread;
    const offsetDec = (Math.random() - 0.5) * spread;

    const startRa = ra + offsetRa;
    const startDec = dec + offsetDec;

    // 起始位置 (天球远处)
    const startDist = 1.5;
    const startPos = new THREE.Vector3(
      startDist * Math.cos(startDec) * Math.cos(startRa),
      startDist * Math.sin(startDec),
      startDist * Math.cos(startDec) * Math.sin(startRa),
    );

    // 速度方向 (远离辐射点)
    const speed = 0.3 + Math.random() * 0.4;
    const velocity = new THREE.Vector3(
      Math.cos(startDec) * Math.cos(startRa),
      Math.sin(startDec),
      Math.cos(startDec) * Math.sin(startRa),
    ).multiplyScalar(-speed);

    // 创建流星几何
    const geometry = new THREE.CylinderGeometry(0.001, 0.003, 0.05, 4);
    geometry.rotateX(Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(startPos);
    mesh.lookAt(startPos.clone().add(velocity));

    this.scene.add(mesh);

    this.meteors.push({
      mesh,
      velocity,
      life: 0.5 + Math.random() * 1.0,
      maxLife: 1.5,
    });
  }
}
