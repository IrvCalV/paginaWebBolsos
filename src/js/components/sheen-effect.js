// Sheen effect -- reusable WebGL flow-noise shimmer, originally built for
// the leather banner in Mujer. An honest, from-scratch approximation of
// the "thin-film iridescence" effect referenced by the user (getdesign.md's
// Opal Film: a WebGL flow-noise field with rainbow fringes). We don't have
// access to that proprietary component's source, so this is NOT a port of
// it -- same idea (an animated flow-noise field read as moving light
// fringes), rebuilt from zero in plain WebGL1 with no dependency.
//
// This module is deliberately generic: every canvas picks its own colors
// via data attributes so the same effect can be retinted per section
// (warm amber for Mujer, cool graphite for Hombre, etc.) without copying
// the shader.
//
// Usage:
//   <canvas
//     data-sheen
//     data-sheen-a="0.02,0.01,0.005"   (base tone, r g b 0-1)
//     data-sheen-b="0.68,0.4,0.1"      (mid tone)
//     data-sheen-c="1.0,0.93,0.68"     (highlight tone)
//     data-sheen-speed="1"             (optional, default 1)
//   ></canvas>
// inside a position:relative container, styled via .sheen-canvas (see
// main.css). Degrades to a transparent canvas (whatever sits behind it
// still shows) when WebGL is unavailable, and renders a single static
// frame under prefers-reduced-motion instead of animating.
const VERTEX_SRC = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * 2.6;

  float t = uTime * 0.06;
  vec2 flow = vec2(fbm(p + t), fbm(p - t + 4.2));
  float field = fbm(p + flow * 1.3 + t * 0.25);

  float fringe = sin(field * 14.0 + uTime * 0.18) * 0.5 + 0.5;

  vec3 col = mix(uColorA, uColorB, fringe);
  col = mix(col, uColorC, pow(fringe, 2.2) * 0.6);

  float alpha = smoothstep(0.0, 1.0, field) * 0.7;
  gl_FragColor = vec4(col, alpha);
}
`;

const DEFAULT_COLOR_A = [0.02, 0.01, 0.005];
const DEFAULT_COLOR_B = [0.68, 0.4, 0.1];
const DEFAULT_COLOR_C = [1.0, 0.93, 0.68];

function parseColor(value, fallback) {
  if (!value) return fallback;
  const parts = value.split(',').map((n) => parseFloat(n.trim()));
  return parts.length === 3 && parts.every((n) => !Number.isNaN(n)) ? parts : fallback;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('sheen-effect: shader compile error', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function setupCanvas(canvas, reduceMotion) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) return;

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('sheen-effect: program link error', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'uResolution');
  const uTime = gl.getUniformLocation(program, 'uTime');

  const colorA = parseColor(canvas.dataset.sheenA, DEFAULT_COLOR_A);
  const colorB = parseColor(canvas.dataset.sheenB, DEFAULT_COLOR_B);
  const colorC = parseColor(canvas.dataset.sheenC, DEFAULT_COLOR_C);
  const speed = parseFloat(canvas.dataset.sheenSpeed) || 1;

  gl.uniform3f(gl.getUniformLocation(program, 'uColorA'), ...colorA);
  gl.uniform3f(gl.getUniformLocation(program, 'uColorB'), ...colorB);
  gl.uniform3f(gl.getUniformLocation(program, 'uColorC'), ...colorC);

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function drawFrame(time) {
    resize();
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, time * speed);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  drawFrame(0);
  if (reduceMotion) return;

  let visible = true;
  let raf = null;

  function loop(ms) {
    drawFrame(ms * 0.001);
    if (visible) raf = requestAnimationFrame(loop);
    else raf = null;
  }

  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  });
  io.observe(canvas);

  window.addEventListener('resize', resize);
}

export function initSheenEffect() {
  const canvases = document.querySelectorAll('[data-sheen]');
  if (!canvases.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  canvases.forEach((canvas) => setupCanvas(canvas, reduceMotion));
}
