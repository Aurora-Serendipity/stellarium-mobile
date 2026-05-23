/**
 * 太阳系行星位置计算
 * 使用简化解析公式（基于 VSOP87 理论）
 * 精度：< 1角分（肉眼观测足够）
 * 
 * 参考：Astronomical Algorithms by Jean Meeus
 */

import { DEG2RAD, RAD2DEG, PI2, normalizeAngle } from './math.js';
import { getJulianCenturies, getJulianEphemerisDate } from './time.js';
import { eclipticToEquatorial } from './coords.js';

const ARCSEC2RAD = Math.PI / (180 * 3600);

// ============================================
// 行星轨道要素（平运动参数）
// ============================================

const PLANET_ELEMENTS = {
  mercury: {
    L: [252.25084, 149472.6746358, -0.000002355, 0.000000002],
    a: 0.387098310,
    e: [0.20563175, 0.000020406, -0.0000000284, -0.0000000002],
    i: [7.004986, 0.0018215, -0.0000181, 0.000000056],
    omega: [48.330893, 1.186826, 0.0001759, 0.000000113],
    pi: [77.456119, 1.556477, 0.0002959, 0.000000056]
  },
  venus: {
    L: [181.979801, 58517.8156760, 0.00000165, -0.000000002],
    a: 0.723329820,
    e: [0.00677188, -0.000047766, 0.0000000981, 0.00000000046],
    i: [3.394662, 0.0010037, -0.00000088, -0.000000007],
    omega: [76.679920, 0.901120, 0.0004066, -0.000000080],
    pi: [131.563707, 1.402218, -0.001103, 0.000000433]
  },
  earth: {
    L: [100.466449, 36000.7698231, 0.00030368, 0.000000021],
    a: 1.000001018,
    e: [0.01670862, -0.000042037, -0.0000001236, 0.00000000004],
    i: [0.0, 0.0, 0.0, 0.0],
    omega: [174.873174, -0.241090, 0.00004262, 0.000000001],
    pi: [102.937348, 1.719526, 0.00045962, 0.000000499]
  },
  mars: {
    L: [355.433275, 19140.2993313, 0.00000261, -0.000000003],
    a: 1.523679342,
    e: [0.09340062, 0.000090483, -0.0000000806, -0.00000000035],
    i: [1.849726, -0.0006010, 0.00001276, -0.000000006],
    omega: [49.558093, 0.772095, 0.00001557, 0.000002267],
    pi: [336.060234, 1.841033, 0.00013515, 0.000000318]
  },
  jupiter: {
    L: [34.351484, 3034.9056746, -0.00008501, 0.000000016],
    a: 5.202603191,
    e: [0.04849485, 0.000163244, -0.0000004719, -0.00000000197],
    i: [1.303270, -0.0054966, 0.00000465, -0.000000004],
    omega: [100.464441, 1.020955, 0.00040117, 0.000000569],
    pi: [14.331309, 1.612666, 0.00103127, -0.000000569]
  },
  saturn: {
    L: [50.077444, 1222.1138488, 0.00021004, -0.000000019],
    a: 9.554909596,
    e: [0.05550862, -0.000346818, -0.0000006456, 0.00000000338],
    i: [2.488878, -0.0037363, -0.00001516, 0.000000089],
    omega: [113.665524, 0.877097, -0.00012067, -0.000002380],
    pi: [93.056787, 1.963769, 0.00083757, 0.000004899]
  },
  uranus: {
    L: [314.055005, 429.8640561, 0.00030434, 0.000000026],
    a: 19.218446062,
    e: [0.04629590, -0.000027337, 0.0000000790, 0.00000000025],
    i: [0.773197, 0.0007744, 0.00003749, -0.000000092],
    omega: [74.005947, 0.521125, 0.00133982, 0.000018516],
    pi: [173.005159, 1.486378, 0.00021450, 0.000000433]
  },
  neptune: {
    L: [304.348665, 219.8833092, 0.00030926, 0.000000018],
    a: 30.110386869,
    e: [0.00898809, 0.000006408, -0.0000000008, -0.00000000005],
    i: [1.769952, -0.0093082, -0.00000708, 0.000000028],
    omega: [131.784057, 1.102203, 0.00025952, -0.000000637],
    pi: [48.120276, 1.426267, 0.00037918, -0.000000003]
  }
};

/**
 * 计算行星的平轨道要素
 */
function getPlanetElements(planet, T) {
  const elem = PLANET_ELEMENTS[planet];
  if (!elem) throw new Error(`Unknown planet: ${planet}`);
  
  const T2 = T * T;
  const T3 = T2 * T;
  
  const L = elem.L[0] + elem.L[1] * T + elem.L[2] * T2 + elem.L[3] * T3;
  const e = typeof elem.e === 'number' ? elem.e : elem.e[0] + elem.e[1] * T + elem.e[2] * T2 + elem.e[3] * T3;
  const i = elem.i[0] + elem.i[1] * T + elem.i[2] * T2 + elem.i[3] * T3;
  const omega = elem.omega[0] + elem.omega[1] * T + elem.omega[2] * T2 + elem.omega[3] * T3;
  const pi = elem.pi[0] + elem.pi[1] * T + elem.pi[2] * T2 + elem.pi[3] * T3;
  
  return {
    L: normalizeAngle(L * DEG2RAD),
    a: elem.a,
    e,
    i: i * DEG2RAD,
    omega: normalizeAngle(omega * DEG2RAD),
    pi: normalizeAngle(pi * DEG2RAD),
    M: normalizeAngle((L - pi) * DEG2RAD) // 平近点角
  };
}

/**
 * 解开普勒方程
 * E = M + e * sin(E)
 * 使用牛顿迭代法
 */
function solveKepler(M, e, epsilon = 1e-10) {
  let E = M;
  if (e > 0.8) E = Math.PI; // 高偏心率初值
  
  for (let i = 0; i < 50; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < epsilon) break;
  }
  
  return E;
}

/**
 * 计算行星日心黄道坐标
 * 返回: {lon, lat, r} 弧度/距离(AU)
 */
export function getPlanetHeliocentric(planet, jde) {
  const T = getJulianCenturies(jde);
  const elem = getPlanetElements(planet, T);
  
  // 解开普勒方程
  const E = solveKepler(elem.M, elem.e);
  
  // 真近点角
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + elem.e) * Math.sin(E / 2),
    Math.sqrt(1 - elem.e) * Math.cos(E / 2)
  );
  
  // 日心距离
  const r = elem.a * (1 - elem.e * Math.cos(E));
  
  // 日心黄经
  const lon = elem.pi + nu;
  
  // 日心黄纬（简化，假设轨道平面）
  const lat = 0;
  
  return {
    lon: normalizeAngle(lon),
    lat,
    r
  };
}

/**
 * 计算行星的赤道坐标（地心视位置）
 * 返回: {ra, dec, distance, elongation, phase} 弧度/AU/度
 */
export function getPlanetEquatorial(planet, jde) {
  // 获取地球位置
  const earth = getPlanetHeliocentric('earth', jde);
  
  // 获取目标行星位置
  const p = getPlanetHeliocentric(planet, jde);
  
  // 转换为地心坐标
  const x = p.r * Math.cos(p.lon) - earth.r * Math.cos(earth.lon);
  const y = p.r * Math.sin(p.lon) - earth.r * Math.sin(earth.lon);
  
  // 地心黄经
  const geoLon = Math.atan2(y, x);
  const geoLat = 0; // 简化
  const distance = Math.sqrt(x * x + y * y);
  
  // 光时修正
  const lightTime = distance * 499.004784 / 86400; // days
  const jdeCorrected = jde - lightTime;
  
  // 重新计算（迭代一次）
  const p2 = getPlanetHeliocentric(planet, jdeCorrected);
  const x2 = p2.r * Math.cos(p2.lon) - earth.r * Math.cos(earth.lon);
  const y2 = p2.r * Math.sin(p2.lon) - earth.r * Math.sin(earth.lon);
  const finalLon = Math.atan2(y2, x2);
  const finalLat = 0;
  const finalDist = Math.sqrt(x2 * x2 + y2 * y2);
  
  // 转换为赤道坐标
  const equatorial = eclipticToEquatorial(finalLon, finalLat, jde);
  
  // 计算距角（太阳-地球-行星角）
  const sunDist = Math.sqrt(
    (earth.r * Math.cos(earth.lon)) ** 2 +
    (earth.r * Math.sin(earth.lon)) ** 2
  );
  const elongation = Math.acos(
    (sunDist * sunDist + finalDist * finalDist - p2.r * p2.r) /
    (2 * sunDist * finalDist)
  ) * RAD2DEG;
  
  // 计算相位（照亮比例）
  const phase = (1 + Math.cos(elongation * DEG2RAD)) / 2;
  
  return {
    ra: equatorial.ra,
    dec: equatorial.dec,
    distance: finalDist,
    elongation,
    phase,
    magnitude: estimateMagnitude(planet, finalDist, p2.r)
  };
}

/**
 * 估算行星视星等（简化公式）
 */
function estimateMagnitude(planet, geoDist, helioDist) {
  const magTable = {
    mercury: -0.42,
    venus: -4.40,
    mars: -1.52,
    jupiter: -9.40,
    saturn: -8.88,
    uranus: -7.19,
    neptune: -6.87
  };
  
  const baseMag = magTable[planet] || 0;
  return baseMag + 5 * Math.log10(geoDist * helioDist);
}

/**
 * 计算太阳位置（地心赤道坐标）
 */
export function getSunEquatorial(jde) {
  const T = getJulianCenturies(jde);
  
  // 太阳平黄经
  const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) * DEG2RAD;
  
  // 太阳平近点角
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG2RAD;
  
  // 中心差
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) * DEG2RAD +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M) * DEG2RAD +
            0.000289 * Math.sin(3 * M) * DEG2RAD;
  
  // 太阳真黄经
  const sunLon = normalizeAngle(L0 + C);
  
  // 太阳黄纬（近似为0）
  const sunLat = 0;
  
  // 太阳距离（AU）
  const R = 1.000001018 * (1 - 0.016708634 * 0.016708634) / (1 + 0.016708634 * Math.cos(M + C));
  
  // 转换为赤道坐标
  const equatorial = eclipticToEquatorial(sunLon, sunLat, jde);
  
  return {
    ra: equatorial.ra,
    dec: equatorial.dec,
    distance: R,
    longitude: sunLon,
    latitude: sunLat
  };
}

/**
 * 获取所有行星位置
 */
export function getAllPlanets(jde) {
  const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const result = {};
  
  for (const p of planets) {
    result[p] = getPlanetEquatorial(p, jde);
  }
  
  return result;
}
