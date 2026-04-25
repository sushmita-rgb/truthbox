import { useEffect, useRef } from "react";

// ─── Cloud shape library ─────────────────────────────────────────────────────
// Each shape is a function(ctx, x, y, w, h) that draws a cloud silhouette
// using arcs + bezier curves. All shapes are centred at (x, y).
const CLOUD_SHAPES = [
  // Shape 0 – Classic fluffy (overlapping circles)
  (ctx, x, y, w, h) => {
    const s = w / 120;
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    ctx.beginPath();
    ctx.arc(30 * s, 55 * s, 28 * s, Math.PI, 0);
    ctx.arc(60 * s, 40 * s, 35 * s, Math.PI, 0);
    ctx.arc(90 * s, 50 * s, 26 * s, Math.PI, 0);
    ctx.arc(105 * s, 60 * s, 18 * s, Math.PI, 0);
    ctx.arc(15 * s, 62 * s, 16 * s, Math.PI, 0);
    ctx.lineTo(120 * s, 80 * s);
    ctx.lineTo(0, 80 * s);
    ctx.closePath();
    ctx.restore();
  },

  // Shape 1 – Wide flat stratocumulus
  (ctx, x, y, w, h) => {
    const s = w / 140;
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    ctx.beginPath();
    ctx.moveTo(10 * s, 70 * s);
    ctx.arc(35 * s, 60 * s, 24 * s, Math.PI, 0);
    ctx.arc(70 * s, 45 * s, 32 * s, Math.PI, 0);
    ctx.arc(105 * s, 55 * s, 26 * s, Math.PI, 0);
    ctx.arc(128 * s, 64 * s, 18 * s, Math.PI, 0);
    ctx.lineTo(140 * s, 80 * s);
    ctx.lineTo(0, 80 * s);
    ctx.closePath();
    ctx.restore();
  },

  // Shape 2 – Tall cumulonimbus tower
  (ctx, x, y, w, h) => {
    const s = w / 100;
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    ctx.beginPath();
    ctx.arc(50 * s, 70 * s, 25 * s, Math.PI, 0);
    ctx.arc(50 * s, 50 * s, 32 * s, Math.PI * 1.5, Math.PI * 0.5, true);
    ctx.arc(50 * s, 28 * s, 28 * s, Math.PI, 0);
    ctx.arc(50 * s, 50 * s, 32 * s, Math.PI * 1.5, Math.PI * 0.5);
    ctx.lineTo(75 * s, 80 * s);
    ctx.lineTo(25 * s, 80 * s);
    ctx.closePath();
    ctx.restore();
  },

  // Shape 3 – Small puffball
  (ctx, x, y, w, h) => {
    const s = w / 80;
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    ctx.beginPath();
    ctx.arc(20 * s, 55 * s, 18 * s, Math.PI, 0);
    ctx.arc(40 * s, 38 * s, 24 * s, Math.PI, 0);
    ctx.arc(60 * s, 48 * s, 20 * s, Math.PI, 0);
    ctx.lineTo(80 * s, 70 * s);
    ctx.lineTo(0, 70 * s);
    ctx.closePath();
    ctx.restore();
  },

  // Shape 4 – Elongated wispy cirrus
  (ctx, x, y, w, h) => {
    const s = w / 160;
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    ctx.beginPath();
    ctx.moveTo(0, 55 * s);
    ctx.bezierCurveTo(20 * s, 30 * s, 60 * s, 25 * s, 80 * s, 38 * s);
    ctx.bezierCurveTo(100 * s, 20 * s, 140 * s, 22 * s, 160 * s, 45 * s);
    ctx.bezierCurveTo(155 * s, 60 * s, 130 * s, 65 * s, 100 * s, 58 * s);
    ctx.bezierCurveTo(80 * s, 70 * s, 40 * s, 68 * s, 20 * s, 60 * s);
    ctx.closePath();
    ctx.restore();
  },

  // Shape 5 – Lumpy cauliflower
  (ctx, x, y, w, h) => {
    const s = w / 110;
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    ctx.beginPath();
    ctx.arc(22 * s, 62 * s, 20 * s, Math.PI, 0);
    ctx.arc(45 * s, 44 * s, 26 * s, Math.PI, 0);
    ctx.arc(68 * s, 36 * s, 22 * s, Math.PI, 0);
    ctx.arc(88 * s, 46 * s, 24 * s, Math.PI, 0);
    ctx.arc(100 * s, 60 * s, 16 * s, Math.PI, 0);
    ctx.lineTo(110 * s, 80 * s);
    ctx.lineTo(0, 80 * s);
    ctx.closePath();
    ctx.restore();
  },

  // Shape 6 – Anvil top (wide spread crown)
  (ctx, x, y, w, h) => {
    const s = w / 130;
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    ctx.beginPath();
    ctx.moveTo(10 * s, 80 * s);
    ctx.arc(35 * s, 65 * s, 22 * s, Math.PI, 0);
    ctx.arc(65 * s, 48 * s, 30 * s, Math.PI, 0);
    ctx.arc(95 * s, 52 * s, 26 * s, Math.PI * 1.2, -0.2);
    ctx.arc(65 * s, 35 * s, 38 * s, 0, Math.PI, true);
    ctx.arc(35 * s, 52 * s, 22 * s, 0, Math.PI);
    ctx.lineTo(10 * s, 80 * s);
    ctx.closePath();
    ctx.restore();
  },
];

// ─── Spawn a cloud ────────────────────────────────────────────────────────────
function spawnCloud(canvasWidth, canvasHeight, fromBottom = false) {
  const tier = Math.random();
  // 3 size tiers — tiny wisps, mid clouds, big fluffy
  const w = tier < 0.35
    ? 60  + Math.random() * 60   // small: 60–120
    : tier < 0.72
    ? 120 + Math.random() * 100  // medium: 120–220
    : 220 + Math.random() * 130; // large: 220–350

  const h = w * (0.38 + Math.random() * 0.28);
  const shapeIdx = Math.floor(Math.random() * CLOUD_SHAPES.length);

  // Speed inversely proportional to size (smaller = faster)
  const speed = (0.12 + Math.random() * 0.22) * (260 / w);

  // Opacity: small clouds more transparent, large ones more solid
  const alpha = 0.16 + (w / 350) * 0.28 + Math.random() * 0.10;

  // Slight horizontal drift
  const driftX = (Math.random() - 0.5) * 0.18;

  // Gentle sway amplitude & phase
  const swayAmp = 0.4 + Math.random() * 1.2;
  const swayPhase = Math.random() * Math.PI * 2;
  const swaySpeed = 0.003 + Math.random() * 0.004;

  return {
    x: Math.random() * (canvasWidth + w) - w / 2,
    y: fromBottom
      ? canvasHeight + h / 2 + Math.random() * 200
      : Math.random() * (canvasHeight + h) - h / 2,
    w, h,
    speed,
    driftX,
    alpha,
    shapeIdx,
    swayPhase,
    swaySpeed,
    swayAmp,
    blur: w > 200 ? 0 : 0, // reserved for future
    rotation: (Math.random() - 0.5) * 0.08, // very subtle tilt
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CloudCanvas() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const cloudsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const CLOUD_COUNT = 22;

    // Seed clouds spread across screen on first load
    cloudsRef.current = Array.from({ length: CLOUD_COUNT }, () =>
      spawnCloud(canvas.width, canvas.height, false)
    );

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      cloudsRef.current.forEach((c, i) => {
        // Move upward + drift
        c.swayPhase += c.swaySpeed;
        c.y -= c.speed;
        c.x += c.driftX + Math.sin(c.swayPhase) * c.swayAmp * 0.3;

        // Respawn at bottom when fully off screen at top
        if (c.y < -c.h - 50) {
          cloudsRef.current[i] = spawnCloud(canvas.width, canvas.height, true);
          return;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);

        // Build the cloud path
        ctx.beginPath();
        CLOUD_SHAPES[c.shapeIdx](ctx, 0, 0, c.w, c.h);

        // ── Soft outer glow (shadow-like aura) ──
        ctx.shadowColor  = "rgba(255,255,255,0.85)";
        ctx.shadowBlur   = 36 + c.w * 0.18;
        ctx.fillStyle    = `rgba(255,255,255,${c.alpha * 0.55})`;
        ctx.fill();

        // ── Main cloud body — radial gradient for depth ──
        ctx.shadowBlur = 0;
        const grad = ctx.createRadialGradient(
          0, -c.h * 0.1, c.w * 0.05,
          0,  c.h * 0.2, c.w * 0.72
        );
        grad.addColorStop(0,   `rgba(255,255,255,${Math.min(1, c.alpha * 4.5)})`);
        grad.addColorStop(0.45,`rgba(255,255,255,${Math.min(1, c.alpha * 3.0)})`);
        grad.addColorStop(1,   `rgba(230,240,255,${c.alpha * 1.2})`);

        ctx.beginPath();
        CLOUD_SHAPES[c.shapeIdx](ctx, 0, 0, c.w, c.h);
        ctx.fillStyle = grad;
        ctx.fill();

        // ── Subtle top-edge highlight ──
        const highlight = ctx.createLinearGradient(0, -c.h * 0.5, 0, 0);
        highlight.addColorStop(0, `rgba(255,255,255,${c.alpha * 1.8})`);
        highlight.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.beginPath();
        CLOUD_SHAPES[c.shapeIdx](ctx, 0, 0, c.w, c.h);
        ctx.fillStyle = highlight;
        ctx.fill();

        ctx.restore();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ willChange: "transform" }}
    />
  );
}
