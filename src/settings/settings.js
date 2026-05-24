/**
 * 设置管理
 * 位置、时间、显示选项
 */

export class SettingsManager {
  constructor() {
    this.settings = this._loadSettings();
  }

  _isLocalStorageAvailable() {
    try {
      return typeof localStorage !== "undefined" && localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  _loadSettings() {
    try {
      if (this._isLocalStorageAvailable()) {
        const saved = localStorage.getItem("stellarium_settings");
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("无法加载设置:", e);
    }

    return {
      location: {
        latitude: 39.9,
        longitude: 116.4,
        useGPS: true,
      },
      display: {
        showStars: true,
        showConstellations: true,
        showDSO: true,
        showGrid: false,
        showGalaxy: true,
        showPlanets: true,
        showLabels: true,
        magnitudeLimit: 6.0,
      },
      time: {
        useRealTime: true,
        timeSpeed: 1,
      },
      sensor: {
        enabled: true,
        smoothing: 0.3,
      },
    };
  }

  save() {
    try {
      if (this._isLocalStorageAvailable()) {
        localStorage.setItem(
          "stellarium_settings",
          JSON.stringify(this.settings),
        );
      }
    } catch (e) {
      console.warn("无法保存设置:", e);
    }
  }

  getAll() {
    return { ...this.settings };
  }

  get(key) {
    return key.split(".").reduce((obj, k) => obj?.[k], this.settings);
  }

  set(key, value) {
    const keys = key.split(".");
    let obj = this.settings;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this.save();
  }

  reset() {
    try {
      if (this._isLocalStorageAvailable()) {
        localStorage.removeItem("stellarium_settings");
      }
    } catch (e) {
      console.warn("无法清除设置:", e);
    }
    this.settings = this._loadSettings();
  }
}
