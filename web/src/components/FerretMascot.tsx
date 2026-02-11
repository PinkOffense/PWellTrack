'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * PWellTrack Ferret Mascot — PNG-based with CSS 3D animation
 *
 * Uses AI-generated 3D clay ferret images with CSS perspective transforms
 * Animation sequence (~3.5s total):
 *   0.0s: Ferret standing, looking at viewer
 *   0.3s-1.8s: Spins 2 full rotations (like a dog before lying down)
 *   1.8s-2.5s: Shrinks + tilts as it "lies down"
 *   2.5s-3.0s: Cross-fade to curled sleeping pose
 *   3.0s+: Gentle breathing loop + zzz
 */

export default function FerretMascot({ size = 160, animate = true }: { size?: number; animate?: boolean }) {
  const [phase, setPhase] = useState<'standing' | 'spinning' | 'lying' | 'sleeping'>(
    animate ? 'standing' : 'sleeping'
  );

  useEffect(() => {
    if (!animate) return;
    // standing → spinning at 0.4s
    const t1 = setTimeout(() => setPhase('spinning'), 400);
    // spinning → lying at 2.2s (after 2 full rotations)
    const t2 = setTimeout(() => setPhase('lying'), 2200);
    // lying → sleeping at 3.0s (cross-fade to curled pose)
    const t3 = setTimeout(() => setPhase('sleeping'), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [animate]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, perspective: '600px' }}
    >
      {/* Soft radial glow behind the ferret */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,184,232,0.25) 0%, rgba(213,206,240,0.12) 50%, transparent 75%)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Standing ferret (spins, then fades out) */}
      <div className={`ferret-standing absolute inset-0 ${phase}`}>
        <Image
          src="/ferret-sitting.png"
          alt="PWellTrack ferret mascot standing"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(155,142,200,0.25))' }}
          priority
        />
      </div>

      {/* Sleeping ferret (fades in after spin) */}
      <div className={`ferret-sleeping absolute inset-0 ${phase}`}>
        <Image
          src="/ferret-sleeping.png"
          alt="PWellTrack ferret mascot sleeping"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(155,142,200,0.25))' }}
          priority
        />
      </div>

      {/* Zzz text overlay */}
      <div className={`zzz-overlay absolute top-0 right-0 ${phase}`}>
        <span className="zzz-1 block text-[#C4B3E0] font-bold opacity-0">z</span>
        <span className="zzz-2 block text-[#D5CEF0] font-bold opacity-0 text-xs -mt-1">z</span>
        <span className="zzz-3 block text-[#E0DAF4] font-bold opacity-0 text-[10px] -mt-1">z</span>
      </div>

      <style jsx>{`
        /* ═══════════════════════════════════════
           STANDING IMAGE — spins then hides
           ═══════════════════════════════════════ */

        .ferret-standing {
          transform-style: preserve-3d;
          transition: opacity 0.6s ease-in-out;
        }

        /* Initial: visible, no rotation */
        .ferret-standing.standing {
          opacity: 1;
          animation: none;
        }

        /* Spinning: 2 full 360° rotations on Y axis */
        .ferret-standing.spinning {
          opacity: 1;
          animation: spinTwice 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Lying down: scale down, tilt, fade */
        .ferret-standing.lying {
          opacity: 0;
          transform: scale(0.6) rotate(15deg) translateY(10%);
          transition: all 0.7s ease-in;
        }

        /* Hidden when sleeping */
        .ferret-standing.sleeping {
          opacity: 0;
          pointer-events: none;
        }

        /* ═══════════════════════════════════════
           SLEEPING IMAGE — fades in after spin
           ═══════════════════════════════════════ */

        .ferret-sleeping {
          transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
        }

        /* Hidden during standing and spinning */
        .ferret-sleeping.standing,
        .ferret-sleeping.spinning {
          opacity: 0;
          transform: scale(0.85) rotate(5deg);
        }

        /* Fading in as ferret lies down */
        .ferret-sleeping.lying {
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.8s 0.1s ease-out, transform 0.8s 0.1s ease-out;
        }

        /* Final: visible with breathing */
        .ferret-sleeping.sleeping {
          opacity: 1;
          transform: scale(1);
          animation: breathe 3.5s ease-in-out infinite;
        }

        /* ═══════════════════════════════════════
           ZZZ OVERLAY
           ═══════════════════════════════════════ */

        .zzz-overlay {
          pointer-events: none;
          transform: translate(15%, -10%);
        }

        .zzz-overlay.sleeping .zzz-1 {
          animation: zzzAppear 0.5s 0.8s ease-out forwards, zzzFloat 3s 1.3s ease-in-out infinite;
          font-size: 14px;
        }
        .zzz-overlay.sleeping .zzz-2 {
          animation: zzzAppear 0.5s 1.2s ease-out forwards, zzzFloat 3s 1.7s ease-in-out infinite;
        }
        .zzz-overlay.sleeping .zzz-3 {
          animation: zzzAppear 0.5s 1.6s ease-out forwards, zzzFloat 3s 2.1s ease-in-out infinite;
        }

        /* ═══════════════════════════════════════
           KEYFRAMES
           ═══════════════════════════════════════ */

        /* 2 full spins with perspective (gives 3D feel) */
        @keyframes spinTwice {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          25% {
            transform: rotateY(180deg) scale(0.92);
          }
          50% {
            transform: rotateY(360deg) scale(1);
          }
          75% {
            transform: rotateY(540deg) scale(0.92);
          }
          100% {
            transform: rotateY(720deg) scale(0.95);
          }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.015) translateY(-2px); }
        }

        @keyframes zzzAppear {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 0.6; transform: translateY(0); }
        }

        @keyframes zzzFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
