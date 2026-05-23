/**
 * 天文坐标转换
 * 赤道坐标 ↔ 黄道坐标 ↔ 地平坐标
 * 包含岁差、章动、光行差、大气折射修正
 */

import { DEG2RAD, RAD2DEG, PI2, normalizeAngle } from './math.js';
import { getJulianCenturies } from './time.js';

// ============================================
// 岁差矩阵 (IAU 2006 / P03 简化模型)
// ============================================

/**
 * 计算岁差角（从 J2000.0 到目标历元）
 * 返回: {zetaA, zA, thetaA} 弧度
 */
export function getPrecessionAngles(jde) {
  const T = getJulianCenturies(jde);
  const T2 = T * T;
  const T3 = T2 * T;
  
  // IAU 2006 岁差角（角秒 -> 弧度）
  const zetaA = (2306.083227 * T + 0.298850 * T2 + 0.018042 * T3) * ARCSEC2RAD;
  const zA = (2306.077181 * T + 1.092735 * T2 + 0.018268 * T3) * ARCSEC2RAD;
  const thetaA = (2004.191903 * T - 0.429493 * T2 - 0.041822 * T3) * ARCSEC2RAD;
  
  return { zetaA, zA, thetaA };
}

const ARCSEC2RAD = Math.PI / (180 * 3600);

/**
 * 岁差矩阵：将 J2000.0 赤道坐标转换到目标历元
 * 输入: (ra, dec) 弧度, JDE
 * 输出: (ra, dec) 弧度
 */
export function applyPrecession(ra, dec, jde) {
  const { zetaA, zA, thetaA } = getPrecessionAngles(jde);
  
  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  const sinRaZeta = Math.sin(ra + zetaA);
  const cosRaZeta = Math.cos(ra + zetaA);
  
  const A = cosDec * sinRaZeta;
  const B = Math.cos(thetaA) * cosDec * cosRaZeta - Math.sin(thetaA) * sinDec;
  const C = Math.sin(thetaA) * cosDec * cosRaZeta + Math.cos(thetaA) * sinDec;
  
  const newRa = Math.atan2(A, B) + zA;
  const newDec = Math.asin(C);
  
  return {
    ra: normalizeAngle(newRa),
    dec: newDec
  };
}

// ============================================
// 章动 (Wahr 1980 简化模型)
// ============================================

/**
 * 计算章动角
 * 返回: {dPsi, dEps} 弧度（黄经章动和倾角章动）
 */
export function getNutation(jde) {
  const T = getJulianCenturies(jde);
  const T2 = T * T;
  
  // 平黄赤交角
  const eps0 = (84381.448 - 46.8150 * T - 0.00059 * T2 + 0.001813 * T2 * T) * ARCSEC2RAD;
  
  // 太阳平黄经
  const L = (280.4665 + 36000.7698 * T) * DEG2RAD;
  // 月球平黄经
  const Lp = (218.3165 + 481267.8813 * T) * DEG2RAD;
  // 日月平角距
  const D = (297.8502 + 445267.1115 * T) * DEG2RAD;
  // 太阳平近点角
  const M = (357.5291 + 35999.0503 * T) * DEG2RAD;
  // 月球平近点角
  const Mp = (134.9634 + 477198.8675 * T) * DEG2RAD;
  // 月球升交点平黄经
  const omega = (125.0443 - 1934.1363 * T) * DEG2RAD;
  
  // 主要章动项（简化到最大项）
  const dPsi = (-17.20 * Math.sin(omega) - 1.32 * Math.sin(2 * L) -
                0.23 * Math.sin(2 * Lp) + 0.21 * Math.sin(2 * omega)) * ARCSEC2RAD;
  
  const dEps = (9.20 * Math.cos(omega) + 0.57 * Math.cos(2 * L) +
                0.10 * Math.cos(2 * Lp) - 0.09 * Math.cos(2 * omega)) * ARCSEC2RAD;
  
  return { dPsi, dEps, eps0 };
}

/**
 * 应用章动修正
 */
export function applyNutation(ra, dec, jde) {
  const { dPsi, dEps, eps0 } = getNutation(jde);
  const eps = eps0 + dEps;
  
  const sinRa = Math.sin(ra);
  const cosRa = Math.cos(ra);
  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  
  // 章动对赤经的影响
  const dRa = (Math.cos(eps) + Math.sin(eps) * sinRa * Math.tan(dec)) * dPsi -
              cosRa * Math.tan(dec) * dEps;
  
  // 章动对赤纬的影响
  const dDec = Math.sin(eps) * cosRa * dPsi + sinRa * dEps;
  
  return {
    ra: normalizeAngle(ra + dRa),
    dec: dec + dDec
  };
}

// ============================================
// 光行差
// ============================================

/**
 * 周年光行差修正
 * 输入: (ra, dec) 弧度, JDE
 * 输出: (ra, dec) 弧度
 */
export function applyAnnualAberration(ra, dec, jde) {
  const T = getJulianCenturies(jde);
  
  // 太阳平黄经
  const L = (280.460 + 36000.770 * T) * DEG2RAD;
  // 地球轨道偏心率
  const e = 0.016708634 - 0.000042037 * T;
  // 太阳平近点角
  const g = (357.529 + 35999.050 * T) * DEG2RAD;
  
  // 光行差常数（弧度）
  const k = 20.49552 * ARCSEC2RAD;
  
  const sinRa = Math.sin(ra);
  const cosRa = Math.cos(ra);
  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  
  const cosL = Math.cos(L);
  const sinL = Math.sin(L);
  const cosG = Math.cos(g);
  
  const dRa = k * (cosL * cosRa * sinDec - sinL * sinRa * sinDec) / cosDec +
              e * k * (cosG * cosRa * sinDec - sinG * sinRa * sinDec) / cosDec;
  
  const dDec = k * (cosL * (sinRa * sinDec * cosDec - cosRa * sinDec * sinDec) +
                    sinL * cosDec * cosDec) +
               e * k * (cosG * (sinRa * sinDec * cosDec - cosRa * sinDec * sinDec) +
                       sinG * cosDec * cosDec);
  
  return {
    ra: normalizeAngle(ra + dRa),
    dec: dec + dDec
  };
}

// ============================================
// 大气折射
// ============================================

/**
 * Saemundsson 大气折射公式
 * 输入: 真高度角（度）, 气压(mbar), 温度(°C)
 * 输出: 视高度角修正量（度）
 */
export function getAtmosphericRefraction(altitude, pressure = 1010, temperature = 10) {
  if (altitude < -5) return 0; // 地平线以下不计算
  
  // Saemundsson 公式
  const R = (1.02 / Math.tan((altitude + 10.3 / (altitude + 5.11)) * DEG2RAD)) / 60;
  
  // 温压修正
  return R * (pressure / 1010) * (283 / (273 + temperature));
}

/**
 * 应用大气折射（真高度 -> 视高度）
 */
export function applyRefraction(altitude, pressure = 1010, temperature = 10) {
  const R = getAtmosphericRefraction(altitude, pressure, temperature);
  return altitude + R;
}

/**
 * 反向大气折射（视高度 -> 真高度）
 */
export function removeRefraction(altitude, pressure = 1010, temperature = 10) {
  // 迭代求解
  let trueAlt = altitude;
  for (let i = 0; i < 3; i++) {
    const R = getAtmosphericRefraction(trueAlt, pressure, temperature);
    trueAlt = altitude - R;
  }
  return trueAlt;
}

// ============================================
// 坐标系统转换
// ============================================

/**
 * 赤道坐标 -> 地平坐标
 * 输入: (ra, dec) 弧度, lst 本地恒星时(弧度), lat 纬度(弧度)
 * 输出: (azimuth, altitude) 弧度
 */
export function equatorialToHorizontal(ra, dec, lst, lat) {
  const hourAngle = lst - ra;
  
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  const sinH = Math.sin(hourAngle);
  const cosH = Math.cos(hourAngle);
  
  const sinAlt = sinDec * sinLat + cosDec * cosLat * cosH;
  const altitude = Math.asin(sinAlt);
  
  const cosAz = (sinDec - sinAlt * sinLat) / (Math.cos(altitude) * cosLat);
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  
  if (sinH > 0) {
    azimuth = PI2 - azimuth;
  }
  
  return { azimuth, altitude };
}

/**
 * 地平坐标 -> 赤道坐标
 */
export function horizontalToEquatorial(azimuth, altitude, lst, lat) {
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinAlt = Math.sin(altitude);
  const cosAlt = Math.cos(altitude);
  const sinAz = Math.sin(azimuth);
  const cosAz = Math.cos(azimuth);
  
  const sinDec = sinAlt * sinLat + cosAlt * cosLat * cosAz;
  const dec = Math.asin(sinDec);
  
  const cosH = (sinAlt - sinDec * sinLat) / (Math.cos(dec) * cosLat);
  let hourAngle = Math.acos(Math.max(-1, Math.min(1, cosH)));
  
  if (sinAz > 0) {
    hourAngle = PI2 - hourAngle;
  }
  
  const ra = normalizeAngle(lst - hourAngle);
  
  return { ra, dec };
}

/**
 * 黄道坐标 -> 赤道坐标
 * 输入: (longitude, latitude) 弧度, JDE（用于黄赤交角）
 */
export function eclipticToEquatorial(lon, lat, jde) {
  const { eps0 } = getNutation(jde);
  const eps = eps0; // 使用平黄赤交角
  
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinEps = Math.sin(eps);
  const cosEps = Math.cos(eps);
  
  const ra = Math.atan2(sinLon * cosEps - Math.tan(lat) * sinEps, cosLon);
  const dec = Math.asin(sinLat * cosEps + cosLat * sinEps * sinLon);
  
  return {
    ra: normalizeAngle(ra),
    dec
  };
}

/**
 * 赤道坐标 -> 黄道坐标
 */
export function equatorialToEcliptic(ra, dec, jde) {
  const { eps0 } = getNutation(jde);
  const eps = eps0;
  
  const sinRa = Math.sin(ra);
  const cosRa = Math.cos(ra);
  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  const sinEps = Math.sin(eps);
  const cosEps = Math.cos(eps);
  
  const lon = Math.atan2(sinRa * cosEps + Math.tan(dec) * sinEps, cosRa);
  const lat = Math.asin(sinDec * cosEps - cosDec * sinEps * sinRa);
  
  return {
    lon: normalizeAngle(lon),
    lat
  };
}

/**
 * 银道坐标 -> 赤道坐标 (B1950.0)
 * 输入: (l, b) 银经银纬 弧度
 * 输出: (ra, dec) 弧度
 */
export function galacticToEquatorial(l, b) {
  // 银极在 B1950.0 的赤道坐标
  const raGP = 192.25 * DEG2RAD;
  const decGP = 27.4 * DEG2RAD;
  const lCP = 123.0 * DEG2RAD; // 银心方向
  
  const sinL = Math.sin(l - lCP);
  const cosL = Math.cos(l - lCP);
  const sinB = Math.sin(b);
  const cosB = Math.cos(b);
  const sinDecGP = Math.sin(decGP);
  const cosDecGP = Math.cos(decGP);
  
  const ra = Math.atan2(cosB * cosL, sinB * cosDecGP - cosB * sinL * sinDecGP) + raGP;
  const dec = Math.asin(sinB * sinDecGP + cosB * sinL * cosDecGP);
  
  return {
    ra: normalizeAngle(ra),
    dec
  };
}
