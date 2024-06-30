import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const hexToRgb = (hex: string, forShaders = false) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (forShaders) {
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : null;
  }
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const loadHDRI = (url: string): Promise<THREE.Texture> => {
  return new Promise((resolve) => {
    const hdrEquirect = new RGBELoader().load(url, function () {
      hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
      resolve(hdrEquirect);
    });
  });
};

export const loadTexture = async (url: string): Promise<THREE.Texture> => {
  let textureLoader = new THREE.TextureLoader();
  return new Promise((resolve) => {
    textureLoader.load(url, (texture) => {
      resolve(texture);
    });
  });
};

export const loadModel = async (
  url: string
): Promise<{ model: THREE.Group }> => {
  let modelLoader = new GLTFLoader();
  return new Promise((resolve) => {
    modelLoader.load(url, (gltf) => {
      const result = { model: gltf.scene };
      resolve(result);
    });
  });
};

export const maintainBgAspect = (
  scene: THREE.Scene,
  backgroundImageWidth: number,
  backgroundImageHeight: number
) => {
  var windowSize = function (withScrollBar: boolean) {
    var wid = 0;
    var hei = 0;
    if (typeof window.innerWidth != "undefined") {
      wid = window.innerWidth;
      hei = window.innerHeight;
    } else {
      if (document.documentElement.clientWidth == 0) {
        wid = document.body.clientWidth;
        hei = document.body.clientHeight;
      } else {
        wid = document.documentElement.clientWidth;
        hei = document.documentElement.clientHeight;
      }
    }
    return {
      width: wid - (withScrollBar ? wid - document.body.offsetWidth + 1 : 0),
      height: hei,
    };
  };

  if (scene.background && scene.background instanceof THREE.Texture) {
    var size = windowSize(true);
    var factor =
      backgroundImageWidth / backgroundImageHeight / (size.width / size.height);

    scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
    scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;

    scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
    scene.background.repeat.y = factor > 1 ? 1 : factor;
  }
};
