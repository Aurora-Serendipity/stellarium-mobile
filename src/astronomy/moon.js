/**
 * 月球位置计算
 * 使用简化 ELP-2000 理论
 * 精度：约 10角秒（肉眼观测足够）
 * 
 * 参考：Astronomical Algorithms by Jean Meeus, Chapter 47
 */

import { DEG2RAD, RAD2DEG, PI2, normalizeAngle } from './math.js';
import { getJulianCenturies } from './time.js';
import { eclipticToEquatorial } from './coords.js';

/**
 * 计算月球位置（地心黄道坐标）
 * 返回: {lon, lat, distance} 弧度/千米
 */
export function getMoonPosition(jde) {
  const T = getJulianCenturies(jde);
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  
  // 月球平黄经
  const Lp = (218.3164477 + 481267.88123421 * T - 0.0015786 * T2 +
              T3 / 538841 - T4 / 65194000) * DEG2RAD;
  
  // 月球平近点角
  const M = (134.9633964 + 477198.8675055 * T + 0.0087414 * T2 +
             T3 / 69699 - T4 / 14712000) * DEG2RAD;
  
  // 太阳平近点角
  const Ms = (357.5291092 + 35999.0502909 * T - 0.0001536 * T2 +
              T3 / 24490000) * DEG2RAD;
  
  // 月球平升交距角
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T2 +
             T3 / 545868 - T4 / 113065000) * DEG2RAD;
  
  // 月球轨道升交点平黄经
  const omega = (125.0445479 - 1934.1362891 * T + 0.0020754 * T2 +
                 T3 / 467441 - T4 / 60616000) * DEG2RAD;
  
  // ============================================
  // 主要摄动项
  // ============================================
  
  // 黄经摄动（角秒）
  let dLon = 0;
  dLon += 22640 * Math.sin(M);                    // 主要项
  dLon += -4586 * Math.sin(M - 2 * D);            // 出差
  dLon += 2370 * Math.sin(2 * D);                 // 二均差
  dLon += 769 * Math.sin(2 * M);                  // 倍角项
  dLon += -668 * Math.sin(Ms);                    // 太阳项
  dLon += -412 * Math.sin(2 * M - 2 * D);
  dLon += -212 * Math.sin(2 * M - Ms);
  dLon += -206 * Math.sin(M + Ms - 2 * D);
  dLon += 192 * Math.sin(M + 2 * D);
  dLon += -165 * Math.sin(Ms - 2 * D);
  dLon += 148 * Math.sin(M - Ms);
  dLon += -125 * Math.sin(D);
  dLon += -110 * Math.sin(M + Ms);
  dLon += -55 * Math.sin(2 * M - 2 * Ms);
  
  // 纬度摄动（角秒）
  let dLat = 0;
  dLat += 18520 * Math.sin(omega + M);            // 主要项
  dLat += -526 * Math.sin(omega + M - 2 * D);
  dLat += 44 * Math.sin(omega + 2 * M - D);
  dLat += -31 * Math.sin(omega - M + 2 * D);
  dLat += -25 * Math.sin(omega - 2 * M);
  dLat += 25 * Math.sin(omega + M - 2 * Ms);
  dLat += 14 * Math.sin(omega + 2 * D);
  dLat += -14 * Math.sin(omega + 2 * M - 2 * D);
  
  // 距离摄动（千米）
  let dR = 0;
  dR += -20905 * Math.cos(M);                     // 主要项
  dR += -3699 * Math.cos(2 * D - M);              // 出差
  dR += 2956 * Math.cos(2 * D);                   // 二均差
  dR += -569 * Math.cos(2 * M);                   // 倍角项
  
  // ============================================
  // 计算最终位置
  // ============================================
  
  const lon = normalizeAngle(Lp + dLon * (Math.PI / (180 * 3600)));
  const lat = dLat * (Math.PI / (180 * 3600));
  const distance = 385000.56 + dR; // 平均距离 + 摄动
  
  return { lon, lat, distance };
}

/**
 * 计算月球赤道坐标（地心视位置）
 * 返回: {ra, dec, distance, phase, elongation} 弧度/千米/度
 */
export function getMoonEquatorial(jde) {
  const moon = getMoonPosition(jde);
  
  // 转换为赤道坐标
  const equatorial = eclipticToEquatorial(moon.lon, moon.lat, jde);
  
  // 计算月相
  const { getSunEquatorial } = await import('./planets.js');
  const sun = getSunEquatorial(jde);
  
  // 日月黄经差
  const elongation = Math.abs(moon.lon - sun.longitude);
  const phase = (1 - Math.cos(elongation)) / 2;
  
  // 月龄（从朔起算的天数）
  const age = elongation * RAD2DEG / 12.2; // 约 29.5 天一个周期
  
  return {
    ra: equatorial.ra,
    dec: equatorial.dec,
    distance: moon.distance,
    phase,
    elongation: elongation * RAD2DEG,
    age,
    magnitude: -12.74 + 1.4 * Math.abs(Math.log10(phase || 0.001))
  };
}

/**
 * 计算月相名称
 */
export function getMoonPhaseName(phase) {
  const normalized = ((phase % 1) + 1) % 1;
  if (normalized < 0.02 || normalized > 0.98) return '朔月';
  if (normalized < 0.23) return '蛾眉月';
  if (normalized < 0.27) return '上弦月';
  if (normalized < 0.48) return '盈凸月';
  if (normalized < 0.52) return '满月';
  if (normalized < 0.73) return '亏凸月';
  if (normalized < 0.77) return '下弦月';
  return '残月';
}
