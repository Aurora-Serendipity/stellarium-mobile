import * as Astronomy from './astronomy/index.js';
import {
  StarCatalog,
  generateTestStars,
  CONSTELLATIONS,
  CONSTELLATION_LINES,
  dsoCatalog,
  DSO_TYPES
} from './data/index.js';

// ============================================
// 星象馆主应用
// ============================================

class StellariumApp {
  constructor() {
    this.starCatalog = new StarCatalog();
    this.dsoCatalog = dsoCatalog;
    this.initialized = false;
    this.stars = [];
    this.constellations = [];
    this.dsoObjects = [];
  }

  async init() {
    console.log('🌟 Stellarium Mobile 初始化中...');

    // 1. 初始化天文引擎
    const now = new Date();
    const jd = Astronomy.time.getJulianDate(now);
    console.log('📅 当前时间:', now.toISOString());
    console.log('🔭 Julian Date:', jd.toFixed(5));

    // 2. 计算太阳位置
    const sunPos = Astronomy.planets.getPlanetPosition('earth', jd);
    console.log('☀️ 太阳赤经:', (sunPos.ra * 180 / Math.PI / 15).toFixed(4), 'h');
    console.log('☀️ 太阳赤纬:', (sunPos.dec * 180 / Math.PI).toFixed(4), '°');

    // 3. 加载星表数据（使用测试数据）
    console.log('⭐ 加载星表数据...');
    this.stars = generateTestStars();
    console.log(`✅ 已加载 ${this.stars.length} 颗恒星`);

    // 4. 加载星座数据
    console.log('🌐 加载星座数据...');
    this.constellations = CONSTELLATIONS;
    console.log(`✅ 已加载 ${this.constellations.length} 个星座`);

    // 5. 加载深空天体
    console.log('🌌 加载深空天体...');
    this.dsoObjects = this.dsoCatalog.getAll();
    console.log(`✅ 已加载 ${this.dsoObjects.length} 个深空天体`);

    // 6. 显示统计信息
    this.showStats();

    this.initialized = true;
    console.log('✅ 初始化完成！');

    // 7. 启动渲染（如果 Three.js 已加载）
    if (window.THREE) {
      this.initRenderer();
    }
  }

  showStats() {
    console.log('\n=== 数据概览 ===');

    // 恒星统计
    const magDist = {};
    for (const star of this.stars) {
      const magBin = Math.floor(star.magnitude);
      magDist[magBin] = (magDist[magBin] || 0) + 1;
    }
    console.log('📊 恒星星等分布:', magDist);

    // 星座统计
    const conDist = {};
    for (const star of this.stars) {
      if (star.constellation) {
        conDist[star.constellation] = (conDist[star.constellation] || 0) + 1;
      }
    }
    console.log('📊 星座恒星数量（前5）:', Object.entries(conDist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5));

    // 深空天体统计
    const typeStats = this.dsoCatalog.getTypeStats();
    console.log('📊 深空天体类型分布:', typeStats);

    // 亮星列表（前10）
    const brightStars = [...this.stars]
      .filter(s => s.name)
      .sort((a, b) => a.magnitude - b.magnitude)
      .slice(0, 10);
    console.log('⭐ 最亮恒星:');
    brightStars.forEach(s => {
      console.log(`  ${s.name}: ${s.magnitude.toFixed(2)}等, 光谱型${s.spectralType}`);
    });

    // 梅西耶天体列表（前10）
    const messier = this.dsoObjects.slice(0, 10);
    console.log('🌌 梅西耶天体（前10）:');
    messier.forEach(obj => {
      console.log(`  ${obj.m} ${obj.name}: ${obj.type}, ${obj.mag}等`);
    });
  }

  initRenderer() {
    console.log('🎨 初始化渲染器...');
    // 渲染器初始化将在 Phase 3 实现
    this.renderer = new SkyRenderer(this);
  }

  /**
   * 搜索天体
   */
  search(query) {
    const results = {
      stars: this.starCatalog.searchByName(query),
      dso: this.dsoCatalog.search(query),
      constellations: this.constellations.filter(c =>
        c.name.includes(query) || c.latin.toLowerCase().includes(query.toLowerCase())
      )
    };
    return results;
  }

  /**
   * 获取当前可见天体
   */
  getVisibleObjects(latitude, longitude, time = new Date()) {
    const jd = Astronomy.time.getJulianDate(time);
    const lst = Astronomy.time.getLocalSiderealTime(jd, longitude);

    // 筛选可见恒星（高度角 > 0）
    const visibleStars = this.stars.filter(star => {
      const alt = Astronomy.coords.equatorialToHorizontal(
        star.ra * Math.PI / 180,
        star.dec * Math.PI / 180,
        lst,
        latitude * Math.PI / 180
      ).altitude;
      return alt > 0;
    });

    // 筛选可见深空天体
    const visibleDSO = this.dsoObjects.filter(obj => {
      const alt = Astronomy.coords.equatorialToHorizontal(
        obj.ra * Math.PI / 180,
        obj.dec * Math.PI / 180,
        lst,
        latitude * Math.PI / 180
      ).altitude;
      return alt > 0;
    });

    return { stars: visibleStars, dso: visibleDSO };
  }
}

// ============================================
// 简单的天空渲染器（占位，Phase 3 实现完整版）
// ============================================

class SkyRenderer {
  constructor(app) {
    this.app = app;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.camera.position.z = 1;

    this.createStarField();
    this.createConstellationLines();
    this.createDSOMarkers();

    this.animate();
  }

  createStarField() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (const star of this.app.stars) {
      // 将赤道坐标转换为三维方向向量
      const ra = star.ra * Math.PI / 180;
      const dec = star.dec * Math.PI / 180;

      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.cos(dec) * Math.sin(ra);
      const z = Math.sin(dec);

      positions.push(x, y, z);

      // 根据色指数计算颜色
      const color = this.getStarColor(star.colorIndex);
      colors.push(color.r, color.g, color.b);

      // 根据星等计算大小
      const size = Math.max(0.5, 5 - star.magnitude) * 2;
      sizes.push(size);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9
    });

    this.starField = new THREE.Points(geometry, material);
    this.scene.add(this.starField);
  }

  getStarColor(colorIndex) {
    // 简化色温映射
    if (colorIndex < -0.3) return { r: 0.7, g: 0.8, b: 1.0 }; // O/B 型 - 蓝白
    if (colorIndex < 0.0) return { r: 0.9, g: 0.95, b: 1.0 }; // A 型 - 白
    if (colorIndex < 0.4) return { r: 1.0, g: 1.0, b: 0.9 }; // F 型 - 黄白
    if (colorIndex < 0.8) return { r: 1.0, g: 0.95, b: 0.7 }; // G 型 - 黄
    if (colorIndex < 1.2) return { r: 1.0, g: 0.8, b: 0.5 }; // K 型 - 橙
    return { r: 1.0, g: 0.6, b: 0.4 }; // M 型 - 红
  }

  createConstellationLines() {
    const material = new THREE.LineBasicMaterial({
      color: 0x4444ff,
      transparent: true,
      opacity: 0.3
    });

    for (const [con, lines] of Object.entries(CONSTELLATION_LINES)) {
      const points = [];
      for (const [ra, dec] of lines) {
        const raRad = ra * Math.PI / 180;
        const decRad = dec * Math.PI / 180;
        const x = Math.cos(decRad) * Math.cos(raRad);
        const y = Math.cos(decRad) * Math.sin(raRad);
        const z = Math.sin(decRad);
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
    }
  }

  createDSOMarkers() {
    for (const obj of this.app.dsoObjects) {
      const ra = obj.ra * Math.PI / 180;
      const dec = obj.dec * Math.PI / 180;
      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.cos(dec) * Math.sin(ra);
      const z = Math.sin(dec);

      const geometry = new THREE.SphereGeometry(0.01, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: DSO_TYPES[obj.type]?.color || 0xffffff,
        transparent: true,
        opacity: 0.7
      });

      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(x, y, z);
      this.scene.add(marker);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // 缓慢旋转
    if (this.starField) {
      this.starField.rotation.y += 0.0002;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================
// 启动应用
// ============================================

const app = new StellariumApp();

// 等待 DOM 和 Three.js 加载
document.addEventListener('DOMContentLoaded', () => {
  // 检查 Three.js 是否已加载
  if (window.THREE) {
    app.init();
  } else {
    // 动态加载 Three.js
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
    script.type = 'module';
    script.onload = () => app.init();
    document.head.appendChild(script);
  }
});

// 导出全局访问
window.Stellarium = app;
window.Astronomy = Astronomy;
