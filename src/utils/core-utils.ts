import * as THREE from "three";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

export const getDefaultUniforms = () => {
  return {
    u_time: { value: 0.0 },
    u_mouse: { value: { x: 0.0, y: 0.0 } },
    u_resolution: {
      value: {
        x: window.innerWidth * window.devicePixelRatio,
        y: window.innerHeight * window.devicePixelRatio,
      },
    },
  };
};

export const createRenderer = (
  rendererProps = {},
  configureRenderer = (renderer: THREE.WebGLRenderer) => {}
) => {
  const renderer = new THREE.WebGLRenderer(rendererProps);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  configureRenderer(renderer);
  return renderer;
};

export const createCamera = (
  fov = 45,
  near = 0.1,
  far = 100,
  camPos = { x: 0, y: 0, z: 5 },
  camLookAt = { x: 0, y: 0, z: 0 },
  aspect = window.innerWidth / window.innerHeight
) => {
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(camPos.x, camPos.y, camPos.z);
  camera.lookAt(camLookAt.x, camLookAt.y, camLookAt.z);
  camera.updateProjectionMatrix();
  return camera;
};

export const runApp = (
  app: any,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  enableAnimation = false,
  uniforms = getDefaultUniforms(),
  composer: EffectComposer | null = null
) => {
  const container = document.getElementById("container");
  if (container) {
    container.appendChild(renderer.domElement);
  } else {
    console.error("Container element not found");
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (uniforms.u_resolution !== undefined) {
      uniforms.u_resolution.value.x =
        window.innerWidth * window.devicePixelRatio;
      uniforms.u_resolution.value.y =
        window.innerHeight * window.devicePixelRatio;
    }
    if (typeof app.resize === "function") {
      app.resize();
    }
  });

  const mouseListener = (e: MouseEvent | TouchEvent) => {
    if (e instanceof TouchEvent) {
      uniforms.u_mouse.value.x = e.touches[0].clientX;
      uniforms.u_mouse.value.y = e.touches[0].clientY;
    } else {
      uniforms.u_mouse.value.x = e.clientX;
      uniforms.u_mouse.value.y = e.clientY;
    }
  };
  if ("ontouchstart" in window) {
    window.addEventListener("touchmove", mouseListener);
  } else {
    window.addEventListener("mousemove", mouseListener);
  }

  if (app.updateScene === undefined) {
    app.updateScene = (delta: number, elapsed: number) => {};
  }
  Object.assign(app, { ...app, container });

  const clock = new THREE.Clock();
  const animate = () => {
    if (enableAnimation) {
      requestAnimationFrame(animate);
    }

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    uniforms.u_time.value = elapsed;

    app.updateScene(delta, elapsed);

    if (composer === null) {
      renderer.render(scene, camera);
    } else {
      if (composer) {
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
      }
      composer.render();
    }
  };

  app
    .initScene()
    .then(() => {
      const veil = document.getElementById("veil");
      if (veil) {
        veil.style.opacity = "0";
      }
      const progressBar = document.getElementById("progress-bar");
      if (progressBar) {
        progressBar.style.opacity = "0";
      }
      const container = document.getElementById("container");
      if (container) {
        container.style.opacity = "1"; // キャンバスをフェードイン
      }
      const boxText = document.getElementById("box-text");
      if (boxText) {
        boxText.style.opacity = "1"; // テキストをフェードイン
      }
      return true;
    })
    .then(animate)
    .then(() => {
      renderer.info.reset();
      console.log("Renderer info", renderer.info);
    })
    .catch((error: any) => {
      console.log(error);
    });
};

export const updateLoadingProgressBar = async (
  frac: number,
  delay: number = 200
) => {
  return new Promise<void>((resolve) => {
    const progress = document.getElementById("progress");
    if (progress) {
      console.log(`Updating progress bar to ${frac * 100}%`); // ログを追加
      progress.style.width = `${frac * 200}px`;
      setTimeout(resolve, delay);
    } else {
      console.error("Progress bar element not found"); // エラーログを追加
      resolve();
    }
  });
};
