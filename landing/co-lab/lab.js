// The room geometry and materials come from the original co.lab laboratory.
const canvas = document.querySelector(".room canvas");
const button = document.querySelector("#motion");
const status = document.querySelector("#room-status");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let draw;
let frame = 0;
let last = 0;
let elapsed = 0;
let active = false;
let visible = true;
let pointer = [0, 0];

async function createRenderer() {
  const response = await fetch("./room.frag");
  if (!response.ok) throw new Error("Room unavailable");
  const source = await response.text();
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  if (!gl) throw new Error("WebGL unavailable");
  const program = gl.createProgram();
  for (const [type, code] of [
    [gl.VERTEX_SHADER, "attribute vec2 a; void main(){gl_Position=vec4(a,0.,1.);}"],
    [gl.FRAGMENT_SHADER, source],
  ]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    throw new Error("Room could not be rendered");
  }
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, "a");
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniform = name => gl.getUniformLocation(program, name);
  const size = uniform("uR"), time = uniform("uT"), input = uniform("uPointer"), stage = uniform("uStage");
  return seconds => {
    const ratio = Math.min(1, 720 / Math.max(1, canvas.clientWidth));
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(size, width, height);
    gl.uniform1f(time, seconds);
    gl.uniform1f(stage, 0);
    gl.uniform2f(input, ...pointer);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
}

function tick(now) {
  if (!last || now - last >= 33) {
    elapsed += last ? Math.min(now - last, 100) / 1000 : 0;
    draw(elapsed);
    last = now;
  }
  frame = requestAnimationFrame(tick);
}
function schedule() {
  cancelAnimationFrame(frame);
  last = 0;
  if (active && visible && !document.hidden) frame = requestAnimationFrame(tick);
}
function setActive(value) {
  active = value;
  canvas.hidden = !value;
  button.textContent = value ? "Show still" : "Explore in 3D";
  button.setAttribute("aria-pressed", String(value));
  schedule();
}

button.hidden = !window.WebGLRenderingContext;
button.addEventListener("click", async () => {
  if (active) return setActive(false);
  button.disabled = true;
  try {
    draw ??= await createRenderer();
    setActive(true);
  } catch {
    setActive(false);
    status.textContent = "3D is unavailable on this device. The laboratory is available below.";
    button.hidden = true;
  } finally {
    button.disabled = false;
  }
});
canvas.addEventListener("pointermove", e => {
  const rect = canvas.getBoundingClientRect();
  pointer = [2 * (e.clientX - rect.left) / rect.width - 1, 1 - 2 * (e.clientY - rect.top) / rect.height];
});
canvas.addEventListener("webglcontextlost", e => {
  e.preventDefault();
  setActive(false);
  draw = undefined;
  button.disabled = true;
});
canvas.addEventListener("webglcontextrestored", () => { button.disabled = false; });
document.addEventListener("visibilitychange", schedule);
reduced.addEventListener("change", () => { if (reduced.matches) setActive(false); });
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(canvas.parentElement);
