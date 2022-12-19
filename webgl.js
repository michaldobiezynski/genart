// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");
const eases = require("eases");
const BezierEasing = require("bezier-easing");
const glsl = require("glslify");

const settings = {
  dimensions: [1024, 1024],
  fps: 24,
  duration: 4,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  // Turn on MSAA
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  renderer.setClearColor("hsl(0, 0%, 95%)", 1);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();

  // Setup camera controller

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const box = new THREE.BoxGeometry(0.5, 0.5, 0.5);

  const meshes = [];

  // Setup a material
  // const material = new THREE.MeshBasicMaterial({
  //   color: "red",
  // });

  const palette = random.pick(palettes);

  const fragmentShader = `
  varying vec2 vUv;

  uniform vec3 color;

  void main () {
     gl_FragColor = vec4(vec3(color * vUv.x), 1.0);
   }
 `;

  const vertexShader = glsl(`
  varying vec2 vUv;

  uniform float time;
 
  #pragma glslify: noise = require('glsl-noise/simplex/4d');

  void main () {
    vUv = uv;
    vec3 pos = position.xyz;
    pos += noise(vec4(position.xyz, time) * 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }`);

  // Setup a mesh with geometry + material
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      const mesh = new THREE.Mesh(
        box,
        new THREE.ShaderMaterial({
          fragmentShader,
          vertexShader,
          uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(random.pick(palette)) },
          },
          color: random.pick(palette),
        })
      );
      mesh.scale.set(
        random.range(-1, 1),
        random.range(-1, 1),
        random.range(-1, 1)
      );
      mesh.position.set(
        random.range(-1, 1),
        random.range(-1, 1),
        random.range(-1, 1)
      );
      mesh.scale.multiplyScalar(0.5);
      scene.add(mesh);
      meshes.push(mesh);
    }
  }

  scene.add(new THREE.AmbientLight("hsl(0,0%,40%)"));

  const light = new THREE.DirectionalLight("white", 1);
  light.position.set(0, 0, 4);
  scene.add(light);

  const easeFn = BezierEasing(0.17, 0.67, 0.89, 0.12);

  // const mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 2.5;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead, time }) {
      const t = Math.sin(playhead * Math.PI);
      scene.rotation.z = eases.expoInOut(t);
      // scene.rotation.z = easeFn(t);

      meshes.forEach((mesh) => {
        mesh.material.uniforms.time.value = time;
      });

      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
