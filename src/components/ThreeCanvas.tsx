"use client";
import { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "dat.gui";
import {
  createCamera,
  createRenderer,
  runApp,
  updateLoadingProgressBar,
} from "../utils/core-utils";
import { loadTexture } from "../utils/common-utils";
import Albedo from "../../public/assets/Albedo.jpg";
import Bump from "../../public/assets/Bump.jpg";
import Clouds from "../../public/assets/Clouds.png";
import Ocean from "../../public/assets/Ocean.png";
import NightLights from "../../public/assets/night_lights_modified.png";
import GaiaSky from "../../public/assets/Gaia_EDR3_darkened.png";
import vertexShader from "../../public/shaders/vertex.glsl";
import fragmentShader from "../../public/shaders/fragment.glsl";

const ThreeCanvas = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // クライアントサイドでのみ実行されるコード
      const params = {
        sunIntensity: 2.5,
        speedFactor: 3.0,
        metalness: 0.5,
        atmOpacity: { value: 0.1 },
        atmPowFactor: { value: 2.0 },
        atmMultiplier: { value: 0.5 },
      };

      let scene = new THREE.Scene();
      let renderer = createRenderer({ antialias: true }, (_renderer) => {
        _renderer.outputColorSpace = THREE.SRGBColorSpace;
      });
      let camera = createCamera(45, 1, 1000, { x: 0, y: 0, z: 30 });

      let app: {
        controls: OrbitControls | null;
        dirLight?: THREE.DirectionalLight;
        group?: THREE.Group;
        earth?: THREE.Mesh;
        clouds?: THREE.Mesh;
        atmos?: THREE.Mesh;
        stats1?: Stats;
        initScene(): Promise<void>;
        updateScene(interval: number, elapsed: number): void;
      } = {
        controls: null,
        initScene: async function () {
          this.controls = new OrbitControls(camera, renderer.domElement);
          this.controls.enableDamping = true;
          this.controls.enabled = false;
          this.controls.dispose();

          this.dirLight = new THREE.DirectionalLight(
            0xffffff,
            params.sunIntensity
          );
          this.dirLight.position.set(-50, 0, 30);
          scene.add(this.dirLight);

          await updateLoadingProgressBar(0.1);

          const albedoMap = await loadTexture(Albedo);
          albedoMap.colorSpace = THREE.SRGBColorSpace;
          await updateLoadingProgressBar(0.2);

          const bumpMap = await loadTexture(Bump);
          await updateLoadingProgressBar(0.3);

          const cloudsMap = await loadTexture(Clouds);
          await updateLoadingProgressBar(0.4);

          const oceanMap = await loadTexture(Ocean);
          await updateLoadingProgressBar(0.5);

          const lightsMap = await loadTexture(NightLights);
          await updateLoadingProgressBar(0.6);

          const envMap = await loadTexture(GaiaSky);
          envMap.mapping = THREE.EquirectangularReflectionMapping;
          await updateLoadingProgressBar(0.7);

          scene.background = envMap;

          this.group = new THREE.Group();
          this.group.rotation.z = (23.5 / 360) * 2 * Math.PI;

          let earthGeo = new THREE.SphereGeometry(10, 64, 64);
          let earthMat = new THREE.MeshStandardMaterial({
            map: albedoMap,
            bumpMap: bumpMap,
            bumpScale: 0.03,
            roughnessMap: oceanMap,
            metalness: params.metalness,
            metalnessMap: oceanMap,
            emissiveMap: lightsMap,
            emissive: new THREE.Color(0xffff88),
          });
          this.earth = new THREE.Mesh(earthGeo, earthMat);
          this.group.add(this.earth);

          let cloudGeo = new THREE.SphereGeometry(10.05, 64, 64);
          let cloudsMat = new THREE.MeshStandardMaterial({
            alphaMap: cloudsMap,
            transparent: true,
          });
          this.clouds = new THREE.Mesh(cloudGeo, cloudsMat);
          this.group.add(this.clouds);

          this.earth.rotateY(-0.3);
          this.clouds.rotateY(-0.3);

          let atmosGeo = new THREE.SphereGeometry(12.5, 64, 64);
          let atmosMat = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
              atmOpacity: params.atmOpacity,
              atmPowFactor: params.atmPowFactor,
              atmMultiplier: params.atmMultiplier,
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
          });
          this.atmos = new THREE.Mesh(atmosGeo, atmosMat);
          this.group.add(this.atmos);

          scene.add(this.group);

          earthMat.onBeforeCompile = function (shader) {
            shader.uniforms.tClouds = { value: cloudsMap };
            shader.uniforms.tClouds.value.wrapS = THREE.RepeatWrapping;
            shader.uniforms.uv_xOffset = { value: 0 };
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <common>",
              `
              #include <common>
              uniform sampler2D tClouds;
              uniform float uv_xOffset;
            `
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <roughnessmap_fragment>",
              `
              float roughnessFactor = roughness;
              #ifdef USE_ROUGHNESSMAP
                vec4 texelRoughness = texture2D(roughnessMap, vRoughnessMapUv);
                texelRoughness = vec4(1.0) - texelRoughness;
                roughnessFactor *= clamp(texelRoughness.g, 0.5, 1.0);
              #endif
            `
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <emissivemap_fragment>",
              `
              #ifdef USE_EMISSIVEMAP
                vec4 emissiveColor = texture2D(emissiveMap, vEmissiveMapUv);
                emissiveColor *= 1.0 - smoothstep(-0.02, 0.0, dot(vNormal, directionalLights[0].direction));
                totalEmissiveRadiance *= emissiveColor.rgb;
              #endif
              float cloudsMapValue = texture2D(tClouds, vec2(vMapUv.x - uv_xOffset, vMapUv.y)).r;
              diffuseColor.rgb *= max(1.0 - cloudsMapValue, 0.2);
              float intensity = 1.4 - dot(vNormal, vec3(0.0, 0.0, 1.0));
              vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 5.0);
              diffuseColor.rgb += atmosphere;
            `
            );
            earthMat.userData.shader = shader;
          };

          const gui = new GUI();
          gui.hide();

          await updateLoadingProgressBar(1.0, 100);
        },
        updateScene: function (interval, elapsed) {
          this.earth?.rotateY(interval * 0.005 * params.speedFactor);
          this.clouds?.rotateY(interval * 0.01 * params.speedFactor);
          const material = this.earth?.material as THREE.Material;
          const shader = material?.userData?.shader;
          if (shader) {
            let offset =
              (interval * 0.005 * params.speedFactor) / (2 * Math.PI);
            shader.uniforms.uv_xOffset.value += offset % 1;
          }
        },
      };

      runApp(app, scene, renderer, camera, true, undefined, undefined);
    }
  }, []);

  return null;
};

export default ThreeCanvas;
