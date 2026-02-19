'use client';

import { useEffect, useRef } from 'react';

/* ─── Paw print SVG path (clean, professional) ─── */
const PAW_PATH = `M12 2C13.66 2 15 3.57 15 5.5C15 7.43 13.66 9 12 9C10.34 9 9 7.43 9 5.5C9 3.57 10.34 2 12 2Z
M6.5 5C7.88 5 9 6.34 9 8C9 9.66 7.88 11 6.5 11C5.12 11 4 9.66 4 8C4 6.34 5.12 5 6.5 5Z
M17.5 5C18.88 5 20 6.34 20 8C20 9.66 18.88 11 17.5 11C16.12 11 15 9.66 15 8C15 6.34 16.12 5 17.5 5Z
M4 13C5.1 13 6 14.12 6 15.5C6 16.88 5.1 18 4 18C2.9 18 2 16.88 2 15.5C2 14.12 2.9 13 4 13Z
M20 13C21.1 13 22 14.12 22 15.5C22 16.88 21.1 18 20 18C18.9 18 18 16.88 18 15.5C18 14.12 18.9 13 20 13Z
M12 11C14.76 11 17 13.24 17 16C17 18.76 14.76 21 12 21C9.24 21 7 18.76 7 16C7 13.24 9.24 11 12 11Z`;

const HEART_PATH = `M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z`;

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  type: 'paw' | 'heart' | 'dot';
  color: string;
  drift: number;
  phase: number;
}

const PARTICLE_COUNT = 14;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

function createParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  const colors = [
    'rgba(201,184,232,',
    'rgba(213,206,240,',
    'rgba(180,165,214,',
    'rgba(224,218,244,',
    'rgba(242,200,210,',
    'rgba(232,212,188,',
  ];

  for (let i = 0; i < count; i++) {
    const type = i < count * 0.45 ? 'paw' : i < count * 0.7 ? 'heart' : 'dot';
    particles.push({
      x: Math.random() * 100,
      y: 100 + Math.random() * 40,
      size: type === 'dot' ? 2 + Math.random() * 4 : 10 + Math.random() * 14,
      speed: 0.15 + Math.random() * 0.3,
      opacity: 0.08 + Math.random() * 0.22,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.6,
      type,
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

export default function FarmScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>(createParticles(PARTICLE_COUNT));
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastFrameRef = useRef<number>(0);

  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pawPath = new Path2D(PAW_PATH);
    const heartPath = new Path2D(HEART_PATH);

    // PERF-06: Pause animation when tab is not visible
    const handleVisibility = () => {
      visibleRef.current = !document.hidden;
      if (visibleRef.current && !animRef.current) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (now: number) => {
      // PERF-06: Don't animate when tab is hidden
      if (!visibleRef.current) {
        animRef.current = 0;
        return;
      }
      animRef.current = requestAnimationFrame(animate);

      // Throttle to ~30fps — no need for 60fps on a subtle background
      const delta = now - lastFrameRef.current;
      if (delta < FRAME_INTERVAL) return;
      lastFrameRef.current = now - (delta % FRAME_INTERVAL);

      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) return;

      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // ─── Soft gradient blobs ───
      const blobDefs = [
        { xBase: 30, yBase: 40, xAmp: 15, yAmp: 10, xFreq: 0.3, yFreq: 0.4, r: 120, color: 'rgba(201,184,232,0.06)' },
        { xBase: 70, yBase: 60, xAmp: 12, yAmp: 8, xFreq: 0.25, yFreq: 0.35, r: 100, color: 'rgba(242,200,210,0.05)' },
        { xBase: 50, yBase: 30, xAmp: 20, yAmp: 12, xFreq: 0.2, yFreq: 0.3, r: 140, color: 'rgba(180,165,214,0.04)' },
      ];

      for (const b of blobDefs) {
        const bx = ((b.xBase + Math.sin(t * b.xFreq) * b.xAmp) / 100) * w;
        const by = ((b.yBase + Math.cos(t * b.yFreq) * b.yAmp) / 100) * h;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // ─── Heartbeat pulse line ───
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.sin(t * 1.5) * 0.02;
      ctx.strokeStyle = '#C9B8E8';
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();

      const baseY = h * 0.5;
      const pulseOffset = (t * 40) % w;

      for (let px = 0; px < w; px += 4) {
        const localX = (px + pulseOffset) % w;
        const normalX = localX / w;

        let py = baseY;
        const segment = (normalX * 4) % 1;
        const inBeat = (normalX * 4) % 4;

        if (inBeat > 1.8 && inBeat < 2.5) {
          if (segment < 0.15) py = baseY - 6;
          else if (segment < 0.25) py = baseY + 18;
          else if (segment < 0.35) py = baseY - 24;
          else if (segment < 0.5) py = baseY + 8;
          else if (segment < 0.6) py = baseY - 4;
        }

        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      // ─── Floating particles ───
      const particles = particlesRef.current;
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(t * 0.8 + p.phase) * 0.08;
        p.rotation += p.rotSpeed;

        if (p.y < -10) {
          p.y = 105 + Math.random() * 15;
          p.x = Math.random() * 100;
          p.opacity = 0.08 + Math.random() * 0.22;
        }

        const ppx = (p.x / 100) * w;
        const ppy = (p.y / 100) * h;

        ctx.save();
        ctx.translate(ppx, ppy);
        ctx.rotate((p.rotation * Math.PI) / 180);

        let fadeOpacity = p.opacity;
        if (p.y > 90) fadeOpacity *= (100 - p.y) / 10;
        if (p.y < 10) fadeOpacity *= p.y / 10;

        if (p.type === 'dot') {
          ctx.globalAlpha = fadeOpacity;
          ctx.fillStyle = p.color + '0.6)';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const scale = p.size / 24;
          ctx.scale(scale, scale);
          ctx.translate(-12, -12);
          ctx.fillStyle = p.color + fadeOpacity.toFixed(2) + ')';
          if (p.type === 'paw') ctx.fill(pawPath);
          else ctx.fill(heartPath);
        }

        ctx.restore();
      }

      // ─── Soft wave at the bottom ───
      ctx.save();
      const waveY = h - 8;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let wx = 0; wx <= w; wx += 8) {
        const wy = waveY + Math.sin((wx / w) * Math.PI * 3 + t * 0.5) * 4;
        ctx.lineTo(wx, wy);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = 'rgba(180,165,214,0.03)';
      ctx.fill();
      ctx.restore();
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
