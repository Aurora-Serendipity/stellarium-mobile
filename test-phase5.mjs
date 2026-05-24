/**
 * Phase 5 — 完整集成测试
 * 模拟浏览器环境，测试所有模块的导入和使用
 */

import * as THREE from "three";

// ============================================
// 模拟浏览器环境
// ============================================
global.document = {
  getElementById: () => ({
    style: {},
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    addEventListener: () => {},
    querySelectorAll: () => [],
    focus: () => {},
  }),
  createElement: (tag) =>
    tag === "canvas" ? { getContext: () => ({}) } : { style: {} },
  addEventListener: () => {},
};

Object.defineProperty(global, "window", {
  value: {
    addEventListener: () => {},
    devicePixelRatio: 3,
    innerWidth: 390,
    innerHeight: 844,
  },
  writable: true,
  configurable: true,
});
Object.defineProperty(global, "navigator", {
  value: {
    geolocation: {
      watchPosition: (cb) => {
        cb({ coords: { latitude: 39.9, longitude: 116.4 } });
        return 1;
      },
      clearWatch: () => {},
    },
    userAgent: "Mozilla/5.0",
  },
  writable: true,
  configurable: true,
});

global.localStorage = {
  _s: {},
  getItem: (k) => global.localStorage._s[k] || null,
  setItem: (k, v) => {
    global.localStorage._s[k] = v;
  },
  removeItem: (k) => {
    delete global.localStorage._s[k];
  },
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.performance = { now: () => Date.now() };
global.location = { href: "https://localhost/" };

let passed = 0,
  failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name} — ${e.message}`);
    failed++;
  }
}

async function main() {
  console.log("🧪 Phase 5 — 完整集成测试\n");
  console.log("=".repeat(50));

  // === 模块加载 ===
  console.log("\n📦 1. 模块加载");

  let Astronomy, Data, Search, Settings, Sensors, Renderer, App;

  try {
    Astronomy = await import("./src/astronomy/index.js");
    console.log("  ✅ 天文引擎");
  } catch (e) {
    console.log(`  ❌ 天文引擎: ${e.message}`);
    failed++;
  }

  try {
    Data = await import("./src/data/index.js");
    console.log("  ✅ 数据层");
  } catch (e) {
    console.log(`  ❌ 数据层: ${e.message}`);
    failed++;
  }

  try {
    Renderer = await import("./src/render/renderer.js");
    console.log("  ✅ 渲染引擎");
  } catch (e) {
    console.log(`  ❌ 渲染引擎: ${e.message}`);
    failed++;
  }

  try {
    Search = await import("./src/search/search.js");
    console.log("  ✅ 搜索引擎");
  } catch (e) {
    console.log(`  ❌ 搜索引擎: ${e.message}`);
    failed++;
  }

  try {
    Sensors = await import("./src/sensors/sensors.js");
    console.log("  ✅ 传感器");
  } catch (e) {
    console.log(`  ❌ 传感器: ${e.message}`);
    failed++;
  }

  try {
    Settings = await import("./src/settings/settings.js");
    console.log("  ✅ 设置");
  } catch (e) {
    console.log(`  ❌ 设置: ${e.message}`);
    failed++;
  }

  // === 天文计算 ===
  console.log("\n🔭 2. 天文计算");

  check("儒略日计算", () => {
    const jd = Astronomy.dateToJulianDate(new Date("2026-05-24T12:00:00Z"));
    if (jd < 2461000 || jd > 2462000) throw new Error(`异常值: ${jd}`);
  });

  check("恒星时", () => {
    const lst = Astronomy.getLocalSiderealTime(2461190.0, 116.4);
    if (lst < 0 || lst > 360) throw new Error(`超出范围: ${lst}`);
  });

  check("太阳位置", () => {
    const s = Astronomy.getSunEquatorial(2461190.0);
    if (!s.ra || !s.dec || s.distance < 0.9 || s.distance > 1.1)
      throw new Error(`异常: dist=${s.distance?.toFixed(2)}`);
  });

  check("月球位置", () => {
    const m = Astronomy.getMoonEquatorial(2461190.0);
    if (!m.ra || !m.dec || m.phase < 0 || m.phase > 1)
      throw new Error(`phase=${m.phase?.toFixed(2)}`);
  });

  check("行星位置", () => {
    for (const p of ["mercury", "venus", "mars", "jupiter", "saturn"]) {
      const pos = Astronomy.getPlanetEquatorial(p, 2461190.0);
      if (!pos.ra || !pos.dec || pos.distance <= 0)
        throw new Error(`${p} 失效: dist=${pos.distance?.toFixed(2)}`);
    }
  });

  check("月相名称", () => {
    const name = Astronomy.getMoonPhaseName(0.5);
    if (typeof name !== "string") throw new Error(`非字符串: ${typeof name}`);
  });

  // === 数据层 ===
  console.log("\n📊 3. 数据层");

  check("亮星星表", () => {
    const stars = Data.generateTestStars();
    if (!Array.isArray(stars) || stars.length === 0) throw new Error("空星表");
    if (!stars[0].ra || !stars[0].dec || !stars[0].magnitude)
      throw new Error("数据不完整");
  });

  check("扩展星表", () => {
    const stars = Data.generateExtendedStars();
    if (!Array.isArray(stars) || stars.length < 100)
      throw new Error(`太少: ${stars.length}`);
  });

  check("星表合并", () => {
    const m = Data.mergeStarCatalogs(
      Data.generateTestStars(),
      Data.generateExtendedStars(),
    );
    if (m.length < 1000) throw new Error(`不足: ${m.length}`);
  });

  check("星座连线数据", () => {
    if (!Array.isArray(Data.CONSTELLATION_LINES)) throw new Error("不是数组");
    if (Data.CONSTELLATION_LINES.length < 30)
      throw new Error(`连线太少: ${Data.CONSTELLATION_LINES.length}`);
    // 验证新格式
    const line = Data.CONSTELLATION_LINES[0];
    if (!line.constellation || !line.coords)
      throw new Error("格式不正确（缺 constellation/coords）");
    if (!Array.isArray(line.coords) || line.coords.length < 2)
      throw new Error("坐标数组无效");
  });

  check("深空天体数据", () => {
    let all;
    try {
      all = Data.dsoCatalog.getAll();
    } catch (e) {
      all = Data.dsoCatalog.filterByType
        ? Data.dsoCatalog.filterByType("G")
        : [];
    }
    if (!Array.isArray(all) || all.length === 0)
      throw new Error(`空: ${all?.length || 0}`);
  });

  // === 搜索 ===
  console.log("\n🔍 4. 搜索引擎");

  const allStars = Data.mergeStarCatalogs(
    Data.generateTestStars(),
    Data.generateExtendedStars(),
  );
  const dsoAll = Data.dsoCatalog.getAll ? Data.dsoCatalog.getAll() : [];
  const engine = new Search.SearchEngine(allStars, Data.CONSTELLATIONS, dsoAll);

  check("搜索功能可用", () => {
    const r = engine.search("test", 5);
    if (!Array.isArray(r)) throw new Error("未返回数组");
  });

  check("搜索返回格式", () => {
    const r = engine.search("M", 5);
    if (r.length > 0) {
      const item = r[0];
      if (!item.name || !item.type)
        throw new Error(`格式错误: ${JSON.stringify(item).slice(0, 80)}`);
    }
  });

  // === 设置 ===
  console.log("\n⚙️ 5. 设置管理器");

  const settings = new Settings.SettingsManager();

  check("默认值", () => {
    const all = settings.getAll();
    if (!all.location || !all.display) throw new Error("结构不完整");
    if (all.location.latitude !== 39.9) throw new Error("默认纬度错误");
  });

  check("读写", () => {
    settings.set("display.showGrid", true);
    if (settings.get("display.showGrid") !== true)
      throw new Error("读写不匹配");
    settings.set("display.showGrid", false);
  });

  check("嵌套键", () => {
    settings.set("location.latitude", 45.0);
    if (Math.abs(settings.get("location.latitude") - 45.0) > 0.01)
      throw new Error("嵌套失败");
    settings.set("location.latitude", 39.9);
  });

  check("持久化（localStorage）", () => {
    settings.set("display.magnitudeLimit", 4.5);
    const s2 = new Settings.SettingsManager();
    const val = s2.get("display.magnitudeLimit");
    settings.set("display.magnitudeLimit", 6.0); // 恢复
    if (Math.abs(val - 4.5) > 0.01) throw new Error(`持久化失败: ${val}`);
  });

  // === 主应用 ===
  console.log("\n🚀 6. 主应用模块");

  try {
    App = await import("./src/main.js");
    console.log("  ✅ main.js 模块导入成功");
    passed++;
  } catch (e) {
    console.log(`  ❌ main.js 导入失败: ${e.message}`);
    failed++;
  }

  check("window.app 暴露", () => {
    if (!global.window.app) throw new Error("window.app 不存在");
  });

  check("window.Astronomy 暴露", () => {
    if (!global.window.Astronomy) throw new Error("window.Astronomy 不存在");
  });

  // === 报告 ===
  console.log("\n" + "=".repeat(50));
  console.log(
    `📊 结果: ${passed} 通过, ${failed} 失败 (共 ${passed + failed} 项)`,
  );
  console.log("=".repeat(50));

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("💥 测试崩溃:", err.message);
  process.exit(1);
});
