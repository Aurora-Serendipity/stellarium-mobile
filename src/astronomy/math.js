/**
 * 天文计算常用数学工具和常数
 */

export const PI2 = Math.PI * 2;
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
export const ARCSEC2RAD = Math.PI / (180 * 3600);

/**
 * 将角度归一化到 [0, 2π) 范围
 */
export function normalizeAngle(angle) {
  let result = angle % PI2;
  if (result < 0) result += PI2;
  return result;
}

/**
 * 将角度归一化到 [-π, π] 范围
 */
export function normalizeAngleSigned(angle) {
  let result = normalizeAngle(angle);
  if (result > Math.PI) result -= PI2;
  return result;
}

/**
 * 度分秒 -> 十进制度数
 */
export function dmsToDeg(d, m, s) {
  const sign = d < 0 ? -1 : 1;
  return sign * (Math.abs(d) + m / 60 + s / 3600);
}

/**
 * 十进制度数 -> 度分秒
 */
export function degToDms(deg) {
  const sign = deg < 0 ? -1 : 1;
  const absDeg = Math.abs(deg);
  const d = Math.floor(absDeg);
  const m = Math.floor((absDeg - d) * 60);
  const s = (absDeg - d - m / 60) * 3600;
  return { sign, d, m, s: Math.round(s * 100) / 100 };
}

/**
 * 时分秒 -> 十进制度数（用于赤经）
 */
export function hmsToDeg(h, m, s) {
  return 15 * (h + m / 60 + s / 3600);
}

/**
 * 十进制度数 -> 时分秒
 */
export function degToHms(deg) {
  const totalHours = deg / 15;
  const h = Math.floor(totalHours);
  const m = Math.floor((totalHours - h) * 60);
  const s = ((totalHours - h) * 60 - m) * 60;
  return { h, m, s: Math.round(s * 100) / 100 };
}

/**
 * 球面距离（大圆弧）
 * 输入：两点的 (ra, dec) 弧度
 */
export function sphericalDistance(ra1, dec1, ra2, dec2) {
  const dRa = ra2 - ra1;
  const a = Math.sin(dRa / 2) ** 2 +
            Math.cos(dec1) * Math.cos(dec2) * Math.sin((dec2 - dec1) / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 三次样条插值（用于 VSOP87 系数插值）
 */
export function cubicInterpolation(x, x0, x1, y0, y1, m0, m1) {
  const h = x1 - x0;
  const t = (x - x0) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  
  return h00 * y0 + h10 * h * m0 + h01 * y1 + h11 * h * m1;
}

/**
 * 切比雪夫多项式求值
 * 用于行星位置高精度插值
 */
export function chebyshevEvaluate(x, coefficients) {
  const n = coefficients.length;
  if (n === 0) return 0;
  if (n === 1) return coefficients[0];
  
  let b2 = 0;
  let b1 = coefficients[n - 1];
  
  for (let i = n - 2; i >= 1; i--) {
    const temp = b1;
    b1 = 2 * x * b1 - b2 + coefficients[i];
    b2 = temp;
  }
  
  return x * b1 - b2 + coefficients[0] / 2;
}
