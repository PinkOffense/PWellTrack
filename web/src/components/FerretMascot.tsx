'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * PWellTrack Ferret Mascot — PNG-based with circular walk animation
 *
 * Animation sequence (~6s total):
 *   0.0s-0.5s: Ferret appears standing, small bounce entrance
 *   0.5s-4.8s: Walks in 2 circular laps (like a dog before lying down)
 *              — circular path + walking bobbing + body lean
 *   4.8s-5.8s: Slows down, shrinks, cross-fades to sleeping pose
 *   5.8s+:     Gentle breathing loop + zzz
 */

export default function FerretMascot({ size = 160, animate = true }: { size?: number; animate?: boolean }) {
  const [phase, setPhase] = useState<'standing' | 'walking' | 'lying' | 'sleeping'>(
    animate ? 'standing' : 'sleeping'
  );

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase('walking'), 500);
    const t2 = setTimeout(() => setPhase('lying'), 4800);
    const t3 = setTimeout(() => setPhase('sleeping'), 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [animate]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Soft radial glow behind the ferret */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,184,232,0.25) 0%, rgba(213,206,240,0.12) 50%, transparent 75%)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Ground shadow that moves with the ferret */}
      <div className={`ferret-shadow absolute ${phase}`}
        style={{
          width: '60%',
          height: '12%',
          bottom: '8%',
          left: '20%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(155,142,200,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Standing/walking ferret — outer div for circular path, inner for bobbing */}
      <div className={`ferret-path absolute inset-0 ${phase}`}>
        <div className={`ferret-bob ${phase}`} style={{ width: '100%', height: '100%' }}>
          <Image
            src="/ferret-sitting.png"
            alt="PWellTrack ferret mascot"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(155,142,200,0.25))' }}
            priority
          />
        </div>
      </div>

      {/* Sleeping ferret (fades in when lying down) */}
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
           STANDING FERRET — circular path layer
           ═══════════════════════════════════════ */

        .ferret-path {
          transition: opacity 0.8s ease-in-out;
        }

        /* Entrance: small bounce in */
        .ferret-path.standing {
          opacity: 1;
          animation: entrance 0.5s ease-out forwards;
        }

        /* Walking: circular path — 2 full laps */
        .ferret-path.walking {
          opacity: 1;
          animation: circleWalk 4s ease-in-out forwards;
        }

        /* Lying: shrink, tilt, fade out */
        .ferret-path.lying {
          opacity: 0;
          transform: scale(0.5) rotate(20deg) translateY(15%);
          transition: all 0.8s ease-in;
        }

        /* Hidden when sleeping */
        .ferret-path.sleeping {
          opacity: 0;
          pointer-events: none;
        }

        /* ═══════════════════════════════════════
           BOBBING — walking step bounce
           ═══════════════════════════════════════ */

        .ferret-bob {
          position: relative;
        }

        .ferret-bob.walking {
          animation: walkBob 0.35s ease-in-out infinite;
        }

        .ferret-bob.lying,
        .ferret-bob.sleeping {
          animation: none;
        }

        /* ═══════════════════════════════════════
           GROUND SHADOW — follows the ferret
           ═══════════════════════════════════════ */

        .ferret-shadow.walking {
          animation: shadowFollow 4s ease-in-out forwards;
        }

        .ferret-shadow.lying {
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .ferret-shadow.sleeping {
          animation: shadowBreathe 3.5s ease-in-out infinite;
        }

        /* ═══════════════════════════════════════
           SLEEPING IMAGE — fades in after walk
           ═══════════════════════════════════════ */

        .ferret-sleeping {
          transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
        }

        .ferret-sleeping.standing,
        .ferret-sleeping.walking {
          opacity: 0;
          transform: scale(0.8) rotate(10deg);
        }

        .ferret-sleeping.lying {
          opacity: 1;
          transform: scale(1);
          transition: opacity 1s 0.2s ease-out, transform 1s 0.2s ease-out;
        }

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

        /* Entrance bounce */
        @keyframes entrance {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          60% { transform: scale(1.05) translateY(-3px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* Circular walk path — 2 full clockwise laps
           Radius ~18px, with body lean and slight scale for depth.
           Ferret leans into turns and appears slightly bigger
           when "closer" (bottom of circle) */
        @keyframes circleWalk {
          /* ── Lap 1 ── */
          0%      { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          6.25%   { transform: translate(13px, -13px) rotate(-7deg) scale(0.97); }
          12.5%   { transform: translate(18px, 0px) rotate(-4deg) scale(1); }
          18.75%  { transform: translate(13px, 13px) rotate(4deg) scale(1.03); }
          25%     { transform: translate(0px, 18px) rotate(7deg) scale(1.04); }
          31.25%  { transform: translate(-13px, 13px) rotate(4deg) scale(1.03); }
          37.5%   { transform: translate(-18px, 0px) rotate(-4deg) scale(1); }
          43.75%  { transform: translate(-13px, -13px) rotate(-7deg) scale(0.97); }
          /* ── Lap 2 ── */
          50%     { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          56.25%  { transform: translate(13px, -13px) rotate(-7deg) scale(0.97); }
          62.5%   { transform: translate(18px, 0px) rotate(-4deg) scale(1); }
          68.75%  { transform: translate(13px, 13px) rotate(4deg) scale(1.03); }
          75%     { transform: translate(0px, 18px) rotate(7deg) scale(1.04); }
          81.25%  { transform: translate(-13px, 13px) rotate(4deg) scale(1.03); }
          87.5%   { transform: translate(-18px, 0px) rotate(-4deg) scale(1); }
          93.75%  { transform: translate(-13px, -13px) rotate(-7deg) scale(0.97); }
          /* ── Back to center ── */
          100%    { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }

        /* Walking step bounce — quick little ferret steps */
        @keyframes walkBob {
          0%, 100% { transform: translateY(0px) scaleY(1); }
          25% { transform: translateY(-4px) scaleY(1.02); }
          50% { transform: translateY(0px) scaleY(0.98); }
          75% { transform: translateY(-3px) scaleY(1.01); }
        }

        /* Shadow follows the circular path */
        @keyframes shadowFollow {
          0%      { transform: translate(0px, 0px); opacity: 0.8; }
          6.25%   { transform: translate(13px, 0px); opacity: 0.7; }
          12.5%   { transform: translate(18px, 0px); opacity: 0.8; }
          18.75%  { transform: translate(13px, 0px); opacity: 0.9; }
          25%     { transform: translate(0px, 0px); opacity: 1; }
          31.25%  { transform: translate(-13px, 0px); opacity: 0.9; }
          37.5%   { transform: translate(-18px, 0px); opacity: 0.8; }
          43.75%  { transform: translate(-13px, 0px); opacity: 0.7; }
          50%     { transform: translate(0px, 0px); opacity: 0.8; }
          56.25%  { transform: translate(13px, 0px); opacity: 0.7; }
          62.5%   { transform: translate(18px, 0px); opacity: 0.8; }
          68.75%  { transform: translate(13px, 0px); opacity: 0.9; }
          75%     { transform: translate(0px, 0px); opacity: 1; }
          81.25%  { transform: translate(-13px, 0px); opacity: 0.9; }
          87.5%   { transform: translate(-18px, 0px); opacity: 0.8; }
          93.75%  { transform: translate(-13px, 0px); opacity: 0.7; }
          100%    { transform: translate(0px, 0px); opacity: 0.8; }
        }

        /* Breathing animation for sleeping ferret */
        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.015) translateY(-2px); }
        }

        /* Shadow breathing */
        @keyframes shadowBreathe {
          0%, 100% { transform: scaleX(1); opacity: 0.6; }
          50% { transform: scaleX(1.05); opacity: 0.8; }
        }

        /* Zzz appear */
        @keyframes zzzAppear {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 0.6; transform: translateY(0); }
        }

        /* Zzz float */
        @keyframes zzzFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
