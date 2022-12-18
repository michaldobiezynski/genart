// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");
const eases = require("eases");
const BezierEasing = require("bezier-easing");

const settings = {
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

  // Setup a material
  // const material = new THREE.MeshBasicMaterial({
  //   color: "red",
  // });

  const palette = random.pick(palettes);

  // Setup a mesh with geometry + material
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      const mesh = new THREE.Mesh(
        box,
        new THREE.MeshStandardMaterial({
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
    render({ playhead }) {
      const t = Math.sin(playhead * Math.PI);
      // scene.rotation.z = eases.expoInOut(t);
      scene.rotation.z = easeFn(t);
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
