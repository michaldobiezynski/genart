const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");
const glsl = require("glslify");

// Setup our sketch
const settings = {
  context: "webgl",
  animate: true,
};

// Your glsl code
const frag = glsl(`
  precision highp float;

  uniform float time;
  uniform float aspect;
  // uniform vec2 resolution;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d');

  void main () {
    // vec3 colorA = vec3(1.0, 0.0, 0.0);
    // vec3 colorB = vec3(0.0, 0.0, 0.5);

    vec2 center = vUv - 0.5;
    center.x *= aspect;


    // float dist = length(center);

    // float alpha = smoothstep(0.251, 0.25, dist);
    // float alpha = step(dist, 0.25);



    // vec3 color = mix(colorA, colorB, vUv.x);
    // vec3 color = vec3(vUv.x);

    float n = noise(vec3(center * 2.0, time));

    gl_FragColor = vec4(vec3(n), 1.0);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    clearColor: "white",
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      time: ({ time }) => time,
      aspect: ({ width, height }) => width / height,
    },
  });
};

canvasSketch(sketch, settings);
