import { useEffect, useRef } from "react";

export default function BubbleCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Lime green and white only — vibrant, clearly visible
    const COLORS = [
      { r: 151, g: 206, b: 35  },  // #97ce23 lime green
      { r: 180, g: 230, b: 50  },  // lighter lime
      { r: 200, g: 245, b: 80  },  // bright lime
      { r: 255, g: 255, b: 255 },  // pure white
      { r: 220, g: 255, b: 120 },  // yellow-lime
    ];

    const BUBBLE_COUNT = 28;

    const bubbles = Array.from({ length: BUBBLE_COUNT }, () => {
      // Mix of small (20–50), medium (50–100), large (100–180)
      const sizeClass = Math.random();
      const r = sizeClass < 0.45
        ? 20 + Math.random() * 35      // small
        : sizeClass < 0.80
        ? 55 + Math.random() * 50      // medium
        : 110 + Math.random() * 70;    // large

      // Force white for some, lime for others — 40% white, 60% lime shades
      const isWhite = Math.random() < 0.38;
      const color = isWhite
        ? { r: 255, g: 255, b: 255 }
        : COLORS[Math.floor(Math.random() * (COLORS.length - 1))];

      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color,
        // Clearly visible: 0.12–0.28 range
        alpha: isWhite ? 0.18 + Math.random() * 0.20 : 0.22 + Math.random() * 0.24,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.005,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((b) => {
        // Mouse repulsion
        const dist = Math.hypot(b.x - mouse.current.x, b.y - mouse.current.y);
        const repelRadius = 160;
        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          const angle = Math.atan2(b.y - mouse.current.y, b.x - mouse.current.x);
          b.dx += Math.cos(angle) * force * 0.05;
          b.dy += Math.sin(angle) * force * 0.05;
        }

        // Dampen & drift
        b.dx *= 0.97;
        b.dy *= 0.97;
        b.phase += b.speed;
        b.x += b.dx + Math.sin(b.phase) * 0.25;
        b.y += b.dy + Math.cos(b.phase * 0.8) * 0.18;

        // Wrap edges
        if (b.x < -b.r) b.x = canvas.width + b.r;
        if (b.x > canvas.width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = canvas.height + b.r;
        if (b.y > canvas.height + b.r) b.y = -b.r;

        const { r, g, b: bl } = b.color;

        // Outer soft glow — wider & brighter
        const glow = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r * 2.0);
        glow.addColorStop(0, `rgba(${r},${g},${bl},${b.alpha * 0.72})`);
        glow.addColorStop(1, `rgba(${r},${g},${bl},0)`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Main bubble body
        const grad = ctx.createRadialGradient(
          b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.05,
          b.x, b.y, b.r
        );
        grad.addColorStop(0, `rgba(${r},${g},${bl},${b.alpha * 2.0})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${bl},${b.alpha * 1.0})`);
        grad.addColorStop(1, `rgba(${r},${g},${bl},${b.alpha * 0.24})`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Rim stroke
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${bl},${b.alpha * 1.8})`;
        ctx.lineWidth = 1.35;
        ctx.stroke();

        // Top-left shine
        const shine = ctx.createRadialGradient(
          b.x - b.r * 0.38, b.y - b.r * 0.38, 0,
          b.x - b.r * 0.38, b.y - b.r * 0.38, b.r * 0.48
        );
        shine.addColorStop(0, `rgba(255,255,255,${b.alpha * 3.0})`);
        shine.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.38, b.y - b.r * 0.38, b.r * 0.48, 0, Math.PI * 2);
        ctx.fillStyle = shine;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
