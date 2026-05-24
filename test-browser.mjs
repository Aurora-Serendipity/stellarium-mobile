// 模拟浏览器环境
global.document = {
  getElementById: (id) => ({
    style: {},
    textContent: "",
    innerHTML: "",
    addEventListener: () => {},
    querySelectorAll: () => [],
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    focus: () => {},
  }),
  addEventListener: () => {},
};

Object.defineProperty(global, "window", {
  value: {
    addEventListener: () => {},
    devicePixelRatio: 1,
  },
  writable: true,
  configurable: true,
});

global.THREE = {
  Scene: class {},
  PerspectiveCamera: class {
    constructor() {
      this.position = { set: () => {} };
    }
    getWorldDirection() {
      return { x: 0, y: 0, z: 0 };
    }
  },
  WebGLRenderer: class {
    constructor() {
      this.domElement = { style: {} };
      this.setSize = () => {};
      this.setPixelRatio = () => {};
      this.render = () => {};
      this.dispose = () => {};
    }
  },
  Vector3: class {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  },
  Group: class {
    add() {}
  },
  BufferGeometry: class {
    setAttribute() {}
    setIndex() {}
  },
  BufferAttribute: class {},
  Points: class {},
  PointsMaterial: class {},
  Line: class {},
  LineBasicMaterial: class {},
  Sprite: class {},
  SpriteMaterial: class {},
  CanvasTexture: class {},
  RingGeometry: class {},
  MeshBasicMaterial: class {},
  Mesh: class {},
  SphereGeometry: class {},
  Color: class {
    constructor() {}
    setHSL() {}
  },
  DoubleSide: 2,
  AdditiveBlending: 1,
  Raycaster: class {
    setFromCamera() {}
    intersectObjects() {
      return [];
    }
  },
  Frustum: class {
    setFromProjectionMatrix() {}
  },
  Matrix4: class {},
  Clock: class {
    getDelta() {
      return 0.016;
    }
  },
};

global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

Object.defineProperty(global, "navigator", {
  value: {
    geolocation: {
      watchPosition: () => 1,
      clearWatch: () => {},
    },
  },
  writable: true,
  configurable: true,
});

const logs = [];
const origLog = console.log;
console.log = (...args) => {
  logs.push(args.join(" "));
  origLog(...args);
};

async function test() {
  try {
    // 测试导入天文模块
    const Astronomy = await import("./src/astronomy/index.js");
    console.log("✅ 天文模块导入成功");

    // 测试关键函数存在
    const requiredFns = [
      "dateToJulianDate",
      "getLocalSiderealTime",
      "getSunEquatorial",
      "getMoonEquatorial",
      "getPlanetEquatorial",
      "getMoonPhaseName",
    ];
    for (const fn of requiredFns) {
      if (typeof Astronomy[fn] === "function") {
        console.log(`✅ ${fn} 存在`);
      } else {
        console.log(`❌ ${fn} 不存在`);
      }
    }

    // 测试数据模块
    const Data = await import("./src/data/index.js");
    console.log("✅ 数据模块导入成功");

    // 测试搜索模块
    const Search = await import("./src/search/search.js");
    console.log("✅ 搜索模块导入成功");

    // 测试设置模块
    const Settings = await import("./src/settings/settings.js");
    console.log("✅ 设置模块导入成功");

    // 测试渲染模块（需要 THREE.js）
    try {
      const Render = await import("./src/render/renderer.js");
      console.log("✅ 渲染模块导入成功");
    } catch (e) {
      console.log(`⚠️ 渲染模块导入失败: ${e.message}`);
    }

    console.log("\n=== 测试完成 ===");
    return logs;
  } catch (err) {
    console.log(`❌ 测试失败: ${err.message}`);
    console.log(err.stack);
    return logs;
  }
}

test().then(() => {
  console.log("\n所有日志:");
  logs.forEach((l) => origLog(l));
});
