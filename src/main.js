import * as Astronomy from './astronomy/index.js';
import {
  StarCatalog,
  generateTestStars,
  CONSTELLATIONS,
  CONSTELLATION_LINES,
  dsoCatalog,
  DSO_TYPES
} from './data/index.js';
import { SkyRenderer } from './render/renderer.js';
import { SensorManager } from './sensors/sensors.js';

// ============================================
// 星象馆主应用
// ============================================

class StellariumApp {
  constructor() {
    this.starCatalog = new StarCatalog();
    this.dsoCatalog = dsoCatalog;
    this.renderer = null;
    this.sensors = new SensorManager();

    // 状态
    this.initialized = false;
    this.stars = [];
    this.dsoObjects = [];

    // 时间控制
    this.currentTime = new Date();
    this.timeSpeed = 0; // 0 = 实时, 正数 = 快进, 负数 = 快退
    this.lastFrameTime = performance.now();
    this.isTimeFlowing = false;

    // 位置
    this.latitude = 39.9;  // 默认北京
    this.longitude = 116.4;

    // 传感器状态
    this.sensorEnabled = true;

    // UI 元素
    this.ui = {};
  }

  async init() {
    console.log('🌟 Stellarium Mobile 初始化...');

    // 获取 UI 元素
    this._initUI();

    // 1. 加载数据
    await this._loadData();

    // 2. 初始化渲染器
    const container = document.getElementById('canvas-container');
    this.renderer = new SkyRenderer(container);

    // 3. 创建场景对象
    this.renderer.createStarField(this.stars);
    this.renderer.createConstellationLines(CONSTELLATION_LINES);
    this.renderer.createDSOMarkers(this.dsoObjects);
    this.renderer.createCoordGrid();

    // 4. 设置交互回调
    this.renderer.onObjectClick = (obj) => this._onObjectClick(obj);

    // 5. 启动传感器
    if (this.sensorEnabled) {
      const started = await this.sensors.start();
      if (started) {
        this.sensors.onOrientationChange = (o) => this._onOrientationChange(o);
        this.sensors.onLocationChange = (loc) => this._onLocationChange(loc);
      }
    }

    // 6. 更新初始显示
    this._updateTimeDisplay();
    this._updateLocationDisplay();

    // 7. 隐藏加载界面
    document.getElementById('loading').style.display = 'none';

    this.initialized = true;
    console.log('✅ 初始化完成！');

    // 8. 启动渲染循环
    this._animate();
  }

  _initUI() {
    this.ui.timeDisplay = document.getElementById('time-display');
    this.ui.locationDisplay = document.getElementById('location-display');
    this.ui.objectCount = document.getElementById('object-count');
    this.ui.objectInfo = document.getElementById('object-info');
    this.ui.infoName = document.getElementById('info-name');
    this.ui.infoDetails = document.getElementById('info-details');

    // 显示对象数量
    this.ui.objectCount.textContent = `恒星: 300 | 梅西耶: 110`;
  }

  async _loadData() {
    console.log('📦 加载数据...');

    // 使用测试恒星数据
    this.stars = generateTestStars();
    console.log(`✅ 恒星: ${this.stars.length} 颗`);

    // 深空天体
    this.dsoObjects = this.dsoCatalog.getAll();
    console.log(`✅ 深空天体: ${this.dsoObjects.length} 个`);
  }

  // ============================================
  // 渲染循环
  // ============================================

  _animate() {
    requestAnimationFrame(() => this._animate());

    const now = performance.now();
    const delta = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // 更新时间
    if (this.timeSpeed !== 0) {
      this.currentTime = new Date(
        this.currentTime.getTime() + this.timeSpeed * delta * 1000
      );
      this._updateTimeDisplay();
    }

    // 更新天体位置（如果时间在流动）
    if (this.timeSpeed !== 0 || !this._lastUpdateTime) {
      this._updateCelestialPositions();
      this._lastUpdateTime = this.currentTime;
    }

    // 渲染
    this.renderer.render();
  }

  _updateCelestialPositions() {
    // 这里可以更新行星位置等
    // 目前恒星使用 J2000 坐标，通过岁差计算当前位置
    const jd = Astronomy.time.getJulianDate(this.currentTime);
    // 未来: 更新行星标记位置
  }

  // ============================================
  // 传感器回调
  // ============================================

  _onOrientationChange(orientation) {
    if (!this.sensorEnabled || !this.renderer) return;

    // 更新相机方向
    this.renderer.setCameraOrientation(
      orientation.azimuth,
      orientation.altitude,
      orientation.roll
    );
  }

  _onLocationChange(location) {
    this.latitude = location.latitude;
    this.longitude = location.longitude;
    this._updateLocationDisplay();
  }

  // ============================================
  // 交互回调
  // ============================================

  _onObjectClick(obj) {
    if (obj.type === 'dso') {
      this._showObjectInfo(obj.data);
    } else if (obj.type === 'sky') {
      // 搜索最近的恒星
      const nearest = this._findNearestStar(obj.ra, obj.dec);
      if (nearest) {
        this._showStarInfo(nearest);
      }
    }
  }

  _findNearestStar(ra, dec, maxDist = 2) {
    let nearest = null;
    let minDist = Infinity;

    for (const star of this.stars) {
      const dRa = (star.ra - ra) * Math.cos(dec * Math.PI / 180);
      const dDec = star.dec - dec;
      const dist = Math.sqrt(dRa * dRa + dDec * dDec);

      if (dist < minDist && dist <= maxDist) {
        minDist = dist;
        nearest = star;
      }
    }

    return nearest;
  }

  _showObjectInfo(obj) {
    this.ui.infoName.textContent = `${obj.m} ${obj.name || ''}`;

    const typeNames = {
      'G': '星系', 'N': '星云', 'PN': '行星状星云',
      'OC': '疏散星团', 'GC': '球状星团',
      'SNR': '超新星遗迹', 'MUL': '复合天体'
    };

    this.ui.infoDetails.innerHTML = `
      <div>类型: ${typeNames[obj.type] || obj.type}</div>
      <div>星等: ${obj.mag}</div>
      <div>赤经: ${obj.ra.toFixed(1)}°</div>
      <div>赤纬: ${obj.dec.toFixed(1)}°</div>
      <div>星座: ${obj.con}</div>
      <div style="margin-top:4px;font-size:12px;opacity:0.7;">${obj.desc || ''}</div>
    `;

    this.ui.objectInfo.classList.add('visible');

    // 3秒后自动隐藏
    clearTimeout(this._infoTimeout);
    this._infoTimeout = setTimeout(() => {
      this.ui.objectInfo.classList.remove('visible');
    }, 5000);
  }

  _showStarInfo(star) {
    this.ui.infoName.textContent = star.name || `恒星 #${star.id}`;
    this.ui.infoDetails.innerHTML = `
      <div>星等: ${star.magnitude.toFixed(2)}</div>
      <div>光谱型: ${star.spectralType}</div>
      <div>赤经: ${star.ra.toFixed(2)}°</div>
      <div>赤纬: ${star.dec.toFixed(2)}°</div>
      ${star.constellation ? `<div>星座: ${star.constellation}</div>` : ''}
    `;

    this.ui.objectInfo.classList.add('visible');

    clearTimeout(this._infoTimeout);
    this._infoTimeout = setTimeout(() => {
      this.ui.objectInfo.classList.remove('visible');
    }, 5000);
  }

  // ============================================
  // UI 更新
  // ============================================

  _updateTimeDisplay() {
    const d = this.currentTime;
    const timeStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const hourStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

    let speedStr = '';
    if (this.timeSpeed === 0) speedStr = '实时';
    else if (Math.abs(this.timeSpeed) === 3600) speedStr = '1小时/秒';
    else if (Math.abs(this.timeSpeed) === 86400) speedStr = '1天/秒';
    else speedStr = `${this.timeSpeed}秒/秒`;

    this.ui.timeDisplay.innerHTML = `${timeStr} ${hourStr} <span style="opacity:0.5">(${speedStr})</span>`;
  }

  _updateLocationDisplay() {
    const latDir = this.latitude >= 0 ? 'N' : 'S';
    const lonDir = this.longitude >= 0 ? 'E' : 'W';
    this.ui.locationDisplay.textContent =
      `${Math.abs(this.latitude).toFixed(1)}°${latDir} ${Math.abs(this.longitude).toFixed(1)}°${lonDir}`;
  }

  // ============================================
  // 公共控制接口
  // ============================================

  toggleSensor() {
    this.sensorEnabled = !this.sensorEnabled;
    const btn = document.getElementById('btn-sensor');

    if (this.sensorEnabled) {
      this.sensors.start();
      btn.classList.add('active');
    } else {
      this.sensors.stop();
      btn.classList.remove('active');
    }
  }

  toggleConstellations() {
    const visible = this.renderer.toggleLayer('constellations');
    document.getElementById('btn-constellation').classList.toggle('active', visible);
  }

  toggleDSO() {
    const visible = this.renderer.toggleLayer('dso');
    document.getElementById('btn-dso').classList.toggle('active', visible);
  }

  toggleGrid() {
    const visible = this.renderer.toggleLayer('grid');
    document.getElementById('btn-grid').classList.toggle('active', visible);
  }

  toggleTimeFlow() {
    this.isTimeFlowing = !this.isTimeFlowing;
    this.timeSpeed = this.isTimeFlowing ? 3600 : 0;
    this._updateTimeDisplay();
  }

  resetTime() {
    this.currentTime = new Date();
    this.timeSpeed = 0;
    this.isTimeFlowing = false;
    this._updateTimeDisplay();
  }

  setTimeSpeed(speed) {
    this.timeSpeed = speed;
    this.isTimeFlowing = speed !== 0;
    this._updateTimeDisplay();
  }
}

// ============================================
// 启动应用
// ============================================

const app = new StellariumApp();

// 等待 DOM 加载
document.addEventListener('DOMContentLoaded', () => {
  app.init().catch(err => {
    console.error('初始化失败:', err);
    document.getElementById('loading').innerHTML = `
      <div style="color:#ff6666">❌ 加载失败</div>
      <div style="font-size:12px;margin-top:8px;">${err.message}</div>
    `;
  });
});

// 导出全局访问
window.app = app;
window.Astronomy = Astronomy;
