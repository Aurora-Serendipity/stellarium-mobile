/**
 * 设备传感器管理
 * 方向追踪 + 地理定位 + 磁偏角校正
 */

import { DEG2RAD, RAD2DEG } from '../astronomy/math.js';

export class SensorManager {
  constructor() {
    this.enabled = false;
    this.available = false;

    // 传感器数据
    this.orientation = {
      alpha: 0,    // 指南针方向 (0-360)
      beta: 0,     // 前后倾斜 (-180-180)
      gamma: 0,    // 左右倾斜 (-90-90)
      absolute: false
    };

    // 地理位置
    this.location = {
      latitude: 39.9,   // 默认北京
      longitude: 116.4,
      altitude: 0,
      accuracy: null
    };

    // 磁偏角
    this.magneticDeclination = 0;

    // 回调
    this.onOrientationChange = null;
    this.onLocationChange = null;

    // 平滑处理
    this.smoothingFactor = 0.3;
    this.smoothedAlpha = 0;

    // 检查可用性
    this._checkAvailability();
  }

  // ============================================
  // 初始化检查
  // ============================================

  _checkAvailability() {
    // iOS 13+ 需要请求权限
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      this.available = true;
      this.permissionRequired = true;
    } else if (window.DeviceOrientationEvent) {
      this.available = true;
      this.permissionRequired = false;
    }

    // 检查 AbsoluteOrientationSensor (现代 API)
    if ('AbsoluteOrientationSensor' in window) {
      this.modernAPI = true;
    }
  }

  async requestPermission() {
    if (!this.permissionRequired) return true;

    try {
      const response = await DeviceOrientationEvent.requestPermission();
      return response === 'granted';
    } catch (e) {
      console.error('传感器权限请求失败:', e);
      return false;
    }
  }

  // ============================================
  // 启动/停止
  // ============================================

  async start() {
    if (this.enabled) return;

    // 请求权限
    if (this.permissionRequired) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('传感器权限被拒绝');
        return false;
      }
    }

    // 获取地理位置
    this._startGeolocation();

    // 启动方向传感器
    if (this.modernAPI) {
      this._startModernSensor();
    } else {
      this._startLegacySensor();
    }

    this.enabled = true;
    console.log('🧭 传感器已启动');
    return true;
  }

  stop() {
    this.enabled = false;

    if (this._orientationHandler) {
      window.removeEventListener('deviceorientationabsolute', this._orientationHandler);
      window.removeEventListener('deviceorientation', this._orientationHandler);
    }

    if (this._geoWatchId !== null) {
      navigator.geolocation.clearWatch(this._geoWatchId);
    }

    console.log('🧭 传感器已停止');
  }

  // ============================================
  // 方向传感器 (现代 API)
  // ============================================

  _startModernSensor() {
    try {
      const sensor = new AbsoluteOrientationSensor({ frequency: 60 });

      sensor.addEventListener('reading', () => {
        const q = sensor.quaternion;
        // 四元数转欧拉角
        const euler = this._quaternionToEuler(q);
        this._updateOrientation(euler);
      });

      sensor.start();
      this._modernSensor = sensor;
    } catch (e) {
      console.warn('现代传感器启动失败，回退到传统 API');
      this._startLegacySensor();
    }
  }

  _quaternionToEuler(q) {
    const [x, y, z, w] = q;

    // 转换为欧拉角 (Z-X-Y 顺序)
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (w * y - z * x);
    const pitch = Math.abs(sinp) >= 1
      ? Math.copySign(Math.PI / 2, sinp)
      : Math.asin(sinp);

    const siny_cosp = 2 * (w * z + x * y);
    const cosy_cosp = 1 - 2 * (y * y + z * z);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return {
      alpha: yaw * RAD2DEG,
      beta: pitch * RAD2DEG,
      gamma: roll * RAD2DEG
    };
  }

  // ============================================
  // 方向传感器 (传统 API)
  // ============================================

  _startLegacySensor() {
    this._orientationHandler = (event) => {
      const alpha = event.alpha || 0;   // 指南针
      const beta = event.beta || 0;     // 前后倾
      const gamma = event.gamma || 0;   // 左右倾
      const absolute = event.absolute || false;

      this._updateOrientation({ alpha, beta, gamma, absolute });
    };

    // 优先使用 absolute 事件
    window.addEventListener('deviceorientationabsolute', this._orientationHandler);
    window.addEventListener('deviceorientation', this._orientationHandler);
  }

  _updateOrientation(data) {
    // 平滑处理 alpha（指南针方向）
    let alpha = data.alpha;
    if (alpha !== null) {
      // 处理 0/360 跳变
      const diff = alpha - this.smoothedAlpha;
      if (diff > 180) alpha -= 360;
      else if (diff < -180) alpha += 360;

      this.smoothedAlpha += this.smoothingFactor * (alpha - this.smoothedAlpha);
      if (this.smoothedAlpha < 0) this.smoothedAlpha += 360;
      if (this.smoothedAlpha >= 360) this.smoothedAlpha -= 360;

      this.orientation.alpha = this.smoothedAlpha;
    }

    this.orientation.beta = data.beta || 0;
    this.orientation.gamma = data.gamma || 0;
    this.orientation.absolute = data.absolute || false;

    // 触发回调
    if (this.onOrientationChange) {
      this.onOrientationChange(this.getOrientation());
    }
  }

  // ============================================
  // 地理位置
  // ============================================

  _startGeolocation() {
    if (!navigator.geolocation) {
      console.warn('地理定位不可用');
      return;
    }

    // 获取初始位置
    navigator.geolocation.getCurrentPosition(
      (pos) => this._updateLocation(pos),
      (err) => console.warn('定位失败:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // 持续监听
    this._geoWatchId = navigator.geolocation.watchPosition(
      (pos) => this._updateLocation(pos),
      (err) => console.warn('定位更新失败:', err),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
    );
  }

  _updateLocation(position) {
    this.location.latitude = position.coords.latitude;
    this.location.longitude = position.coords.longitude;
    this.location.altitude = position.coords.altitude || 0;
    this.location.accuracy = position.coords.accuracy;

    // 估算磁偏角（简化模型）
    this._estimateMagneticDeclination();

    if (this.onLocationChange) {
      this.onLocationChange(this.location);
    }
  }

  // ============================================
  // 磁偏角估算（简化 IGRF 模型）
  // ============================================

  _estimateMagneticDeclination() {
    const lat = this.location.latitude;
    const lon = this.location.longitude;

    // 非常简化的估算（仅用于演示）
    // 实际应使用 NOAA 的 WMM 模型或 API
    if (lat > 20 && lat < 50 && lon > 70 && lon < 140) {
      // 中国地区约 -5° 到 -8°
      this.magneticDeclination = -6;
    } else if (lat > 25 && lat < 50 && lon > -130 && lon < -60) {
      // 北美约 -10° 到 +15°
      this.magneticDeclination = -5;
    } else if (lat > 35 && lat < 60 && lon > -10 && lon < 30) {
      // 欧洲约 0° 到 +10°
      this.magneticDeclination = 3;
    } else {
      this.magneticDeclination = 0;
    }
  }

  // ============================================
  // 公共接口
  // ============================================

  getOrientation() {
    return {
      azimuth: this.orientation.alpha + this.magneticDeclination,
      altitude: 90 - Math.abs(this.orientation.beta),
      roll: this.orientation.gamma,
      raw: this.orientation
    };
  }

  getLocation() {
    return { ...this.location };
  }

  setLocation(lat, lon, alt = 0) {
    this.location.latitude = lat;
    this.location.longitude = lon;
    this.location.altitude = alt;
    this._estimateMagneticDeclination();
  }

  /**
   * 将设备方向转换为天球坐标
   */
  getSkyDirection() {
    const o = this.getOrientation();

    // 方位角转赤经（需要知道当地恒星时）
    // 这里返回地平坐标系方向
    return {
      azimuth: o.azimuth,
      altitude: o.altitude,
      roll: o.roll
    };
  }
}
