import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AsciiEffect } from "./AsciiEffect.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "dat.gui";

import { loadGeoTIFF } from "../../comun/utils";

import img1 from "../../modelos/MDT25-ETRS89-H29-0157-3-COB2.tif";
import img2 from "../../modelos/MDT25-ETRS89-H29-0157-4-COB2.tif";
import img3 from "../../modelos/MDT25-ETRS89-H29-0190-1-COB2.tif";
import img4 from "../../modelos/MDT25-ETRS89-H29-0190-2-COB2.tif";
import img5 from "../../modelos/MDT25-ETRS89-H29-0190-3-COB2.tif";
import img6 from "../../modelos/MDT25-ETRS89-H29-0190-4-COB2.tif";
import img7 from "../../modelos/MDT25-ETRS89-H29-0191-1-COB2.tif";
import img8 from "../../modelos/MDT25-ETRS89-H29-0191-3-COB2.tif";
import img9 from "../../modelos/MDT25-ETRS89-H29-0228-2-COB2.tif";
import img10 from "../../modelos/MDT25-ETRS89-H29-0229-1-COB2.tif";
import img11 from "../../modelos/MDT25-ETRS89-H29-0229-3-COB2.tif";

const modelos = [
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10,
  img11,
];

const CON_EFECTO = 1;
const CON_COLOR = 1;
const CON_TAILWIND = 0;
const CON_MOVIMIENTO = 1;
const CON_CARACTERES_FIJOS = 1;
const DEBUG = 0;

// Hue del color corporativo
const HUE_CORPORATIVO = 161.9 / 360;

let tailindColors = {
  red: [
    "#f44336",
    "#ffebee",
    "#ffcdd2",
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#e53935",
    "#d32f2f",
    "#c62828",
    "#b71c1c",
  ],
  pink: [
    "#e91e63",
    "#fce4ec",
    "#f8bbd0",
    "#f48fb1",
    "#f06292",
    "#ec407a",
    "#e91e63",
    "#d81b60",
    "#c2185b",
    "#ad1457",
    "#880e4f",
  ],
  purple: [
    "#9c27b0",
    "#f3e5f5",
    "#e1bee7",
    "#ce93d8",
    "#ba68c8",
    "#ab47bc",
    "#9c27b0",
    "#8e24aa",
    "#7b1fa2",
    "#6a1b9a",
    "#4a148c",
  ],
  "deep-purple": [
    "#673ab7",
    "#ede7f6",
    "#d1c4e9",
    "#b39ddb",
    "#9575cd",
    "#7e57c2",
    "#673ab7",
    "#5e35b1",
    "#512da8",
    "#4527a0",
    "#311b92",
  ],
  indigo: [
    "#3f51b5",
    "#e8eaf6",
    "#c5cae9",
    "#9fa8da",
    "#7986cb",
    "#5c6bc0",
    "#3f51b5",
    "#3949ab",
    "#303f9f",
    "#283593",
    "#1a237e",
  ],
  blue: [
    "#2196f3",
    "#e3f2fd",
    "#bbdefb",
    "#90caf9",
    "#64b5f6",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",
    "#1565c0",
    "#0d47a1",
  ],
  "light-blue": [
    "#03a9f4",
    "#e1f5fe",
    "#b3e5fc",
    "#81d4fa",
    "#4fc3f7",
    "#29b6f6",
    "#03a9f4",
    "#039be5",
    "#0288d1",
    "#0277bd",
    "#01579b",
  ],
  cyan: [
    "#00bcd4",
    "#e0f7fa",
    "#b2ebf2",
    "#80deea",
    "#4dd0e1",
    "#26c6da",
    "#00bcd4",
    "#00acc1",
    "#0097a7",
    "#00838f",
    "#006064",
  ],
  teal: [
    "#009688",
    "#e0f2f1",
    "#b2dfdb",
    "#80cbc4",
    "#4db6ac",
    "#26a69a",
    "#009688",
    "#00897b",
    "#00796b",
    "#00695c",
    "#004d40",
  ],
  green: [
    "#4caf50",
    "#e8f5e9",
    "#c8e6c9",
    "#a5d6a7",
    "#81c784",
    "#66bb6a",
    "#4caf50",
    "#43a047",
    "#388e3c",
    "#2e7d32",
    "#1b5e20",
  ],
  "light-green": [
    "#8bc34a",
    "#f1f8e9",
    "#dcedc8",
    "#c5e1a5",
    "#aed581",
    "#9ccc65",
    "#8bc34a",
    "#7cb342",
    "#689f38",
    "#558b2f",
    "#33691e",
  ],
  lime: [
    "#cddc39",
    "#f9fbe7",
    "#f0f4c3",
    "#e6ee9c",
    "#dce775",
    "#d4e157",
    "#cddc39",
    "#c0ca33",
    "#afb42b",
    "#9e9d24",
    "#827717",
  ],
  yellow: [
    "#ffeb3b",
    "#fffde7",
    "#fff9c4",
    "#fff59d",
    "#fff176",
    "#ffee58",
    "#ffeb3b",
    "#fdd835",
    "#fbc02d",
    "#f9a825",
    "#f57f17",
  ],
  amber: [
    "#ffc107",
    "#fff8e1",
    "#ffecb3",
    "#ffe082",
    "#ffd54f",
    "#ffca28",
    "#ffc107",
    "#ffb300",
    "#ffa000",
    "#ff8f00",
    "#ff6f00",
  ],
  orange: [
    "#ff9800",
    "#fff3e0",
    "#ffe0b2",
    "#ffcc80",
    "#ffb74d",
    "#ffa726",
    "#ff9800",
    "#fb8c00",
    "#f57c00",
    "#ef6c00",
    "#e65100",
  ],
  "deep-orange": [
    "#ff5722",
    "#fbe9e7",
    "#ffccbc",
    "#ffab91",
    "#ff8a65",
    "#ff7043",
    "#ff5722",
    "#f4511e",
    "#e64a19",
    "#d84315",
    "#bf360c",
  ],
  brown: [
    "#795548",
    "#efebe9",
    "#d7ccc8",
    "#bcaaa4",
    "#a1887f",
    "#8d6e63",
    "#795548",
    "#6d4c41",
    "#5d4037",
    "#4e342e",
    "#3e2723",
  ],
  grey: [
    "#9e9e9e",
    "#fafafa",
    "#f5f5f5",
    "#eeeeee",
    "#e0e0e0",
    "#bdbdbd",
    "#9e9e9e",
    "#757575",
    "#616161",
    "#424242",
    "#212121",
  ],
  "blue-grey": [
    "#607d8b",
    "#eceff1",
    "#cfd8dc",
    "#b0bec5",
    "#90a4ae",
    "#78909c",
    "#607d8b",
    "#546e7a",
    "#455a64",
    "#37474f",
    "#263238",
  ],
};

// Tomamos un color aleatorio de la paleta de colores de Tailwind
let nombresColores = Object.keys(tailindColors);
let nombrePaleta =
  nombresColores[Math.floor(Math.random() * nombresColores.length)];
let paleta = tailindColors[nombrePaleta];
paleta.reverse();

// let giroInicial = Math.random() * Math.PI * 2;
let modeloCargado = Math.floor(Math.random() * modelos.length);
let hue = Math.random();

// Metemos todos los posibles caracteres de ASCII en la variable caracteres
// Primero las minúsculas y luego las mayúsculas
let caracteres = "";
// Minúsculas
// for (let i = 97; i < 123; i++) {
//   caracteres += String.fromCharCode(i);
// }
// Mayúsculas
for (let i = 65; i < 91; i++) {
  caracteres += String.fromCharCode(i);
}

// Aleatorizamos los caracteres
let caracteresArray = caracteres.split("");
shuffle(caracteresArray);
caracteres = caracteresArray.join("");

let fuente = "courier new, monospace";

// Colocamos un espacio en blanco al principio para que el fondo no se pinte
// caracteres = " " + caracteres;

// giroInicial = 0;
// modeloCargado = 8;
// nombrePaleta = "red";
// hue = HUE_CORPORATIVO;
// caracteres = " .oxOX";
// caracteres = " .orsveadl";
// caracteres = " .:-=+*#%@";
// fuente = "Roboto Mono";
// fuente = "Space Mono";

let container, stats;
let camera, controls, scene, renderer, effect;
let mesh, texture;
let raycaster, pointer, helper;

let minElevation, maxElevation;

let gui;

const wImagen = 7500;
const relacionWH = 388 / 562;
const hImagen = wImagen * relacionWH;
const xCamaraInicial = wImagen / -2;

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

// Gira la camara en torno a un punto objetivo
function girarCamaraEnPunto(camara, objetivo, giro) {
  camara.position.x = objetivo * Math.cos(giro);
  camara.position.z = objetivo * Math.sin(giro);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

async function initTerrain(terrainData) {
  // Clear previous scene
  if (scene) {
    scene.remove(mesh);
  }

  // Create geometry
  const geometry = new THREE.PlaneGeometry(
    wImagen,
    hImagen,
    terrainData.width - 1,
    terrainData.height - 1
  );
  geometry.rotateX(-Math.PI / 2);

  // Modify vertex heights
  const vertices = geometry.attributes.position.array;
  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    // vertices[j + 1] = terrainData.data[i] || 0;
    // Aumentamos la altura para que se vea mejor
    vertices[j + 1] = terrainData.data[i] || 0;
  }

  // Generate texture
  texture = new THREE.CanvasTexture(
    generateTexture(terrainData.data, terrainData.width, terrainData.height)
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  let material = new THREE.MeshBasicMaterial({ map: texture });
  // material.wireframe = true;

  // Create mesh
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const xObjetivo = 1200;
  // const xObjetivo = 200;
  // Aleatorizamos el giro inicial
  // const giro = { giro: 0 };
  // const giro = { giro: giroInicial };
  // girarCamaraEnPunto(camera, xObjetivo, giro.giro);
  // controls.target.set(
  //   0,
  //   terrainData.data[Math.floor(terrainData.data.length / 2)] || 0,
  //   0
  // );
  // controls.update();
  // controls.autoRotate = CON_MOVIMIENTO;

  camera.position.x = xCamaraInicial;
  camera.position.y = maxElevation + 500;
  camera.position.z = 0;

  // Rotamos la cámara para que mire al terreno
  // Al hacerlo así, solo le indicamos un punto al que tiene que mirar y Three.js ya hace los cálculos
  camera.lookAt(wImagen / -4, 0, 0);

  // Aunque podríamos rotar la cámara con cuaterniones
  // const quaternionY = new THREE.Quaternion();
  // quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / -2);

  // const quaternionZ = new THREE.Quaternion();
  // quaternionZ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -1);

  // // El orden de las rotaciones es importante porque en cada operación se altera el sistema de referencia
  // // que es local a la cámara
  // camera.applyQuaternion(quaternionY);
  // camera.applyQuaternion(quaternionZ);

  // O podemos rotarla con Euler
  // // También el orden de rotación es importante
  // camera.rotation.order = "YXZ";
  // camera.rotation.x = -1;
  // camera.rotation.y = Math.PI / -2;
  // camera.rotation.z = 0;

  if (DEBUG) {
    gui = new GUI();

    const positionGUI = gui.addFolder("Camera Position");
    positionGUI.add(camera.position, "x", -10000, 10000).name("X");
    positionGUI.add(camera.position, "y", -10000, 10000).name("Y");
    positionGUI.add(camera.position, "z", -10000, 10000).name("Z");

    // const rotationGUI = gui.addFolder("Camera Rotation");
    // rotationGUI.open();
    // rotationGUI.add(camera.rotation, "x", -Math.PI, Math.PI).name("X");
    // rotationGUI.add(camera.rotation, "y", -Math.PI, Math.PI).name("Y");
    // rotationGUI.add(camera.rotation, "z", -Math.PI, Math.PI).name("Z");

    // rotationGUI
    //   .add({ angulo: anguloY }, "angulo", -Math.PI, Math.PI)
    //   .name("Y")
    //   .onChange((value) => {
    //     const quaternion = new THREE.Quaternion();
    //     quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), value);
    //     camera.setRotationFromQuaternion(quaternion);
    //   });

    // gui.add(giro, "giro", 0, Math.PI * 2).onChange((value) => {
    //   girarCamaraEnPunto(camera, xObjetivo, value);
    // });

    gui
      .add(
        { modeloCargado: modeloCargado },
        "modeloCargado",
        0,
        modelos.length - 1
      )
      .name("Modelo Cargado");

    gui.add({ paleta: nombrePaleta }, "paleta", nombresColores);
    gui.add({ hue: hue }, "hue", 0, 1);
  }
}

function generateTexture(data, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  const image = context.createImageData(width, height);
  const imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    const normalized = (data[j] - minElevation) / (maxElevation - minElevation);

    if (CON_COLOR) {
      // /* For Color */

      // // Define a gradient from blue (low) to green (mid) to red (high)
      // const r = Math.min(255, Math.max(0, Math.round(255 * normalized))); // Red increases with elevation
      // const g = Math.min(
      //   255,
      //   Math.max(0, Math.round(255 * (1 - Math.abs(normalized - 0.5) * 2)))
      // ); // Green peaks at mid
      // const b = Math.min(255, Math.max(0, Math.round(255 * (1 - normalized)))); // Blue decreases with elevation
      // let color = { r: r, g: g, b: b };

      let color;

      if (CON_TAILWIND) {
        let nColores = paleta.length - 1;
        let posicionColor = Math.min(
          nColores,
          Math.max(0, Math.floor(nColores * normalized))
        );
        let colorHEX = paleta[posicionColor];
        color = hexToRgb(colorHEX);
      } else {
        let colorArray = hslToRgb(hue, 1, normalized);
        color = { r: colorArray[0], g: colorArray[1], b: colorArray[2] };
      }

      imageData[i] = color.r; // R
      imageData[i + 1] = color.g; // G
      imageData[i + 2] = color.b; // B
      imageData[i + 3] = 255;
    } else {
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
  }

  context.putImageData(image, 0, 0);
  return canvas;
}

async function init() {
  container = document.getElementById("terrain-container");
  container.innerHTML = "";

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);

  effect = new AsciiEffect(renderer, caracteres, {
    contraste: CON_COLOR ? 0 : 30,
    invert: true,
    color: true,
    conCaracteresFijos: CON_CARACTERES_FIJOS,
    fuente: fuente,
    // block: true,
  });
  effect.setSize(window.innerWidth, window.innerHeight);
  effect.domElement.style.color = "white";
  effect.domElement.style.backgroundColor = "black";

  if (CON_EFECTO) {
    container.appendChild(effect.domElement);
  } else {
    container.appendChild(renderer.domElement);
  }

  // Scene
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xbfd1e5);
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    10,
    20000
  );

  // Controls
  // if (CON_EFECTO) {
  //   controls = new OrbitControls(camera, effect.domElement);
  // } else {
  //   controls = new OrbitControls(camera, renderer.domElement);
  // }
  // controls.minDistance = 1000;
  // controls.maxDistance = 10000;
  // controls.maxPolarAngle = Math.PI / 2;

  // Raycaster for interaction
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  // Event listeners
  window.addEventListener("resize", onWindowResize);

  if (DEBUG) {
    // Helper
    const geometryHelper = new THREE.ConeGeometry(20, 100, 3);
    geometryHelper.translate(0, 50, 0);
    geometryHelper.rotateX(Math.PI / 2);
    helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
    scene.add(helper);

    // Stats
    stats = new Stats();
    container.appendChild(stats.dom);

    const axesHelper = new THREE.AxesHelper(5000);
    scene.add(axesHelper);
  }

  try {
    const terrainData = await loadGeoTIFF(modelos[modeloCargado]);

    // Normalize elevation data
    minElevation = terrainData.data.reduce(
      (min, val) => Math.min(min, val),
      Infinity
    );
    maxElevation = terrainData.data.reduce(
      (max, val) => Math.max(max, val),
      -Infinity
    );

    // const terrainData = await loadGeoTIFF('cdnh43e.tif');
    await initTerrain(terrainData);
  } catch (error) {
    console.error("Error loading GeoTIFF:", error);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  effect.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  if (CON_MOVIMIENTO) {
    camera.position.x += 10;
    if (camera.position.x > wImagen / 2) {
      camera.position.x = xCamaraInicial;
    }
  }
  render();
  if (DEBUG) {
    stats.update();
  }
}

function render() {
  // TODO Elegir uno de los dos
  if (CON_EFECTO) {
    effect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
  // controls.update();
}

// Initialize the scene
init();
