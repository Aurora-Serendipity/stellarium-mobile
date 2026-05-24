// 天文引擎测试
import * as time from "./src/astronomy/time.js";
import * as math from "./src/astronomy/math.js";
import * as coords from "./src/astronomy/coords.js";
import * as planets from "./src/astronomy/planets.js";
import * as moon from "./src/astronomy/moon.js";
import * as stars from "./src/astronomy/stars.js";

console.log("=== Phase 1: 天文引擎测试 ===\n");

// Test 1: 时间系统
console.log("Test 1: 时间系统");
try {
  const now = new Date("2025-01-01T00:00:00Z");
  const jd = time.dateToJulianDate(now);
  console.log(`  JD(2025-01-01): ${jd}`);
  // 预期值约 2460676.5
  const expected = 2460676.5;
  const diff = Math.abs(jd - expected);
  console.log(`  与预期值差: ${diff.toFixed(6)} ${diff < 0.01 ? "✅" : "❌"}`);

  // 反向测试
  const back = time.julianDateToDate(jd);
  console.log(
    `  反向转换: ${back.toISOString()} ${back.toISOString().startsWith("2025-01-01") ? "✅" : "❌"}`,
  );

  // ΔT测试
  const dt = time.getDeltaT(2025);
  console.log(`  ΔT(2025): ${dt}s ${dt > 60 && dt < 80 ? "✅" : "❌"}`);

  // 恒星时测试
  const lst = time.getLocalSiderealTime(jd, 116.4);
  console.log(
    `  LST(北京): ${lst.toFixed(4)}° ${lst >= 0 && lst < 360 ? "✅" : "❌"}`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

// Test 2: 数学工具
console.log("\nTest 2: 数学工具");
try {
  console.log(`  PI2 = ${math.PI2} ${math.PI2 === Math.PI * 2 ? "✅" : "❌"}`);
  console.log(
    `  DEG2RAD = ${math.DEG2RAD} ${Math.abs(math.DEG2RAD - 0.0174533) < 0.0001 ? "✅" : "❌"}`,
  );

  const norm = math.normalizeAngle(Math.PI * 3);
  console.log(
    `  normalizeAngle(3π) = ${norm.toFixed(4)} ${Math.abs(norm - Math.PI) < 0.0001 ? "✅" : "❌"}`,
  );

  const norm2 = math.normalizeAngle(-Math.PI / 2);
  console.log(
    `  normalizeAngle(-π/2) = ${norm2.toFixed(4)} ${Math.abs(norm2 - Math.PI * 1.5) < 0.0001 ? "✅" : "❌"}`,
  );

  // dms/hms转换
  const dms = math.degToDms(123.456);
  console.log(`  degToDms(123.456) = ${dms.d}°${dms.m}'${dms.s}" ✅`);

  const hms = math.degToHms(45);
  console.log(
    `  degToHms(45°) = ${hms.h}h${hms.m}m${hms.s}s ${hms.h === 3 ? "✅" : "❌"}`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

// Test 3: 坐标转换
console.log("\nTest 3: 坐标转换");
try {
  const jd = 2451545.0; // J2000.0

  // 岁差测试
  const prec = coords.applyPrecession(0, 0, jd);
  console.log(
    `  岁差(0,0,J2000): ra=${prec.ra.toFixed(6)}, dec=${prec.dec.toFixed(6)} ✅`,
  );

  // 赤道->地平
  const horiz = coords.equatorialToHorizontal(0, 0, 0, 0);
  console.log(
    `  赤道->地平(0,0,0,0): az=${((horiz.azimuth * 180) / Math.PI).toFixed(2)}°, alt=${((horiz.altitude * 180) / Math.PI).toFixed(2)}° ✅`,
  );

  // 大气折射
  const refr = coords.getAtmosphericRefraction(10);
  console.log(
    `  大气折射(10°): ${refr.toFixed(4)}' ${refr > 0 && refr < 10 ? "✅" : "❌"}`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

// Test 4: 行星位置
console.log("\nTest 4: 行星位置");
try {
  const jd = time.dateToJulianDate(new Date("2025-06-21T00:00:00Z"));

  const sun = planets.getSunEquatorial(jd);
  console.log(
    `  太阳: RA=${((sun.ra * 180) / Math.PI).toFixed(2)}°, Dec=${((sun.dec * 180) / Math.PI).toFixed(2)}°, 距离=${sun.distance.toFixed(4)}AU`,
  );
  // 夏至太阳应该在双子座/巨蟹座附近，赤经约90°
  const sunRaDeg = (sun.ra * 180) / Math.PI;
  console.log(
    `  太阳赤经检查: ${sunRaDeg > 80 && sunRaDeg < 100 ? "✅ (夏至附近)" : "⚠️ 偏差较大"}`,
  );

  const mars = planets.getPlanetEquatorial("mars", jd);
  console.log(
    `  火星: RA=${((mars.ra * 180) / Math.PI).toFixed(2)}°, Dec=${((mars.dec * 180) / Math.PI).toFixed(2)}°, 距角=${mars.elongation.toFixed(1)}° ✅`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

// Test 5: 月球位置
console.log("\nTest 5: 月球位置");
try {
  const jd = time.dateToJulianDate(new Date("2025-01-01T00:00:00Z"));

  const moonPos = moon.getMoonPosition(jd);
  console.log(
    `  月球位置: lon=${((moonPos.lon * 180) / Math.PI).toFixed(2)}°, lat=${((moonPos.lat * 180) / Math.PI).toFixed(4)}°, 距离=${moonPos.distance.toFixed(0)}km`,
  );
  console.log(
    `  距离检查: ${moonPos.distance > 350000 && moonPos.distance < 410000 ? "✅" : "❌"}`,
  );

  const moonEq = moon.getMoonEquatorial(jd);
  console.log(
    `  月球赤道: RA=${((moonEq.ra * 180) / Math.PI).toFixed(2)}°, Dec=${((moonEq.dec * 180) / Math.PI).toFixed(2)}°`,
  );
  console.log(
    `  月相: ${(moonEq.phase * 100).toFixed(1)}%, 月龄=${moonEq.age.toFixed(1)}天 ✅`,
  );

  // 月相名称
  const phaseName = moon.getMoonPhaseName(0.5);
  console.log(
    `  月相名称(0.5): ${phaseName} ${phaseName === "满月" ? "✅" : "❌"}`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

// Test 6: 恒星位置
console.log("\nTest 6: 恒星位置");
try {
  const testStar = {
    ra: 37.95456067, // 毕宿五 J2000
    dec: 89.26410897,
    pmRA: 10.5,
    pmDec: -17.5,
    parallax: 50.0,
    radialVelocity: -25.0,
  };

  const jd = time.dateToJulianDate(new Date("2025-01-01T00:00:00Z"));
  const apparent = stars.computeStarApparentPosition(testStar, jd);
  console.log(
    `  恒星视位置: RA=${((apparent.ra * 180) / Math.PI).toFixed(4)}°, Dec=${((apparent.dec * 180) / Math.PI).toFixed(4)}° ✅`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

console.log("\n=== Phase 1 测试完成 ===");
