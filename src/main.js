/**
 * 星象馆主入口
 */

console.log('🌟 Stellarium Mobile 初始化中...');

// 导入天文引擎
import {
  dateToJulianDate,
  getJulianEphemerisDate,
  getLocalSiderealTime,
  getSunEquatorial,
  getPlanetEquatorial,
  getMoonEquatorial,
  equatorialToHorizontal,
  applyRefraction
} from './astronomy/index.js';

// 全局天文函数（用于调试）
window.Astronomy = {
  dateToJulianDate,
  getJulianEphemerisDate,
  getLocalSiderealTime,
  getSunEquatorial,
  getPlanetEquatorial,
  getMoonEquatorial,
  equatorialToHorizontal,
  applyRefraction
};

// 隐藏加载画面
setTimeout(() => {
  document.getElementById('loading').classList.add('hidden');
}, 1000);

// 显示基本信息
function showInfo() {
  const now = new Date();
  const jde = getJulianEphemerisDate(now);
  const sun = getSunEquatorial(jde);
  
  console.log('📅 当前时间:', now.toISOString());
  console.log('🔭 Julian Date:', jde.toFixed(5));
  console.log('☀️ 太阳赤经:', (sun.ra * 180 / Math.PI / 15).toFixed(4), 'h');
  console.log('☀️ 太阳赤纬:', (sun.dec * 180 / Math.PI).toFixed(4), '°');
}

showInfo();

// TODO: Phase 2-8 将逐步实现
