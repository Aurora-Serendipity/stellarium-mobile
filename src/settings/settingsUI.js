/**
 * 设置面板 UI 控制器
 */

export class SettingsUI {
  constructor(app) {
    this.app = app;
    this.panel = null;
    this.visible = false;
  }

  create() {
    // 创建设置按钮
    const controls = document.getElementById('controls');
    if (controls) {
      const btn = document.createElement('button');
      btn.className = 'control-btn';
      btn.id = 'btn-settings';
      btn.title = '设置';
      btn.innerHTML = '⚙️';
      btn.onclick = () => this.toggle();
      controls.appendChild(btn);
    }

    // 创建面板
    this.panel = document.createElement('div');
    this.panel.id = 'settings-panel';
    this.panel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 400px;
      max-height: 80vh;
      background: rgba(0,0,0,0.92);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 20px;
      display: none;
      z-index: 100;
      overflow-y: auto;
      backdrop-filter: blur(20px);
    `;

    this.panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-size:18px;margin:0;">⚙️ 设置</h2>
        <button id="settings-close" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;">×</button>
      </div>

      <div class="settings-section">
        <h3 style="font-size:14px;opacity:0.7;margin-bottom:12px;">📍 位置</h3>
        <div class="setting-item">
          <label>使用 GPS</label>
          <input type="checkbox" id="setting-gps" checked>
        </div>
        <div class="setting-item">
          <label>纬度</label>
          <input type="number" id="setting-lat" value="39.9" step="0.1" min="-90" max="90">
        </div>
        <div class="setting-item">
          <label>经度</label>
          <input type="number" id="setting-lon" value="116.4" step="0.1" min="-180" max="180">
        </div>
        <button id="setting-location-apply" class="settings-btn">应用位置</button>
      </div>

      <div class="settings-section">
        <h3 style="font-size:14px;opacity:0.7;margin-bottom:12px;">🕐 时间</h3>
        <div class="setting-item">
          <label>使用实时</label>
          <input type="checkbox" id="setting-realtime" checked>
        </div>
        <div class="setting-item">
          <label>日期时间</label>
          <input type="datetime-local" id="setting-datetime">
        </div>
      </div>

      <div class="settings-section">
        <h3 style="font-size:14px;opacity:0.7;margin-bottom:12px;">👁️ 显示</h3>
        <div class="setting-item">
          <label>显示恒星</label>
          <input type="checkbox" id="setting-show-stars" checked>
        </div>
        <div class="setting-item">
          <label>显示星座</label>
          <input type="checkbox" id="setting-show-constellations" checked>
        </div>
        <div class="setting-item">
          <label>显示深空天体</label>
          <input type="checkbox" id="setting-show-dso" checked>
        </div>
        <div class="setting-item">
          <label>显示行星</label>
          <input type="checkbox" id="setting-show-planets" checked>
        </div>
        <div class="setting-item">
          <label>显示银河</label>
          <input type="checkbox" id="setting-show-galaxy" checked>
        </div>
        <div class="setting-item">
          <label>显示网格</label>
          <input type="checkbox" id="setting-show-grid">
        </div>
        <div class="setting-item">
          <label>星等限制</label>
          <input type="range" id="setting-mag-limit" min="3" max="8" step="0.5" value="6">
          <span id="mag-limit-value">6.0</span>
        </div>
      </div>

      <div class="settings-section">
        <h3 style="font-size:14px;opacity:0.7;margin-bottom:12px;">📱 传感器</h3>
        <div class="setting-item">
          <label>启用传感器</label>
          <input type="checkbox" id="setting-sensor" checked>
        </div>
        <div class="setting-item">
          <label>平滑系数</label>
          <input type="range" id="setting-smoothing" min="0" max="1" step="0.1" value="0.3">
        </div>
      </div>

      <div class="settings-section">
        <button id="settings-reset" class="settings-btn" style="background:rgba(255,100,100,0.3);">重置所有设置</button>
      </div>
    `;

    document.body.appendChild(this.panel);

    // 添加样式
    this._addStyles();

    // 绑定事件
    this._bindEvents();
  }

  _addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .settings-section {
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      .settings-section:last-child {
        border-bottom: none;
      }
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .setting-item label {
        font-size: 14px;
        opacity: 0.9;
      }
      .setting-item input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: #6496ff;
      }
      .setting-item input[type="number"],
      .setting-item input[type="datetime-local"] {
        width: 140px;
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.1);
        color: #fff;
        font-size: 13px;
      }
      .setting-item input[type="range"] {
        width: 100px;
        accent-color: #6496ff;
      }
      .settings-btn {
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(100,150,255,0.3);
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .settings-btn:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }

  _bindEvents() {
    // 关闭按钮
    document.getElementById('settings-close')?.addEventListener('click', () => this.hide());

    // GPS 开关
    document.getElementById('setting-gps')?.addEventListener('change', (e) => {
      const latInput = document.getElementById('setting-lat');
      const lonInput = document.getElementById('setting-lon');
      latInput.disabled = e.target.checked;
      lonInput.disabled = e.target.checked;
    });

    // 应用位置
    document.getElementById('setting-location-apply')?.addEventListener('click', () => {
      const lat = parseFloat(document.getElementById('setting-lat').value);
      const lon = parseFloat(document.getElementById('setting-lon').value);
      if (!isNaN(lat) && !isNaN(lon)) {
        this.app.latitude = lat;
        this.app.longitude = lon;
        this.app._updateLocationDisplay();
        this.app.settings.set('location.latitude', lat);
        this.app.settings.set('location.longitude', lon);
      }
    });

    // 显示选项
    const displayOptions = [
      { id: 'setting-show-stars', layer: 'stars' },
      { id: 'setting-show-constellations', layer: 'constellations' },
      { id: 'setting-show-dso', layer: 'dso' },
      { id: 'setting-show-planets', layer: 'planets' },
      { id: 'setting-show-galaxy', layer: 'galaxy' },
      { id: 'setting-show-grid', layer: 'grid' }
    ];

    for (const opt of displayOptions) {
      document.getElementById(opt.id)?.addEventListener('change', (e) => {
        const currentVisible = this.app.renderer.layers[opt.layer];
        if (currentVisible !== e.target.checked) {
          this.app.renderer.toggleLayer(opt.layer);
        }
      });
    }

    // 星等限制
    document.getElementById('setting-mag-limit')?.addEventListener('input', (e) => {
      document.getElementById('mag-limit-value').textContent = e.target.value;
    });

    // 传感器
    document.getElementById('setting-sensor')?.addEventListener('change', (e) => {
      if (e.target.checked) {
        this.app.sensorEnabled = true;
        this.app.sensors.start();
      } else {
        this.app.sensorEnabled = false;
        this.app.sensors.stop();
      }
    });

    // 重置
    document.getElementById('settings-reset')?.addEventListener('click', () => {
      if (confirm('确定要重置所有设置吗？')) {
        this.app.settings.reset();
        location.reload();
      }
    });
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    this.panel.style.display = 'block';
    this.visible = true;
  }

  hide() {
    this.panel.style.display = 'none';
    this.visible = false;
  }
}
