/**
 * 恒星位置计算
 * 包含自行、视差、光行差修正
 * 将 J2000.0 平位置转换到当前历元视位置
 */

import { DEG2RAD, RAD2DEG, PI2, normalizeAngle } from './math.js';
import { getJulianCenturies } from './time.js';
import { applyPrecession, applyNutation, applyAnnualAberration } from './coords.js';

const ARCSEC2RAD = Math.PI / (180 * 3600);
const MAS2RAD = ARCSEC2RAD / 1000; // 毫角秒转弧度

/**
 * 恒星数据接口
 * {
 *   ra: 赤经 (J2000.0, 度),
 *   dec: 赤纬 (J2000.0, 度),
 *   pmRA: 赤经自行 (mas/年),
 *   pmDec: 赤纬自行 (mas/年),
 *   parallax: 视差 (mas),
 *   radialVelocity: 径向速度 (km/s),
 *   magnitude: 视星等,
 *   spectralType: 光谱型
 * }
 */

/**
 * 应用自行修正
 * 将 J2000.0 位置推进到目标历元
 */
export function applyProperMotion(ra, dec, pmRA, pmDec, parallax, radialVelocity, jde) {
  const T = getJulianCenturies(jde); // 从 J2000.0 起算的世纪数
  
  // 自行引起的位移（弧度）
  const dRA = pmRA * MAS2RAD * T * 100; // 100年 = 1世纪
  const dDec = pmDec * MAS2RAD * T * 100;
  
  // 径向速度引起的位移（简化，仅对近距离恒星重要）
  let radialFactor = 0;
  if (parallax > 0) {
    const distance = 1 / (parallax * MAS2RAD); // 秒差距（近似）
    radialFactor = radialVelocity * T * 100 / (distance * 3.086e13) * ARCSEC2RAD;
  }
  
  return {
    ra: normalizeAngle(ra * DEG2RAD + dRA),
    dec: dec * DEG2RAD + dDec + radialFactor
  };
}

/**
 * 应用周年视差
 * 将日心位置转换为地心位置
 */
export function applyParallax(ra, dec, parallax, jde) {
  if (parallax <= 0) return { ra, dec };
  
  const pi = parallax * MAS2RAD;
  
  // 太阳黄经（简化）
  const T = getJulianCenturies(jde);
  const sunLon = (280.460 + 36000.770 * T) * DEG2RAD;
  const sunLat = 0;
  const sunDist = 1.0; // AU
  
  // 视差位移
  const sinRA = Math.sin(ra);
  const cosRA = Math.cos(ra);
  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  
  const X = sunDist * Math.cos(sunLat) * Math.cos(sunLon);
  const Y = sunDist * Math.cos(sunLat) * Math.sin(sunLon);
  const Z = sunDist * Math.sin(sunLat);
  
  const dRA = pi * (X * sinRA - Y * cosRA) / cosDec;
  const dDec = pi * (X * cosRA * sinDec + Y * sinRA * sinDec - Z * cosDec);
  
  return {
    ra: normalizeAngle(ra + dRA),
    dec: dec + dDec
  };
}

/**
 * 计算恒星的完整视位置
 * J2000.0 平位置 -> 当前历元视位置
 */
export function computeStarApparentPosition(star, jde) {
  const {
    ra: ra2000,      // J2000.0 赤经（度）
    dec: dec2000,    // J2000.0 赤纬（度）
    pmRA = 0,        // 自行（mas/年）
    pmDec = 0,       // 自行（mas/年）
    parallax = 0,    // 视差（mas）
    radialVelocity = 0 // 径向速度（km/s）
  } = star;
  
  // 1. 应用自行：J2000.0 -> 当前历元
  const pmCorrected = applyProperMotion(ra2000, dec2000, pmRA, pmDec, parallax, radialVelocity, jde);
  
  // 2. 应用岁差：J2000.0 分点 -> 当前历元分点
  const precessed = applyPrecession(pmCorrected.ra, pmCorrected.dec, jde);
  
  // 3. 应用周年视差
  const parallaxCorrected = applyParallax(precessed.ra, precessed.dec, parallax, jde);
  
  // 4. 应用光行差
  const aberrated = applyAnnualAberration(parallaxCorrected.ra, parallaxCorrected.dec, jde);
  
  // 5. 应用章动
  const nutated = applyNutation(aberrated.ra, aberrated.dec, jde);
  
  return {
    ra: nutated.ra,
    dec: nutated.dec
  };
}

/**
 * 批量计算恒星视位置
 */
export function computeStarsApparentPositions(stars, jde) {
  return stars.map(star => {
    const pos = computeStarApparentPosition(star, jde);
    return {
      ...star,
      apparentRa: pos.ra * RAD2DEG,
      apparentDec: pos.dec * RAD2DEG
    };
  });
}

/**
 * 筛选可见恒星
 * 输入: 恒星列表（含视位置）, 观测者纬度(度), 本地恒星时(度)
 * 输出: 可见恒星列表（高度角 > -6°，考虑大气折射）
 */
export function filterVisibleStars(stars, latitude, lst) {
  const lat = latitude * DEG2RAD;
  const lstRad = lst * DEG2RAD;
  
  return stars.filter(star => {
    const ra = (star.apparentRa || star.ra) * DEG2RAD;
    const dec = (star.apparentDec || star.dec) * DEG2RAD;
    
    // 计算时角
    const hourAngle = normalizeAngle(lstRad - ra);
    
    // 计算高度角
    const sinAlt = Math.sin(dec) * Math.sin(lat) +
                   Math.cos(dec) * Math.cos(lat) * Math.cos(hourAngle);
    const altitude = Math.asin(sinAlt) * RAD2DEG;
    
    // 可见性判断（-6° = 民用晨昏蒙影）
    return altitude > -6;
  }).map(star => {
    const ra = (star.apparentRa || star.ra) * DEG2RAD;
    const dec = (star.apparentDec || star.dec) * DEG2RAD;
    const hourAngle = normalizeAngle(lstRad - ra);
    
    const sinAlt = Math.sin(dec) * Math.sin(lat) +
                   Math.cos(dec) * Math.cos(lat) * Math.cos(hourAngle);
    const altitude = Math.asin(sinAlt) * RAD2DEG;
    
    const cosAz = (Math.sin(dec) - sinAlt * Math.sin(lat)) /
                  (Math.cos(Math.asin(sinAlt)) * Math.cos(lat));
    let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD2DEG;
    if (Math.sin(hourAngle) > 0) {
      azimuth = 360 - azimuth;
    }
    
    return {
      ...star,
      altitude,
      azimuth
    };
  });
}

/**
 * 按星等排序恒星
 */
export function sortStarsByMagnitude(stars) {
  return [...stars].sort((a, b) => (a.magnitude || 99) - (b.magnitude || 99));
}

/**
 * 按天区筛选恒星（用于视锥剔除）
 */
export function filterStarsInFOV(stars, centerRa, centerDec, fovRadius) {
  const centerRaRad = centerRa * DEG2RAD;
  const centerDecRad = centerDec * DEG2RAD;
  const fovRad = fovRadius * DEG2RAD;
  
  return stars.filter(star => {
    const ra = (star.apparentRa || star.ra) * DEG2RAD;
    const dec = (star.apparentDec || star.dec) * DEG2RAD;
    
    // 球面距离
    const dRa = ra - centerRaRad;
    const a = Math.sin(dRa / 2) ** 2 +
              Math.cos(centerDecRad) * Math.cos(dec) * Math.sin((dec - centerDecRad) / 2) ** 2;
    const dist = 2 * Math.asin(Math.sqrt(a));
    
    return dist <= fovRad;
  });
}
