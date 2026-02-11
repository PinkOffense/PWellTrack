'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * PWellTrack Ferret Mascot — Video animation + sleeping PNG
 *
 * Uses AI-generated Kling video for the walking/spinning animation,
 * then cross-fades to the sleeping PNG for the resting state.
 *
 * Animation sequence:
 *   1. Video plays: ferret walks, spins, curls up
 *   2. When video ends: cross-fade to sleeping PNG
 *   3. Sleeping: breathing animation + zzz
 */

export default function FerretMascot({ size = 180, animate = true }: { size?: number; animate?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'playing' | 'sleeping'>(animate ? 'playing' : 'sleeping');

  useEffect(() => {
    if (!animate) return;

    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setPhase('sleeping');
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {
      // autoplay blocked — go straight to sleeping
      setPhase('sleeping');
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
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
          transform: 'scale(1.15)',
        }}
      />

      {/* Video animation — ferret walking/spinning */}
      <div className={`ferret-video absolute inset-0 ${phase}`}>
        <video
          ref={videoRef}
          src="/ferret-animation.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 4px 14px rgba(155,142,200,0.3))' }}
        />
      </div>

      {/* Sleeping ferret PNG (fades in after video ends) */}
      <div className={`ferret-sleeping absolute inset-0 ${phase}`}>
        <Image
          src="/ferret-sleeping.png"
          alt="PWellTrack ferret mascot sleeping"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 4px 14px rgba(155,142,200,0.3))' }}
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
           VIDEO — plays then fades out
           ═══════════════════════════════════════ */

        .ferret-video {
          transition: opacity 1s ease-in-out;
        }

        .ferret-video.playing {
          opacity: 1;
        }

        .ferret-video.sleeping {
          opacity: 0;
          pointer-events: none;
        }

        /* ═══════════════════════════════════════
           SLEEPING IMAGE — fades in after video
           ═══════════════════════════════════════ */

        .ferret-sleeping {
          transition: opacity 1s ease-in-out, transform 0.8s ease-in-out;
        }

        .ferret-sleeping.playing {
          opacity: 0;
          transform: scale(0.9);
        }

        .ferret-sleeping.sleeping {
          opacity: 1;
          transform: scale(1);
          animation: breathe 3.5s 1s ease-in-out infinite;
        }

        /* ═══════════════════════════════════════
           ZZZ OVERLAY
           ═══════════════════════════════════════ */

        .zzz-overlay {
          pointer-events: none;
          transform: translate(15%, -10%);
        }

        .zzz-overlay.sleeping .zzz-1 {
          animation: zzzAppear 0.5s 1.5s ease-out forwards, zzzFloat 3s 2s ease-in-out infinite;
          font-size: 14px;
        }
        .zzz-overlay.sleeping .zzz-2 {
          animation: zzzAppear 0.5s 1.9s ease-out forwards, zzzFloat 3s 2.4s ease-in-out infinite;
        }
        .zzz-overlay.sleeping .zzz-3 {
          animation: zzzAppear 0.5s 2.3s ease-out forwards, zzzFloat 3s 2.8s ease-in-out infinite;
        }

        /* ═══════════════════════════════════════
           KEYFRAMES
           ═══════════════════════════════════════ */

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
