import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { loadGeoTIFF } from "../../comun/utils";

import img1 from "../../modelos/MDT25-ETRS89-H29-0157-3-COB2.tif";

let container;
let camera, controls, scene, renderer;
let mesh;
let minElevation, maxElevation;

function generateTexture(data, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  const image = context.createImageData(width, height);
  const imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    const normalized = (data[j] - minElevation) / (maxElevation - minElevation);

    /* For Grayscale */
    // Define a gradient from blue (low) to green (mid) to red (high)
    const r = Math.min(255, Math.max(0, Math.round(255 * normalized)));
    const g = Math.min(255, Math.max(0, Math.round(255 * normalized)));
    const b = Math.min(255, Math.max(0, Math.round(255 * normalized)));
    imageData[i] = r; // R
    imageData[i + 1] = g; // G
    imageData[i + 2] = b; // B
    imageData[i + 3] = 255;
  }

  context.putImageData(image, 0, 0);
  return canvas;
}

async function initTerrain(terrainData) {
  // Clear previous scene
  if (scene) {
    scene.remove(mesh);
  }

  // Create geometry
  const geometry = new THREE.PlaneGeometry(
    7500,
    7500,
    terrainData.width - 1,
    terrainData.height - 1
  );
  geometry.rotateX(-Math.PI / 2);

  // Modify vertex heights
  const vertices = geometry.attributes.position.array;
  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = terrainData.data[i] || 0;
  }

  const count = geometry.attributes.position.count;

  // Generate texture
  let texture = new THREE.CanvasTexture(
    generateTexture(terrainData.data, terrainData.width, terrainData.height)
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  let material = new THREE.MeshBasicMaterial({ map: texture });

  // Create mesh
  mesh = new THREE.Mesh(geometry, material);
  //scene.add(mesh);

  // Add lines of steepest descent
  const positions = geometry.attributes.position.array;
  const width = terrainData.width;
  const height = terrainData.height;

  // Create line material
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

  const espacioEntreLineas = 2;

  // Sample points to start lines (not too dense)
  for (let x = 0; x < width; x += espacioEntreLineas) {
    for (let z = 0; z < height; z += espacioEntreLineas) {
      const linePoints = [];
      let currentX = x;
      let currentZ = z;

      // Generate line following steepest descent
      for (let step = 0; step < 50; step++) {
        const idx = currentZ * width + currentX;
        if (idx >= positions.length / 3) break;

        const pos = new THREE.Vector3(
          positions[idx * 3],
          // positions[idx * 3 + 1], // En 3D
          0, // En 2D
          positions[idx * 3 + 2]
        );
        linePoints.push(pos);

        // Find steepest downhill direction
        let steepestX = currentX;
        let steepestZ = currentZ;
        let steepestDrop = 0;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            const nx = currentX + dx;
            const nz = currentZ + dz;
            if (nx < 0 || nx >= width || nz < 0 || nz >= height) continue;

            const nidx = nz * width + nx;
            const drop = positions[idx * 3 + 1] - positions[nidx * 3 + 1];
            if (drop > steepestDrop) {
              steepestDrop = drop;
              steepestX = nx;
              steepestZ = nz;
            }
          }
        }

        if (steepestDrop <= 0) break;
        currentX = steepestX;
        currentZ = steepestZ;
      }

      if (linePoints.length > 1) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(
          linePoints
        );
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    }
  }

  // Adjust camera
  camera.position.y = 8000;
  camera.position.x = 0;
  camera.lookAt(0, 0, 0);
  controls.update();
}

async function init() {
  container = document.getElementById("terrain-container");
  container.innerHTML = "";

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);

  container.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    10,
    20000
  );

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1000;
  controls.maxDistance = 10000;
  controls.maxPolarAngle = Math.PI / 2;

  // Event listeners
  window.addEventListener("resize", onWindowResize);

  try {
    const terrainData = await loadGeoTIFF(img1);

    // Normalize elevation data
    minElevation = terrainData.data.reduce(
      (min, val) => Math.min(min, val),
      Infinity
    );
    maxElevation = terrainData.data.reduce(
      (max, val) => Math.max(max, val),
      -Infinity
    );

    await initTerrain(terrainData);
  } catch (error) {
    console.error("Error loading GeoTIFF:", error);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  render();
}

function render() {
  renderer.render(scene, camera);
}

// Initialize the scene
init();
