import * as THREE from "three";
import * as Astronomy from "./astronomy/index.js";
import {
  StarCatalog,
  generateTestStars,
  generateExtendedStars,
  mergeStarCatalogs,
  CONSTELLATIONS,
  CONSTELLATION_LINES,
  dsoCatalog,
} from "./data/index.js";
import { SkyRenderer } from "./render/renderer.js";
import { SensorManager } from "./sensors/sensors.js";
import { SearchEngine } from "./search/search.js";
import { SettingsManager } from "./settings/settings.js";
import { SettingsUI } from "./settings/settingsUI.js";
import { MeteorRenderer } from "./render/meteor.js";
import { SatelliteRenderer } from "./render/satellite.js";
import { AtmosphereRenderer } from "./render/atmosphere.js";
import { PlanetDetailsRenderer } from "./render/planetDetails.js";
import { PerformanceManager } from "./render/performance.js";

// ============================================
// 星象馆主应用 - 完整版
// ============================================

class StellariumApp {
  constructor() {
    this.starCatalog = new StarCatalog();
    this.dsoCatalog = dsoCatalog;
    this.renderer = null;
    this.sensors = new SensorManager();
    this.search = null;
    this.settings = new SettingsManager();
    this.settingsUI = null;
    this.meteorRenderer = null;
    this.satelliteRenderer = null;
    this.atmosphere = null;
    this.planetDetails = null;
    this.performance = null;

    this.initialized = false;
    this.stars = [];
    this.allStars = []; // 包含扩展星表
    this.dsoObjects = [];

    // 时间
    this.currentTime = new Date();
    this.timeSpeed = 0;
    this.lastFrameTime = performance.now();
    this.isTimeFlowing = false;

    // 位置
    this.latitude = 39.9;
    this.longitude = 116.4;

    // 传感器
    this.sensorEnabled = true;

    // UI
    this.ui = {};
    this.showInfo = true;
  }

  async init() {
    console.log("🌟 Stellarium Mobile 完整版初始化...");

    this._initUI();
    await this._loadData();

    // 初始化渲染器
    const container = document.getElementById("canvas-container");
    this.renderer = new SkyRenderer(container);

    // 性能管理
    this.performance = new PerformanceManager(
      this.renderer.renderer,
      this.renderer.camera,
    );

    // 创建场景
    this.renderer.createStarField(this.stars);
    this.renderer.createConstellationLines(CONSTELLATION_LINES);
    this.renderer.createDSOMarkers(this.dsoObjects);
    this.renderer.createCoordGrid();
    this.renderer.solarSystem.createMarkers();
    this.renderer.galaxy.create();

    // 额外渲染器
    this.meteorRenderer = new MeteorRenderer(this.renderer.scene);
    this.satelliteRenderer = new SatelliteRenderer(this.renderer.scene);
    this.satelliteRenderer.createMarkers();
    this.atmosphere = new AtmosphereRenderer(this.renderer.scene);
    this.atmosphere.create();
    this.planetDetails = new PlanetDetailsRenderer(this.renderer.scene);
    this.planetDetails.createJupiterMoons();
    this.planetDetails.createSaturnRings();

    // 设置面板
    this.settingsUI = new SettingsUI(this);
    this.settingsUI.create();

    // 交互回调
    this.renderer.onObjectClick = (obj) => this._onObjectClick(obj);

    // 搜索
    this.search = new SearchEngine(
      this.allStars,
      CONSTELLATIONS,
      this.dsoObjects,
    );

    // 启动传感器
    if (this.sensorEnabled) {
      const started = await this.sensors.start();
      if (started) {
        this.sensors.onOrientationChange = (o) => this._onOrientationChange(o);
        this.sensors.onLocationChange = (loc) => this._onLocationChange(loc);
      }
    }

    this._updateTimeDisplay();
    this._updateLocationDisplay();

    // 检查流星雨
    this._checkMeteorShower();

    document.getElementById("loading").style.display = "none";

    this.initialized = true;
    console.log("✅ 完整版初始化完成！");

    this._animate();
  }

  _initUI() {
    this.ui.timeDisplay = document.getElementById("time-display");
    this.ui.locationDisplay = document.getElementById("location-display");
    this.ui.objectCount = document.getElementById("object-count");
    this.ui.objectInfo = document.getElementById("object-info");
    this.ui.infoName = document.getElementById("info-name");
    this.ui.infoDetails = document.getElementById("info-details");
    this.ui.searchPanel = document.getElementById("search-panel");
    this.ui.searchInput = document.getElementById("search-input");
    this.ui.searchResults = document.getElementById("search-results");

    // 数据加载完成后再更新计数显示
    this.ui.objectCount.textContent = "正在加载星表...";

    if (this.ui.searchInput) {
      this.ui.searchInput.addEventListener("input", (e) => {
        this._performSearch(e.target.value);
      });
    }
  }

  _updateObjectCount() {
    const starCount = this.allStars?.length || 0;
    const dsoCount = this.dsoObjects?.length || 0;
    this.ui.objectCount.textContent = `恒星: ${starCount} | 深空天体: ${dsoCount}`;
  }

  async _loadData() {
    console.log("📦 加载数据...");
    const brightStars = generateTestStars();
    const extendedStars = generateExtendedStars();
    this.allStars = mergeStarCatalogs(brightStars, extendedStars);
    this.stars = this.allStars; // 使用完整星表
    console.log(`✅ 恒星: ${this.stars.length} 颗`);
    this.dsoObjects = this.dsoCatalog.getAll();
    console.log(`✅ 深空天体: ${this.dsoObjects.length} 个`);

    // 数据加载完成后更新UI计数
    this._updateObjectCount();
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const now = performance.now();
    const delta = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // 更新太阳系
    this._updateSolarSystem();

    // 更新时间
    if (this.timeSpeed !== 0) {
      this.currentTime = new Date(
        this.currentTime.getTime() + this.timeSpeed * delta * 1000,
      );
      this._updateTimeDisplay();
    }

    // 更新流星雨
    this.meteorRenderer?.update(delta);

    // 更新卫星
    const jd = Astronomy.dateToJulianDate(this.currentTime);
    this.satelliteRenderer?.updatePositions(jd, this.latitude, this.longitude);

    // 更新大气
    const sunEq = Astronomy.getSunEquatorial(jd);
    const lst = Astronomy.getLocalSiderealTime(jd, this.longitude);
    const sunAlt = this._calculateAltitude(sunEq.ra, sunEq.dec, lst);
    const moonEq = Astronomy.getMoonEquatorial(jd);
    const moonAlt = this._calculateAltitude(moonEq.ra, moonEq.dec, lst);
    this.atmosphere?.update(sunAlt, moonAlt);

    // 性能优化（先更新相机矩阵确保视锥正确）
    if (this.performance && this.renderer && this.renderer.camera) {
      this.renderer.camera.updateMatrixWorld();
      this.performance.updateFrustum();
      const cameraDir = new THREE.Vector3();
      this.renderer.camera.getWorldDirection(cameraDir);
      if (this.renderer.starMesh) {
        try {
          this.performance.updateLOD(this.renderer.starMesh, cameraDir);
        } catch (e) {
          // updateLOD 失败不影响渲染
        }
      }
      this.performance.updateStats();
    }

    this.renderer.render();
  }

  _updateSolarSystem() {
    const jd = Astronomy.dateToJulianDate(this.currentTime);
    const lst = Astronomy.getLocalSiderealTime(jd, this.longitude);

    const positions = {};

    const sunEq = Astronomy.getSunEquatorial(jd);
    const sunAlt = this._calculateAltitude(sunEq.ra, sunEq.dec, lst);
    positions.sun = { ...sunEq, altitude: sunAlt };

    const moonEq = Astronomy.getMoonEquatorial(jd);
    const moonAlt = this._calculateAltitude(moonEq.ra, moonEq.dec, lst);
    const moonPhase = Astronomy.getMoonPhaseName
      ? Astronomy.getMoonPhaseName(moonEq.phase)
      : "";
    positions.moon = { ...moonEq, altitude: moonAlt, phase: moonEq.phase };

    const planets = ["mercury", "venus", "mars", "jupiter", "saturn"];
    for (const p of planets) {
      const pos = Astronomy.getPlanetEquatorial(p, jd);
      const alt = this._calculateAltitude(pos.ra, pos.dec, lst);
      positions[p] = { ...pos, altitude: alt };
    }

    this.renderer.solarSystem.updatePositions(positions);
    this.renderer.solarSystem.updateMoonPhase(moonEq.phase);

    // 更新木星卫星位置（跟随木星）
    if (this.planetDetails && positions.jupiter) {
      const jupiterGroup = this.renderer.solarSystem.objects.get("jupiter");
      if (jupiterGroup) {
        this.planetDetails.updateJupiterMoons(jd, jupiterGroup.position);
      }
    }

    // 更新土星环位置（跟随土星）
    if (this.planetDetails?.saturnRingGroup && positions.saturn) {
      const saturnGroup = this.renderer.solarSystem.objects.get("saturn");
      if (saturnGroup) {
        this.planetDetails.saturnRingGroup.position.copy(saturnGroup.position);
        this.planetDetails.saturnRingGroup.visible =
          positions.saturn.altitude > 0;
      }
    }
  }

  _calculateAltitude(ra, dec, lst) {
    const ha = lst - ra;
    const sinAlt =
      Math.sin((dec * Math.PI) / 180) *
        Math.sin((this.latitude * Math.PI) / 180) +
      Math.cos((dec * Math.PI) / 180) *
        Math.cos((this.latitude * Math.PI) / 180) *
        Math.cos((ha * Math.PI) / 180);
    return (Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180) / Math.PI;
  }

  _checkMeteorShower() {
    const shower = this.meteorRenderer?.checkActivity(this.currentTime);
    if (shower) {
      this.meteorRenderer.start(shower);
      console.log(`🌠 ${shower.name} 活动中！`);
    }
  }

  _onOrientationChange(orientation) {
    if (!this.sensorEnabled || !this.renderer) return;
    this.renderer.setCameraOrientation(
      orientation.azimuth,
      orientation.altitude,
      orientation.roll,
    );
  }

  _onLocationChange(location) {
    this.latitude = location.latitude;
    this.longitude = location.longitude;
    this._updateLocationDisplay();
  }

  _onObjectClick(obj) {
    if (obj.type === "dso") {
      this._showObjectInfo(obj.data);
    } else if (obj.type === "planet") {
      this._showPlanetInfo(obj.data);
    } else if (obj.type === "sky") {
      const nearest = this._findNearestStar(obj.ra, obj.dec);
      if (nearest) this._showStarInfo(nearest);
    }
  }

  _findNearestStar(ra, dec, maxDist = 2) {
    let nearest = null;
    let minDist = Infinity;
    for (const star of this.stars) {
      const dRa = (star.ra - ra) * Math.cos((dec * Math.PI) / 180);
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
    this.ui.infoName.textContent = `${obj.m} ${obj.name || ""}`;
    const typeNames = {
      G: "星系",
      N: "星云",
      PN: "行星状星云",
      OC: "疏散星团",
      GC: "球状星团",
      SNR: "超新星遗迹",
      MUL: "复合天体",
    };
    this.ui.infoDetails.innerHTML = `
      <div>类型: ${typeNames[obj.type] || obj.type}</div>
      <div>星等: ${obj.mag}</div>
      <div>赤经: ${obj.ra.toFixed(1)}°</div>
      <div>赤纬: ${obj.dec.toFixed(1)}°</div>
      <div>星座: ${obj.con}</div>
      ${obj.desc ? `<div style="margin-top:4px;font-size:12px;opacity:0.7;">${obj.desc}</div>` : ""}
    `;
    this.ui.objectInfo.classList.add("visible");
    clearTimeout(this._infoTimeout);
    this._infoTimeout = setTimeout(() => {
      this.ui.objectInfo.classList.remove("visible");
    }, 5000);
  }

  _showStarInfo(star) {
    this.ui.infoName.textContent =
      star.name || star.bayer || `恒星 #${star.id}`;
    this.ui.infoDetails.innerHTML = `
      <div>星等: ${(star.magnitude || star.mag || 0).toFixed(2)}</div>
      <div>光谱型: ${star.spectralType || star.sp || "未知"}</div>
      <div>赤经: ${star.ra.toFixed(2)}°</div>
      <div>赤纬: ${star.dec.toFixed(2)}°</div>
      ${star.constellation || star.con ? `<div>星座: ${star.constellation || star.con}</div>` : ""}
      ${star.bayer ? `<div>拜耳名: ${star.bayer}</div>` : ""}
      ${star.parallax > 0 ? `<div>距离: ${(1000 / star.parallax).toFixed(1)} 光年</div>` : ""}
    `;
    this.ui.objectInfo.classList.add("visible");
    clearTimeout(this._infoTimeout);
    this._infoTimeout = setTimeout(() => {
      this.ui.objectInfo.classList.remove("visible");
    }, 5000);
  }

  _showPlanetInfo(planetData) {
    const visual = planetData.visual;
    this.ui.infoName.textContent = `${visual.symbol} ${visual.name}`;
    this.ui.infoDetails.innerHTML = `
      <div>类型: 太阳系天体</div>
      ${visual.size ? `<div>视直径: ${visual.size.toFixed(3)} 单位</div>` : ""}
      ${visual.hasRings ? "<div>特征: 有环系统</div>" : ""}
    `;
    this.ui.objectInfo.classList.add("visible");
    clearTimeout(this._infoTimeout);
    this._infoTimeout = setTimeout(() => {
      this.ui.objectInfo.classList.remove("visible");
    }, 5000);
  }

  _performSearch(query) {
    if (!this.ui.searchResults) return;

    if (!query || query.length < 2) {
      this.ui.searchResults.innerHTML = "";
      this.ui.searchResults.style.display = "none";
      return;
    }

    const results = this.search.search(query, 8);

    if (results.length === 0) {
      this.ui.searchResults.innerHTML =
        '<div class="search-no-results">未找到匹配天体</div>';
    } else {
      this.ui.searchResults.innerHTML = results
        .map(
          (r) => `
        <div class="search-result" data-type="${r.type}" data-id="${r.data.id || r.data.m || r.name || ""}">
          <span class="search-type" data-type="${r.type}">${r.type === "star" ? "★" : r.type === "dso" ? "◎" : "◈"}</span>
          <span class="search-name">${r.name}</span>
          <span class="search-info">${r.data.constellation || r.data.con || ""}</span>
        </div>
      `,
        )
        .join("");

      this.ui.searchResults.querySelectorAll(".search-result").forEach((el) => {
        el.addEventListener("click", () => {
          const type = el.dataset.type;
          const id = el.dataset.id;
          this._goToObject(type, id);
        });
      });
    }

    this.ui.searchResults.style.display = "block";
  }

  _goToObject(type, id) {
    if (this.ui.searchResults) this.ui.searchResults.style.display = "none";
    if (this.ui.searchInput) this.ui.searchInput.value = "";

    let obj = null;
    if (type === "star") {
      obj = this.stars.find((s) => s.id.toString() === id);
    } else if (type === "dso") {
      obj = this.dsoObjects.find((d) => d.m === id);
    }

    if (obj && this.renderer) {
      const ra = obj.ra;
      const dec = obj.dec;
      this.renderer.setCameraOrientation(ra, 90 - dec, 0);

      if (type === "star") {
        this._showStarInfo(obj);
      } else {
        this._showObjectInfo(obj);
      }
    }
  }

  _updateTimeDisplay() {
    const d = this.currentTime;
    const timeStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const hourStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    let speedStr = "";
    if (this.timeSpeed === 0) speedStr = "实时";
    else if (Math.abs(this.timeSpeed) === 3600) speedStr = "1小时/秒";
    else if (Math.abs(this.timeSpeed) === 86400) speedStr = "1天/秒";
    else if (Math.abs(this.timeSpeed) === 604800) speedStr = "1周/秒";
    else if (Math.abs(this.timeSpeed) === 2592000) speedStr = "1月/秒";
    else speedStr = `${this.timeSpeed}秒/秒`;
    this.ui.timeDisplay.innerHTML = `${timeStr} ${hourStr} <span style="opacity:0.5">(${speedStr})</span>`;
  }

  _updateLocationDisplay() {
    const latDir = this.latitude >= 0 ? "N" : "S";
    const lonDir = this.longitude >= 0 ? "E" : "W";
    this.ui.locationDisplay.textContent = `${Math.abs(this.latitude).toFixed(1)}°${latDir} ${Math.abs(this.longitude).toFixed(1)}°${lonDir}`;
  }

  // 公共控制接口
  async toggleSensor() {
    this.sensorEnabled = !this.sensorEnabled;
    const btn = document.getElementById("btn-sensor");
    if (this.sensorEnabled) {
      const started = await this.sensors.start();
      if (started) {
        btn?.classList.add("active");
      } else {
        // 传感器启动失败，恢复状态
        this.sensorEnabled = false;
        btn?.classList.remove("active");
      }
    } else {
      this.sensors.stop();
      btn?.classList.remove("active");
    }
  }

  toggleConstellations() {
    const visible = this.renderer.toggleLayer("constellations");
    document
      .getElementById("btn-constellation")
      ?.classList.toggle("active", visible);
  }

  toggleDSO() {
    const visible = this.renderer.toggleLayer("dso");
    document.getElementById("btn-dso")?.classList.toggle("active", visible);
  }

  toggleGrid() {
    const visible = this.renderer.toggleLayer("grid");
    document.getElementById("btn-grid")?.classList.toggle("active", visible);
  }

  toggleGalaxy() {
    const visible = this.renderer.toggleLayer("galaxy");
    document.getElementById("btn-galaxy")?.classList.toggle("active", visible);
  }

  togglePlanets() {
    const visible = this.renderer.toggleLayer("planets");
    document.getElementById("btn-planets")?.classList.toggle("active", visible);
  }

  toggleSatellites() {
    const visible = this.satelliteRenderer.toggleVisible();
    document
      .getElementById("btn-satellite")
      ?.classList.toggle("active", visible);
  }

  toggleSearch() {
    const panel = document.getElementById("search-panel");
    if (panel) {
      const isVisible = panel.style.display !== "none";
      panel.style.display = isVisible ? "none" : "block";
      if (!isVisible && this.ui.searchInput) {
        this.ui.searchInput.focus();
      }
    }
  }

  toggleSettings() {
    this.settingsUI?.toggle();
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
// 启动
// ============================================

const app = new StellariumApp();

document.addEventListener("DOMContentLoaded", () => {
  app.init().catch((err) => {
    console.error("初始化失败:", err);
    document.getElementById("loading").innerHTML = `
      <div style="color:#ff6666">❌ 加载失败</div>
      <div style="font-size:12px;margin-top:8px;">${err.message}</div>
    `;
  });
});

window.app = app;
window.Astronomy = Astronomy;
