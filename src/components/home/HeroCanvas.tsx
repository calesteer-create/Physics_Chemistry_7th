"use client";

import { useEffect, useRef } from "react";

/**
 * خلفية البطل: ذرتان بمدارات إلكترونية دوّارة (فيزياء) + شبكة جزيئات
 * تطفو وتتعارك خيوطها (كيمياء). أداء محسوب: العدد محدود، DPR ≤ 2،
 * إيقاف عند تفعيل تقليل الحركة.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0.5, y: 0.5 };

    interface Node {
      x: number; y: number; vx: number; vy: number; r: number;
      hue: "phys" | "chem";
    }
    let nodes: Node[] = [];

    const COLORS = {
      phys: "60, 224, 244",
      chem: "255, 176, 58",
      violet: "143, 131, 255",
    };

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(64, Math.floor(w / 24));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: 1.2 + Math.random() * 2.1,
        hue: Math.random() > 0.5 ? "phys" : "chem",
      }));
    }

    function drawAtom(cx: number, cy: number, scale: number, rot: number, color: string) {
      ctx!.save();
      ctx!.translate(cx, cy);
      for (let i = 0; i < 3; i++) {
        ctx!.save();
        ctx!.rotate(rot + (Math.PI / 3) * i);
        ctx!.beginPath();
        ctx!.ellipse(0, 0, 86 * scale, 30 * scale, 0, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${color}, 0.34)`;
        ctx!.lineWidth = 1.4;
        ctx!.stroke();
        // الإلكترون
        const a = rot * 2.4 + i * 2.1;
        const ex = Math.cos(a) * 86 * scale;
        const ey = Math.sin(a) * 30 * scale;
        ctx!.beginPath();
        ctx!.arc(ex, ey, 3.4 * scale, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color}, 0.95)`;
        ctx!.shadowColor = `rgba(${color}, 0.9)`;
        ctx!.shadowBlur = 12;
        ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.restore();
      }
      ctx!.beginPath();
      ctx!.arc(0, 0, 7 * scale, 0, Math.PI * 2);
      const g = ctx!.createRadialGradient(-2, -2, 1, 0, 0, 7 * scale);
      g.addColorStop(0, `rgba(${color}, 1)`);
      g.addColorStop(1, `rgba(${color}, 0.25)`);
      ctx!.fillStyle = g;
      ctx!.fill();
      ctx!.restore();
    }

    let t = 0;
    function frame() {
      t += 0.006;
      ctx!.clearRect(0, 0, w, h);

      const px = (mouse.x - 0.5) * 14;
      const py = (mouse.y - 0.5) * 14;

      // الذرات
      drawAtom(w * 0.14 + px * 0.6, h * 0.3 + py * 0.6, 1.15, t, COLORS.phys);
      drawAtom(w * 0.88 - px * 0.9, h * 0.74 - py * 0.9, 0.85, -t * 1.3, COLORS.chem);
      drawAtom(w * 0.82 + px * 0.4, h * 0.16 + py * 0.4, 0.55, t * 1.7, COLORS.violet);

      // شبكة الجزيئات
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150) {
            const alpha = (1 - Math.sqrt(d2) / 150) * 0.28;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = `rgba(${nodes[i].hue === nodes[j].hue ? COLORS[nodes[i].hue] : "148,178,220"}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${COLORS[n.hue]}, 0.75)`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function onMouse(e: MouseEvent) {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    if (reduced) {
      frame();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />;
}
