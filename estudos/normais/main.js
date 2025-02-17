import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { HalftonePass } from "three/addons/postprocessing/HalftonePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import { NormalShader } from "./NormalShader.js";

import { GUI } from "dat.gui";

import { loadGeoTIFF } from "../../comun/utils";

import img1 from "../../modelos/MDT25-ETRS89-H29-0157-3-COB2.tif";

let container, stats;
let camera, controls, scene, renderer;
let mesh;
let bulbLight, bulbMat;
let ambientLight;
let cubeMat;
let composer;

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
  // Crear un array para almacenar el "y" del punto en x + 1.0
  const esBajadaPendienteArray = new Float32Array(count);

  function getAdjacentY(vertices, index, offset) {
    let y = vertices[index * 3 + 1];
    let foundY = y; // Valor por defecto si no encuentra

    let adjacentY = vertices[index * 3 + 1 + offset];
    if (adjacentY !== undefined) {
      foundY = adjacentY;
    }

    return foundY;
  }

  function to1D(x, y, z, xMax, yMax) {
    return z * xMax * yMax + y * xMax + x;
  }

  function to3D(idx, xMax, yMax) {
    let z = Math.floor(idx / (xMax * yMax));
    idx -= z * xMax * yMax;
    let y = Math.floor(idx / xMax);
    let x = idx % xMax;
    return { x, y, z };
  }

  for (let i = 0; i < count; i++) {
    let y = vertices[i * 3 + 1];
    let coordenadas = to3D(i, terrainData.width, terrainData.height);
    // console.log(i, coordenadas.x, coordenadas.y, coordenadas.z);

    let salto = 3;

    let adjacente1 = to1D(
      coordenadas.x + salto,
      coordenadas.y,
      coordenadas.z,
      terrainData.width,
      terrainData.height
    );
    let yAdjacente1 = vertices[adjacente1 * 3 + 1];

    let adjacente2 = to1D(
      coordenadas.x - salto,
      coordenadas.y,
      coordenadas.z,
      terrainData.width,
      terrainData.height
    );
    let yAdjacente2 = vertices[adjacente2 * 3 + 1];

    let adjacente3 = to1D(
      coordenadas.x,
      coordenadas.y + salto,
      coordenadas.z,
      terrainData.width,
      terrainData.height
    );
    let yAdjacente3 = vertices[adjacente3 * 3 + 1];

    let adjacente4 = to1D(
      coordenadas.x,
      coordenadas.y - salto,
      coordenadas.z,
      terrainData.width,
      terrainData.height
    );
    let yAdjacente4 = vertices[adjacente4 * 3 + 1];

    // Excluímos los puntos más altos y los más bajos
    esBajadaPendienteArray[i] = 0;
    const margen = 10;
    if (
      (y < yAdjacente1 - margen || y < yAdjacente2 - margen) &&
      !(y < yAdjacente1 + margen && y < yAdjacente2 + margen)
    ) {
      if (y < yAdjacente1 - 25) {
        esBajadaPendienteArray[i] = 1;
      } else {
        esBajadaPendienteArray[i] = 2;
      }
    }
  }

  geometry.setAttribute(
    "esBajadaPendiente",
    new THREE.BufferAttribute(esBajadaPendienteArray, 1)
  );

  let terrainUniforms = {
    min: { value: new THREE.Vector3() },
    max: { value: new THREE.Vector3() },
    lineThickness: { value: 1 },
  };

  let m = new THREE.MeshLambertMaterial({
    color: 0xeeeeee,
    wireframe: false,
    side: THREE.DoubleSide,
    onBeforeCompile: (shader) => {
      shader.uniforms.boxMin = terrainUniforms.min;
      shader.uniforms.boxMax = terrainUniforms.max;
      shader.uniforms.lineThickness = terrainUniforms.lineThickness;
      shader.vertexShader = `
        varying vec3 vPos;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
          vPos = position;
        `
      );
      //console.log(shader.vertexShader);
      shader.fragmentShader = `
        uniform vec3 boxMin;
        uniform vec3 boxMax;
        uniform float lineThickness;
        varying vec3 vPos;
        ${shader.fragmentShader}
      `.replace(
        `#include <dithering_fragment>`,
        `
          // http://madebyevan.com/shaders/grid/
          float coord = vPos.y / 50.;
          float grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord) / lineThickness;
          float line = min(grid, 1.0);
          
          //  vec3 colorLinea = mix(vec3(1, 1, 1),vec3(0, 0, 0), vPos.y);
          vec3 colorLinea = vec3(0, 0, 0);
          
          vec3 colorFragmento = mix(colorLinea, gl_FragColor.rgb, line);
          gl_FragColor = vec4( colorFragmento, opacity);
        `
      );
      //console.log(shader.fragmentShader);
    },
  });
  m.defines = { USE_UV: "" };
  m.extensions = { derivatives: true };

  const normalShader = NormalShader;
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: normalShader.uniforms,
    vertexShader: normalShader.vertexShader,
    fragmentShader: normalShader.fragmentShader,
  });

  // Create mesh
  mesh = new THREE.Mesh(geometry, shaderMaterial);
  scene.add(mesh);

  // Adjust camera
  controls.target.y =
    terrainData.data[Math.floor(terrainData.data.length / 2)] || 0;
  camera.position.y = controls.target.y + 2000;
  camera.position.x = 2000;
  controls.update();

  let gui = new GUI();
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
  scene.background = new THREE.Color(0xbfd1e5);

  // Cubo para hacer debug con la luz
  // cubeMat = new THREE.MeshStandardMaterial();
  // const boxGeometry = new THREE.BoxGeometry(500, 500, 500);
  // const boxMesh = new THREE.Mesh(boxGeometry, cubeMat);
  // boxMesh.position.set(-350, 1500, 0);
  //   boxMesh.castShadow = true;
  //   scene.add(boxMesh);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    10,
    20000
  );

  // LIGHTS

  bulbLight = new THREE.PointLight(0xffffff, 5000000, 5000, 2);

  bulbMat = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000,
  });
  // Debug de posición de la luz
  const bulbGeometry = new THREE.SphereGeometry(100, 16, 8);
  bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
  bulbLight.position.set(0, 1500, 0);
  bulbLight.castShadow = true;
  bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow(0.02, 2.0);
  scene.add(bulbLight);

  ambientLight = new THREE.AmbientLight(0x323232, 3);
  scene.add(ambientLight);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1000;
  controls.maxDistance = 10000;
  controls.maxPolarAngle = Math.PI / 2;

  // Event listeners
  window.addEventListener("resize", onWindowResize);

  // Stats
  stats = new Stats();
  container.appendChild(stats.dom);

  // postprocessing

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const params = {
    shape: 1,
    radius: 4,
    rotateR: Math.PI / 12,
    rotateB: (Math.PI / 12) * 2,
    rotateG: (Math.PI / 12) * 3,
    scatter: 1,
    blending: 1,
    blendingMode: 1,
    greyscale: true,
    disable: false,
  };
  const customPass = new HalftonePass(
    window.innerWidth,
    window.innerHeight,
    params
  );
  // renderer.toneMapping = THREE.ReinhardToneMapping;
  // renderer.toneMappingExposure = Math.pow(0.68, 5.0); // to allow for very bright scenes.
  // renderer.shadowMap.enabled = true;
  // composer.addPass(customPass);

  // const normalShader = NormalShader;
  // const normalPass = new ShaderPass(normalShader);
  // composer.addPass(normalPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  try {
    const terrainData = await loadGeoTIFF(img1);
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
  const time = Date.now() * 0.0005;
  bulbLight.position.y = Math.cos(time) * 250 + 1250;

  render();

  stats.update();
}

function render() {
  // renderer.render(scene, camera);
  composer.render();
}

// Initialize the scene
init();
