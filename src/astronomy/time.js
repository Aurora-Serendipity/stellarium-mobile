/**
 * 时间系统转换
 * UTC -> TT -> TDB -> Julian Date
 * 包含 ΔT 计算（内置简化表 1970-2030）
 */

// ΔT 简化表 (年份 -> 秒数)
// 数据来源: NASA Eclipse Website
const DELTA_T_TABLE = {
  1970: 40.18, 1975: 45.48, 1980: 50.54, 1985: 54.34,
  1990: 56.86, 1995: 60.78, 2000: 63.83, 2005: 64.68,
  2010: 66.07, 2015: 67.64, 2020: 69.36, 2025: 71.0,
  2030: 72.5
};

/**
 * 获取指定年份的 ΔT（世界时与力学时差）
 * 使用线性插值
 */
export function getDeltaT(year) {
  const years = Object.keys(DELTA_T_TABLE).map(Number).sort((a, b) => a - b);
  
  // 超出范围使用外推
  if (year <= years[0]) return DELTA_T_TABLE[years[0]];
  if (year >= years[years.length - 1]) return DELTA_T_TABLE[years[years.length - 1]];
  
  // 线性插值
  for (let i = 0; i < years.length - 1; i++) {
    if (year >= years[i] && year <= years[i + 1]) {
      const t = (year - years[i]) / (years[i + 1] - years[i]);
      return DELTA_T_TABLE[years[i]] + t * (DELTA_T_TABLE[years[i + 1]] - DELTA_T_TABLE[years[i]]);
    }
  }
  return 69.0; // 默认值
}

/**
 * Date 对象 -> Julian Date
 * 高精度算法
 */
export function dateToJulianDate(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const hour = date.getUTCHours();
  const min = date.getUTCMinutes();
  const sec = date.getUTCSeconds() + date.getUTCMilliseconds() / 1000;
  
  // 将月份转换为天文历格式（1月=13，2月=14，上年）
  let yy = y;
  let mm = m;
  if (m <= 2) {
    yy = y - 1;
    mm = m + 12;
  }
  
  const dayFrac = (hour + min / 60 + sec / 3600) / 24;
  
  // 格里高利历修正
  const A = Math.floor(yy / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  const JD = Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + dayFrac + B - 1524.5;
  
  return JD;
}

/**
 * Julian Date -> Date 对象
 */
export function julianDateToDate(jd) {
  const JD = jd + 0.5;
  const Z = Math.floor(JD);
  const F = JD - Z;
  
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  
  // 时间部分
  const daySeconds = F * 86400;
  const hour = Math.floor(daySeconds / 3600);
  const min = Math.floor((daySeconds % 3600) / 60);
  const sec = daySeconds % 60;
  
  return new Date(Date.UTC(year, month - 1, day, hour, min, Math.floor(sec)));
}

/**
 * UTC -> Terrestrial Time (TT)
 * TT = UTC + ΔT + 32.184s
 */
export function utcToTT(date) {
  const year = date.getUTCFullYear() + date.getUTCMonth() / 12;
  const deltaT = getDeltaT(year);
  return new Date(date.getTime() + (deltaT + 32.184) * 1000);
}

/**
 * TT -> Barycentric Dynamical Time (TDB)
 * 简化公式，精度约 1ms
 */
export function ttToTDB(tt) {
  const jd = dateToJulianDate(tt);
  // TDB ≈ TT + 0.001658s * sin(g) + 0.000014s * sin(2g)
  // 其中 g 是地球平近点角
  const g = (357.52911 + 35999.05029 * (jd - 2451545.0) / 36525) * Math.PI / 180;
  const correction = 0.001658 * Math.sin(g) + 0.000014 * Math.sin(2 * g);
  return new Date(tt.getTime() + correction * 1000);
}

/**
 * Julian Date of Terrestrial Time
 */
export function getJulianEphemerisDate(date) {
  const tt = utcToTT(date);
  return dateToJulianDate(tt);
}

/**
 * 计算世纪数（从 J2000.0 起算）
 * T = (JDE - 2451545.0) / 36525
 */
export function getJulianCenturies(jde) {
  return (jde - 2451545.0) / 36525;
}

/**
 * 计算千年数（从 J2000.0 起算）
 */
export function getJulianMillennia(jde) {
  return (jde - 2451545.0) / 365250;
}

/**
 * 本地恒星时 (Local Sidereal Time)
 * 使用 IAU 2000 简化公式
 */
export function getLocalSiderealTime(jd, longitude) {
  // 格林尼治平恒星时
  const T = getJulianCenturies(jd);
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
               0.000387933 * T * T - T * T * T / 38710000;
  
  // 调整到 0-360 范围
  let lst = gmst + longitude;
  lst = ((lst % 360) + 360) % 360;
  
  return lst; // 度
}

/**
 * 格林尼治平恒星时（弧度）
 */
export function getGMST(jd) {
  const lst = getLocalSiderealTime(jd, 0);
  return lst * Math.PI / 180;
}
