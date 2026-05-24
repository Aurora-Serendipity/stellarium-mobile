// 数据层测试
import { getBrightStars } from "./src/data/brightStars.js";
import {
  CONSTELLATIONS,
  CONSTELLATION_LINES,
} from "./src/data/constellationData.js";
import {
  dsoCatalog,
  DSO_TYPES,
  MESSIER_OBJECTS,
} from "./src/data/dsoCatalog.js";
import {
  generateExtendedStars,
  mergeStarCatalogs,
} from "./src/data/extendedStars.js";
import { StarCatalog, generateTestStars } from "./src/data/starCatalog.js";

console.log("=== Phase 2: 数据层测试 ===\n");

// Test 1: 亮星表
console.log("Test 1: 亮星表");
try {
  const brightStars = getBrightStars();
  console.log(
    `  亮星数量: ${brightStars.length} ${brightStars.length > 0 ? "✅" : "❌"}`,
  );

  if (brightStars.length > 0) {
    const first = brightStars[0];
    console.log(
      `  第一颗星: ${first.name || "未命名"}, 星等=${first.magnitude}, RA=${first.ra?.toFixed(2)}°, Dec=${first.dec?.toFixed(2)}°`,
    );
    console.log(
      `  数据完整性: ${first.ra !== undefined && first.dec !== undefined && first.magnitude !== undefined ? "✅" : "❌"}`,
    );

    // 检查是否有重复ID
    const ids = brightStars.map((s) => s.id);
    const uniqueIds = new Set(ids);
    console.log(
      `  ID唯一性: ${ids.length === uniqueIds.size ? "✅" : "❌ 有重复!"}`,
    );

    // 检查星等范围
    const mags = brightStars.map((s) => s.magnitude);
    const minMag = Math.min(...mags);
    const maxMag = Math.max(...mags);
    console.log(
      `  星等范围: ${minMag.toFixed(2)} - ${maxMag.toFixed(2)} ${minMag < maxMag ? "✅" : "❌"}`,
    );
  }
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
  console.log(`  堆栈: ${e.stack}`);
}

// Test 2: 星座数据
console.log("\nTest 2: 星座数据");
try {
  console.log(
    `  星座数量: ${CONSTELLATIONS.length} ${CONSTELLATIONS.length === 88 ? "✅" : "❌"}`,
  );

  if (CONSTELLATIONS.length > 0) {
    const first = CONSTELLATIONS[0];
    console.log(
      `  第一个星座: ${first.name} (${first.abbr}), 中心: RA=${first.ra}°, Dec=${first.dec}°`,
    );
    console.log(
      `  数据完整性: ${first.name && first.abbr && first.ra !== undefined && first.dec !== undefined ? "✅" : "❌"}`,
    );
  }

  console.log(
    `  星座连线数量: ${CONSTELLATION_LINES.length} ${CONSTELLATION_LINES.length > 0 ? "✅" : "❌"}`,
  );

  if (CONSTELLATION_LINES.length > 0) {
    const firstLine = CONSTELLATION_LINES[0];
    console.log(
      `  第一条连线: 星座=${firstLine.constellation}, 坐标点数=${firstLine.coords?.length || 0}`,
    );
    console.log(
      `  连线数据格式: ${firstLine.coords && firstLine.coords.length > 0 && firstLine.coords[0].ra !== undefined ? "✅" : "❌"}`,
    );
  }
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

// Test 3: 深空天体
console.log("\nTest 3: 深空天体");
try {
  console.log(`  DSO类型数: ${Object.keys(DSO_TYPES).length} ✅`);
  console.log(
    `  梅西耶天体数: ${MESSIER_OBJECTS.length} ${MESSIER_OBJECTS.length > 0 ? "✅" : "❌"}`,
  );

  const dso = dsoCatalog;
  const allDSO = dso.getAll();
  console.log(
    `  深空天体总数: ${allDSO.length} ${allDSO.length > 0 ? "✅" : "❌"}`,
  );

  if (allDSO.length > 0) {
    const first = allDSO[0];
    console.log(
      `  第一个DSO: ${first.m} ${first.name || ""}, 类型=${first.type}, 星等=${first.mag}`,
    );
    console.log(
      `  数据完整性: ${first.ra !== undefined && first.dec !== undefined && first.mag !== undefined ? "✅" : "❌"}`,
    );
  }

  // 按类型筛选
  const galaxies = dso.getByType("G");
  console.log(`  星系数量: ${galaxies.length} ✅`);

  const byCon = dso.getByConstellation("Ori");
  console.log(`  猎户座DSO: ${byCon.length} ✅`);
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
  console.log(`  堆栈: ${e.stack}`);
}

// Test 4: 扩展星表
console.log("\nTest 4: 扩展星表");
try {
  const extended = generateExtendedStars();
  console.log(
    `  扩展星数量: ${extended.length} ${extended.length > 0 ? "✅" : "❌"}`,
  );

  if (extended.length > 0) {
    const first = extended[0];
    console.log(
      `  第一颗扩展星: ID=${first.id}, 星等=${first.magnitude.toFixed(2)}, 星座=${first.constellation}`,
    );
    console.log(`  ID起始值: ${first.id >= 1000 ? "✅" : "❌ (应从1000开始)"}`);

    // 检查星等分布
    const mags = extended.map((s) => s.magnitude);
    const avgMag = mags.reduce((a, b) => a + b, 0) / mags.length;
    console.log(
      `  平均星等: ${avgMag.toFixed(2)} ${avgMag > 3 && avgMag < 6 ? "✅" : "⚠️"}`,
    );
  }

  // 合并测试
  const brightStars = getBrightStars();
  const merged = mergeStarCatalogs(brightStars, extended);
  console.log(
    `  合并后总数: ${merged.length} = ${brightStars.length} + ${extended.length} ${merged.length === brightStars.length + extended.length ? "✅" : "❌"}`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
  console.log(`  堆栈: ${e.stack}`);
}

// Test 5: 星表管理器
console.log("\nTest 5: 星表管理器");
try {
  const catalog = new StarCatalog();
  console.log(`  星表初始化: ✅`);

  const testStars = generateTestStars();
  console.log(`  测试星数量: ${testStars.length} ✅`);

  // 搜索测试
  const results = catalog.searchByName("天狼");
  console.log(`  搜索'天狼': ${results.length} 个结果 ✅`);

  // 区域筛选
  const region = catalog.filterByRegion(100, 0, 10);
  console.log(`  区域筛选(100,0,10°): ${region.length} 颗星 ✅`);
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
  console.log(`  堆栈: ${e.stack}`);
}

console.log("\n=== Phase 2 测试完成 ===");
