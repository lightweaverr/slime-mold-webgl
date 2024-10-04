import * as THREE from "three";

export const initScene = (width: number, height: number, canvas: HTMLCanvasElement) => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true});
  renderer.setSize(width, height);

  return { scene, camera, renderer };
}