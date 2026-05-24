/**
 * 性能优化管理器
 * LOD、视锥剔除、动态加载
 */

import * as THREE from "three";

export class PerformanceManager {
  constructor(renderer, camera) {
    this.renderer = renderer;
    this.camera = camera;
    this.frustum = new THREE.Frustum();
    this.projScreenMatrix = new THREE.Matrix4();

    // 性能统计
    this.stats = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      visibleStars: 0,
    };

    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fpsUpdateTime = 0;

    // LOD 配置
    this.lodLevels = {
      near: { distance: 0.3, starCount: 1000 },
      mid: { distance: 0.6, starCount: 500 },
      far: { distance: 1.0, starCount: 200 },
    };

    // 动态加载
    this.loadedChunks = new Set();
    this.chunkSize = 30; // 度
  }

  /**
   * 更新视锥
   */
  updateFrustum() {
    this.projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse,
    );
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }

  /**
   * 检查对象是否在视锥内
   */
  isInView(position, radius = 0) {
    const sphere = new THREE.Sphere(position, radius);
    return this.frustum.intersectsSphere(sphere);
  }

  /**
   * 更新 LOD
   */
  updateLOD(starMesh, cameraDirection) {
    if (!starMesh) return;

    const positions = starMesh.geometry.attributes.position.array;
    const sizes = starMesh.geometry.attributes.size.array;
    const originalSizes = starMesh.userData.originalSizes;

    if (!originalSizes) {
      // 首次保存原始大小
      starMesh.userData.originalSizes = new Float32Array(sizes);
      return;
    }

    let visibleCount = 0;
    const cameraPos = this.camera.position;
    const _pos = new THREE.Vector3(); // 复用以减少 GC 压力

    for (let i = 0; i < sizes.length; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      _pos.set(x, y, z);
      const distance = _pos.distanceTo(cameraPos);
      const inView = this.isInView(_pos, 0.01);

      if (inView) {
        visibleCount++;
        // 根据距离调整大小（最小保持 50%）
        const distFactor = Math.max(0.5, 1 - distance);
        sizes[i] = originalSizes[i] * distFactor;
      } else {
        sizes[i] = 0; // 隐藏
      }
    }

    starMesh.geometry.attributes.size.needsUpdate = true;
    this.stats.visibleStars = visibleCount;
  }

  /**
   * 动态加载星表区块
   */
  getVisibleChunks(cameraDirection, fov) {
    const chunks = [];
    const ra =
      (Math.atan2(cameraDirection.z, cameraDirection.x) * 180) / Math.PI;
    const dec =
      (Math.asin(Math.max(-1, Math.min(1, cameraDirection.y))) * 180) / Math.PI;

    // 计算视野覆盖的区块
    const fovDegrees = (fov * 180) / Math.PI;
    const chunkRange = Math.ceil(fovDegrees / this.chunkSize) + 1;

    for (let dRa = -chunkRange; dRa <= chunkRange; dRa++) {
      for (let dDec = -chunkRange; dDec <= chunkRange; dDec++) {
        const chunkRa =
          Math.floor((ra + dRa * this.chunkSize) / this.chunkSize) *
          this.chunkSize;
        const chunkDec =
          Math.floor((dec + dDec * this.chunkSize) / this.chunkSize) *
          this.chunkSize;
        const chunkKey = `${chunkRa},${chunkDec}`;

        if (!this.loadedChunks.has(chunkKey)) {
          chunks.push({ ra: chunkRa, dec: chunkDec, key: chunkKey });
        }
      }
    }

    return chunks;
  }

  markChunkLoaded(chunkKey) {
    this.loadedChunks.add(chunkKey);
  }

  /**
   * 更新性能统计
   */
  updateStats() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    this.frameCount++;
    this.fpsUpdateTime += delta;

    if (this.fpsUpdateTime >= 1000) {
      this.stats.fps = Math.round(
        (this.frameCount * 1000) / this.fpsUpdateTime,
      );
      this.stats.frameTime = Math.round(delta);
      this.frameCount = 0;
      this.fpsUpdateTime = 0;

      // 获取渲染器统计
      const info = this.renderer.info;
      this.stats.drawCalls = info.render.calls;
      this.stats.triangles = info.render.triangles;
    }
  }

  /**
   * 获取性能报告
   */
  getReport() {
    return {
      ...this.stats,
      loadedChunks: this.loadedChunks.size,
    };
  }

  /**
   * 自适应质量
   */
  adaptQuality() {
    if (this.stats.fps < 30) {
      // 降低质量
      return "low";
    } else if (this.stats.fps > 55) {
      // 提高质量
      return "high";
    }
    return "medium";
  }

  /**
   * 清理
   */
  dispose() {
    this.loadedChunks.clear();
  }
}
