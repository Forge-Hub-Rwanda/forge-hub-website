"use client";

import { useEffect, useRef, useState } from "react";
import { Blob } from "@/components/blob";
import { onFirstFinePointer } from "@/lib/pointer";

/**
 * The homepage hero's gradient field, drawn in WebGL: the same amber-to-coral
 * body as the SVG blob, but liquid — the colour swirls inside the silhouette,
 * the rim reaches toward the pointer when it comes near, and ripples run round
 * the edge while the page is being scrolled. It is the site's one signature
 * moment, the answer to lusion.co's cursor-reactive hero, and it is the only
 * WebGL anywhere on the site.
 *
 * No library. A full-screen triangle and one fragment shader are the entire
 * scene, so the cost is a few kilobytes of source rather than a 3D engine.
 *
 * ## The SVG blob is always there
 *
 * `Blob` is rendered unconditionally and is what the server sends. The canvas
 * only takes over once it has drawn its first frame; until then — and for good,
 * wherever the shader is not wanted — the SVG blob is the hero exactly as it
 * was. The shader is skipped for reduced motion, a data-saver connection, a
 * low-memory device or no WebGL at all, and a lost context hands the hero
 * straight back to the SVG.
 *
 * It starts on the first movement of a real mouse or pen, not on a media
 * query: Windows touchscreen laptops claim to have no fine pointer even with a
 * mouse attached (see `src/lib/pointer.ts`), and a phone never sends a mouse
 * event at all — so phones keep the SVG and laptops get the shader the moment
 * the visitor reaches for the mouse, which is also when the field has
 * something to react to.
 *
 * The canvas carries the same `blob` drift animation as the SVG, so the two
 * wander identically and a hand-over mid-drift is invisible. It stops drawing
 * whenever it is off screen or the tab is hidden.
 */

const VERTEX = `
attribute vec2 a;
varying vec2 v;
void main() {
  v = a * 0.5 + 0.5;
  gl_Position = vec4(a, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
varying vec2 v;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uMouse;
uniform float uStir;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 p = v * 2.0 - 1.0;
  float r = length(p);
  float ang = atan(p.y, p.x);
  vec2 dir = vec2(cos(ang), sin(ang));

  // The silhouette. Noise is sampled on a circle rather than across the plane,
  // so the outline is continuous all the way round with no seam where the
  // angle wraps.
  float lobes = fbm(dir * 1.1 + vec2(uTime * 0.05, -uTime * 0.035));
  // Sized to fill its box about as fully as the SVG blob does, so the hand-over
  // does not visibly shrink it; the lobes, the pointer's reach and the ripple
  // together stay just inside the box's edges.
  float radius = 0.7 + (lobes - 0.5) * 0.5 + sin(ang * 3.0 + uTime * 0.23) * 0.04;

  // The rim leans toward the pointer, strongest on the side facing it.
  vec2 m = uMouse.xy * 2.0 - 1.0;
  float facing = max(dot(dir, normalize(m + 0.0001)), 0.0);
  radius += pow(facing, 6.0) * 0.12 * uMouse.z;

  // Scrolling stirs it: a ripple runs round the edge while the page moves.
  radius += sin(ang * 9.0 - uTime * 3.0) * 0.022 * uStir;

  float aa = 3.0 / uRes.y;
  float inside = 1.0 - smoothstep(radius - aa, radius + aa, r);
  if (inside <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // The colour runs corner to corner like the SVG gradient, pushed around by
  // slow domain-warped noise so it reads as liquid rather than as a fill.
  vec2 q = p + vec2(fbm(p * 1.4 + uTime * 0.06), fbm(p * 1.4 - uTime * 0.05)) * 0.9;
  float t = clamp((v.x + 1.0 - v.y) * 0.5 + (fbm(q * 1.2) - 0.5) * 0.6, 0.0, 1.0);
  vec3 col = mix(uA, uB, smoothstep(0.1, 0.9, t));
  col = mix(col, uC, smoothstep(0.55, 1.0, fbm(q * 2.2 + 3.0)) * 0.55);
  col += 0.08 * uMouse.z * exp(-dot(p - m, p - m) * 3.0);

  // Premultiplied, to match the context's alpha mode.
  gl_FragColor = vec4(col * inside, inside);
}`;

/** The third colour cycles through these, as the SVG's second stop does. */
const CYCLE = ["lime", "teal", "sky", "teal", "lime", "amber"] as const;

/** Seconds per step of that cycle. */
const CYCLE_STEP = 4;

function readColor(name: string): [number, number, number] {
  const hex = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-blob-${name}`)
    .trim()
    .replace("#", "");
  const value = parseInt(
    hex.length === 3 ? hex.replace(/./g, "$&$&") : hex,
    16,
  );
  if (Number.isNaN(value)) return [0.94, 0.64, 0.36];
  return [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

/** Whether this device should run the shader at all. */
function wanted() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  return true;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroShader({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [armed, setArmed] = useState(false);
  const [live, setLive] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  // Wait for a real mouse before building anything. See the note above.
  useEffect(() => {
    if (!wanted()) return;
    return onFirstFinePointer(() => setArmed(true));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!armed || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One triangle that covers the whole viewport — cheaper than a quad, and
    // no seam down the diagonal.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const attribute = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uRes = uniform("uRes");
    const uTime = uniform("uTime");
    const uMouse = uniform("uMouse");
    const uStir = uniform("uStir");
    const uA = uniform("uA");
    const uB = uniform("uB");
    const uC = uniform("uC");

    gl.uniform3fv(uA, readColor("amber"));
    gl.uniform3fv(uB, readColor("coral"));
    const cycle = CYCLE.map(readColor);

    /* ---- Sizing ------------------------------------------------------- */
    // Capped at 1.5x: the field is soft-edged and slow, so past that the extra
    // pixels are fill-rate spent on detail nobody can see.
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform2f(uRes, width, height);
    };
    const sizer = new ResizeObserver(resize);
    sizer.observe(canvas);
    resize();

    /* ---- Pointer and scroll ------------------------------------------- */
    const mouse = { x: 0.5, y: 0.5, z: 0, tx: 0.5, ty: 0.5, tz: 0 };
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (event.clientX - rect.left) / rect.width;
      mouse.ty = 1 - (event.clientY - rect.top) / rect.height;
      // Reach is strongest near the blob and gone about a blob's width away,
      // so the field responds to someone reading the hero, not to the pointer
      // crossing the far side of the screen.
      const distance = Math.hypot(mouse.tx - 0.5, mouse.ty - 0.5);
      mouse.tz = Math.max(0, Math.min(1, 1.6 - distance * 1.4));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let lastScroll = window.scrollY;
    let stir = 0;

    /* ---- The loop ----------------------------------------------------- */
    let frame = 0;
    let running = false;
    let first = true;
    const began = performance.now();

    const draw = (now: number) => {
      const time = (now - began) / 1000;

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      mouse.z += (mouse.tz - mouse.z) * 0.06;

      const scroll = window.scrollY;
      stir += (Math.min(Math.abs(scroll - lastScroll) / 30, 1) - stir) * 0.1;
      lastScroll = scroll;

      const position = (time / CYCLE_STEP) % cycle.length;
      const from = cycle[Math.floor(position)];
      const to = cycle[(Math.floor(position) + 1) % cycle.length];
      const blend = position % 1;

      gl.uniform1f(uTime, time);
      gl.uniform3f(uMouse, mouse.x, mouse.y, mouse.z);
      gl.uniform1f(uStir, stir);
      gl.uniform3f(
        uC,
        from[0] + (to[0] - from[0]) * blend,
        from[1] + (to[1] - from[1]) * blend,
        from[2] + (to[2] - from[2]) * blend,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (first) {
        first = false;
        setLive(true);
      }
      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const visibility = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting && !document.hidden) start();
        else stop();
      },
      { rootMargin: "10% 0px" },
    );
    visibility.observe(canvas);

    const onHidden = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onHidden);

    // A lost context — a GPU reset, a driver update, too many tabs — puts the
    // SVG blob back rather than leaving an empty hole in the hero.
    const onLost = (event: Event) => {
      event.preventDefault();
      stop();
      setLive(false);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      stop();
      visibility.disconnect();
      sizer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onHidden);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  }, [armed]);

  return (
    <div data-hero-field={live ? "webgl" : "svg"} className="contents">
      <Blob className={className} />
      <canvas
        ref={canvasRef}
        aria-hidden
        data-animate={onScreen}
        className={`blob hero-canvas pointer-events-none absolute -z-10 ${className ?? ""}`}
      />
    </div>
  );
}
