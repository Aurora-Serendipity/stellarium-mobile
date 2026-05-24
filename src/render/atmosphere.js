/**
 * 大气效果渲染器
 * 包括地平线光晕、光污染、晨昏蒙影
 */

import * as THREE from "three";

export class AtmosphereRenderer {
  constructor(scene) {
    this.scene = scene;
    this.meshes = [];
    this.lightPollutionLevel = 0; // 0-9 (Bortle scale)
    this.visible = true;
  }

  /**
   * 创建大气效果
   */
  create() {
    this._createHorizonGlow();
    this._createZenithDarkening();
    this._createLightPollution();
  }

  /**
   * 地平线光晕
   */
  _createHorizonGlow() {
    const geometry = new THREE.SphereGeometry(
      1.2,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.3,
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uSunAltitude: { value: 0 },
        uMoonAltitude: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying float vHeight;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vHeight = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uSunAltitude;
        uniform float uMoonAltitude;
        varying vec3 vWorldPosition;
        varying float vHeight;

        void main() {
          float height = max(0.0, vHeight);

          // 太阳贡献 (黄昏/黎明)
          float sunGlow = 0.0;
          if (uSunAltitude > -18.0 && uSunAltitude < 0.0) {
            float twilight = 1.0 - abs(uSunAltitude) / 18.0;
            sunGlow = twilight * twilight * 0.3;
          }

          // 月光贡献
          float moonGlow = 0.0;
          if (uMoonAltitude > 0.0) {
            moonGlow = uMoonAltitude / 90.0 * 0.05;
          }

          float totalGlow = sunGlow + moonGlow;

          // 颜色：地平线偏橙，高空偏蓝
          vec3 dayColor = vec3(0.4, 0.5, 0.7);
          vec3 twilightColor = vec3(0.8, 0.5, 0.3);
          vec3 color = mix(twilightColor, dayColor, sunGlow / max(totalGlow, 0.001));

          float alpha = totalGlow * (1.0 - height * 3.0);
          alpha = clamp(alpha, 0.0, 0.4);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "horizonGlow";
    this.scene.add(mesh);
    this.meshes.push(mesh);
  }

  /**
   * 天顶变暗 (抵消地平线光晕)
   */
  _createZenithDarkening() {
    const geometry = new THREE.SphereGeometry(1.3, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uIntensity: { value: 0.3 },
      },
      vertexShader: `
        varying float vHeight;
        void main() {
          vHeight = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uIntensity;
        varying float vHeight;

        void main() {
          float darkening = smoothstep(-0.2, 1.0, vHeight) * uIntensity;
          gl_FragColor = vec4(0.0, 0.0, 0.0, darkening);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "zenithDarkening";
    this.scene.add(mesh);
    this.meshes.push(mesh);
  }

  /**
   * 光污染效果
   */
  _createLightPollution() {
    const geometry = new THREE.SphereGeometry(
      1.1,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5,
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uLevel: { value: 0.0 },
        uColor: { value: new THREE.Color(0xffaa66) },
      },
      vertexShader: `
        varying float vHeight;
        void main() {
          vHeight = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uLevel;
        uniform vec3 uColor;
        varying float vHeight;

        void main() {
          if (uLevel < 0.01) discard;

          float height = max(0.0, vHeight);
          float alpha = uLevel * 0.1 * (1.0 - height * 2.0);
          alpha = clamp(alpha, 0.0, 0.3);

          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "lightPollution";
    this.scene.add(mesh);
    this.meshes.push(mesh);
  }

  /**
   * 更新大气效果
   */
  update(sunAltitude, moonAltitude) {
    for (const mesh of this.meshes) {
      if (mesh.name === "horizonGlow") {
        mesh.material.uniforms.uSunAltitude.value = sunAltitude;
        mesh.material.uniforms.uMoonAltitude.value = moonAltitude;
      }
      // 可以在这里添加其他mesh的更新逻辑
      // 例如根据太阳高度调整天顶变暗强度
      if (mesh.name === "zenithDarkening") {
        // 太阳高度越高，天顶变暗越强（模拟白天）
        const intensity =
          sunAltitude > 0 ? 0.1 + (sunAltitude / 90) * 0.5 : 0.3;
        mesh.material.uniforms.uIntensity.value = intensity;
      }
    }
  }

  /**
   * 设置光污染等级 (0-9 Bortle scale)
   */
  setLightPollution(level) {
    this.lightPollutionLevel = Math.max(0, Math.min(9, level));

    for (const mesh of this.meshes) {
      if (mesh.name === "lightPollution") {
        mesh.material.uniforms.uLevel.value = this.lightPollutionLevel / 9.0;
      }
    }
  }

  toggleVisible() {
    this.visible = !this.visible;
    for (const mesh of this.meshes) {
      mesh.visible = this.visible;
    }
    return this.visible;
  }
}
