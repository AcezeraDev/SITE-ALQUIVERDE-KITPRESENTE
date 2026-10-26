import { fallbackScene } from './fallback.js';
// Fundo de seda verde-floresta em WebGL puro: dobras de tecido com brilho dourado que seguem o ponteiro.
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
float h(vec2 uv, float t){
  float v = 0.0;
  v += sin(uv.x*2.2 + uv.y*1.3 + t*0.35)*0.55;
  v += sin(uv.x*3.7 - uv.y*2.1 - t*0.27 + sin(uv.y*1.5 + t*0.2)*1.6)*0.32;
  v += sin(uv.x*6.1 + uv.y*4.3 + t*0.5 + sin(uv.x*2.0)*2.0)*0.12;
  vec2 m = uv - uMouse;
  v += exp(-dot(m,m)*1.6)*0.45*sin(length(m)*7.0 - t*1.4);
  return v;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y * 2.2;
  uv = mat2(0.86,-0.5,0.5,0.86)*uv;
  float t = uTime;
  float e = 0.004;
  float c = h(uv,t);
  vec3 n = normalize(vec3(h(uv+vec2(e,0.),t)-c, h(uv+vec2(0.,e),t)-c, e*1.6));
  vec3 L = normalize(vec3(-0.4,0.6,0.7));
  float diff = clamp(dot(n,L),0.,1.);
  float spec = pow(clamp(dot(reflect(-L,n), vec3(0.,0.,1.)),0.,1.), 24.0);
  vec3 deep = vec3(0.063,0.137,0.086);
  vec3 mid  = vec3(0.157,0.29,0.192);
  vec3 col = mix(deep, mid, diff);
  col += vec3(0.85,0.72,0.47) * spec * 0.55;
  col += vec3(0.85,0.72,0.47) * smoothstep(0.85,1.0,diff) * 0.08;
  vec2 q = gl_FragCoord.xy/uRes;
  col *= 0.75 + 0.35*smoothstep(1.1,0.2,length(q-vec2(0.35,0.5)));
  gl_FragColor = vec4(col,1.0);
}`;

export function initSilk(canvas) {
  let gl;
  try { gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false }); } catch { return fallbackScene(canvas); }
  if (!gl) return fallbackScene(canvas);
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  const mouse = { x: 0.4, y: 0, tx: 0.4, ty: 0 };
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2.2 * (r.width / r.height);
    mouse.ty = -((e.clientY - r.top) / r.height - 0.5) * 2.2;
  }, { passive: true });

  const dpr = Math.min(devicePixelRatio, 1.25);
  function resize() {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  addEventListener('resize', resize);

  let raf = 0, running = false;
  const t0 = performance.now();
  function frame() {
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    // o ponteiro está em coordenadas de tela; a rotação do shader é compensada aproximadamente
    const mx = 0.86 * mouse.x - 0.5 * mouse.y, my = 0.5 * mouse.x + 0.86 * mouse.y;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (running) raf = requestAnimationFrame(frame);
  }
  return {
    start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce: frame,
  };
}
