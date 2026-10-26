// Fundo animado do hero em WebGL puro (sem three.js): manchas de luz quente que se mexem devagar
// (dourado, rosado, sálvia sobre o creme), bokeh dourado subindo e piscando, e um granulado leve de papel.
// Paralaxe em camadas com o mouse e a rolagem: bokeh de perto anda mais, o de longe menos, as manchas quase nada.
// Renderiza em meia resolução (é tudo desfocado) e só enquanto o hero está na tela.

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

// bokeh: uma bolinha por célula, subindo devagar e piscando
float bokeh(vec2 uv, float scale, float speed, float seed) {
  uv *= scale;
  uv.y -= uTime * speed;
  vec2 id = floor(uv), gv = fract(uv) - 0.5;
  float h = hash(id + seed);
  if (h < 0.55) return 0.0;
  vec2 o = vec2(hash(id + seed + 3.1), hash(id + seed + 7.3)) - 0.5;
  float r = 0.10 + 0.16 * hash(id + seed + 1.7);
  float d = length(gv - o * 0.6);
  float tw = 0.55 + 0.45 * sin(uTime * (0.6 + h) + h * 40.0);
  return smoothstep(r, r * 0.35, d) * tw;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y);
  float t = uTime * 0.045;
  vec2 mo = uMouse - 0.5;
  vec2 m = mo * 0.14 + vec2(0.0, uScroll * 0.35); // manchas: camada mais funda

  // campo de fluxo suave: as manchas "respiram" e escorregam
  vec2 q = vec2(fbm(p * 1.4 + t + m), fbm(p * 1.4 - t + 4.2));
  float n1 = fbm(p * 1.1 + q * 1.6 + vec2(t * 1.3, -t));
  float n2 = fbm(p * 1.6 - q * 1.2 + vec2(-t, t * 0.8) + 9.0);
  float n3 = fbm(p * 0.9 + q + 21.0 + t * 0.5);

  vec3 cream = vec3(0.969, 0.941, 0.890);
  vec3 gold  = vec3(0.925, 0.835, 0.640);
  vec3 rose  = vec3(0.925, 0.780, 0.780);
  vec3 sage  = vec3(0.820, 0.870, 0.800);

  vec3 col = cream;
  col = mix(col, gold, smoothstep(0.48, 0.80, n1) * 0.75);
  col = mix(col, rose, smoothstep(0.55, 0.85, n2) * 0.45);
  col = mix(col, sage, smoothstep(0.58, 0.88, n3) * 0.35);

  // clarão no centro (atrás do título) para manter a leitura
  float c = 1.0 - smoothstep(0.0, 0.55, length((uv - vec2(0.5, 0.52)) * vec2(1.25, 1.0)));
  col = mix(col, vec3(1.0, 0.988, 0.960), c * 0.7);

  // bokeh dourado em duas camadas (perto/longe)
  vec2 near = mo * vec2(0.22, 0.15) + vec2(0.0, uScroll * 1.1); // perto: anda mais
  vec2 far  = mo * vec2(0.08, 0.06) + vec2(0.0, uScroll * 0.4); // longe: anda menos
  float b = bokeh(p + near, 5.0, 0.035, 0.0) * 0.55 + bokeh(p + 3.7 + far, 9.0, 0.06, 17.0) * 0.35;
  col += vec3(0.95, 0.80, 0.50) * b * (1.0 - c * 0.8) * 0.5;

  // vinheta e granulado
  col *= 1.0 - 0.08 * smoothstep(0.45, 1.0, length(uv - 0.5) * 1.3);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.018;

  gl_FragColor = vec4(col, 1.0);
}`;

export function initHeroBg(canvas) {
  const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // triângulo que cobre a tela
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');
  const uScroll = gl.getUniformLocation(prog, 'uScroll');

  const SCALE = 0.5; // meia resolução: o fundo é todo suave
  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * SCALE)), h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(uRes, w, h);
  };
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; }, { passive: true });

  let raf = 0, running = false;
  const t0 = performance.now();
  const frame = () => {
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uScroll, scrollY / innerHeight); // o hero fica no topo: 0 → 1 ao rolar uma tela
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (running) raf = requestAnimationFrame(frame);
  };
  resize();
  addEventListener('resize', resize);
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; canvas.classList.add('is-on'); raf = requestAnimationFrame(frame); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }).observe(canvas);
  return { stop() { running = false; cancelAnimationFrame(raf); } };
}
