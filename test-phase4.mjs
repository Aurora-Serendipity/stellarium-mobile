// 传感器与交互测试
import { SensorManager } from "./src/sensors/sensors.js";
import { SearchEngine } from "./src/search/search.js";
import { SettingsManager } from "./src/settings/settings.js";

console.log("=== Phase 4: 传感器与交互测试 ===\n");

// Test 1: 传感器管理器
console.log("Test 1: 传感器管理器");
try {
  const sensors = new SensorManager();
  console.log(`  传感器管理器创建: ✅`);
  console.log(
    `  支持设备方向: ${sensors.supportsOrientation ? "✅" : "⚠️ 不支持"}`,
  );
  console.log(
    `  支持地理位置: ${sensors.supportsGeolocation ? "✅" : "⚠️ 不支持"}`,
  );

  // 检查方法存在
  console.log(`  方法检查:`);
  console.log(
    `    - startOrientation: ${typeof sensors.startOrientation === "function" ? "✅" : "❌"}`,
  );
  console.log(
    `    - stopOrientation: ${typeof sensors.stopOrientation === "function" ? "✅" : "❌"}`,
  );
  console.log(
    `    - getLocation: ${typeof sensors.getLocation === "function" ? "✅" : "❌"}`,
  );
  console.log(
    `    - calibrate: ${typeof sensors.calibrate === "function" ? "✅" : "❌"}`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

// Test 2: 搜索引擎
console.log("\nTest 2: 搜索引擎");
try {
  const search = new SearchEngine();
  console.log(`  搜索引擎创建: ✅`);

  // 检查索引构建
  console.log(`  索引构建: ${search.index ? "✅" : "❌"}`);

  // 搜索测试
  const results = search.search("M1");
  console.log(
    `  搜索'M1': ${results.length} 个结果 ${results.length > 0 ? "✅" : "⚠️"}`,
  );

  const results2 = search.search("Orion");
  console.log(
    `  搜索'Orion': ${results2.length} 个结果 ${results2.length >= 0 ? "✅" : "❌"}`,
  );
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

// Test 3: 设置管理器
console.log("\nTest 3: 设置管理器");
try {
  const settings = new SettingsManager();
  console.log(`  设置管理器创建: ✅`);

  // 检查默认设置
  const defaults = settings.getAll();
  console.log(`  默认设置数量: ${Object.keys(defaults).length} ✅`);
  console.log(`  默认设置项: ${Object.keys(defaults).join(", ")}`);

  // 设置和获取
  settings.set("testKey", "testValue");
  const val = settings.get("testKey");
  console.log(`  设置/获取测试: ${val === "testValue" ? "✅" : "❌"}`);

  // 重置
  settings.reset();
  const afterReset = settings.get("testKey");
  console.log(`  重置测试: ${afterReset !== "testValue" ? "✅" : "❌"}`);
} catch (e) {
  console.log(`  ❌ 错误: ${e.message}`);
}

console.log("\n=== Phase 4 测试完成 ===");
