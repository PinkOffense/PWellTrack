'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * PWellTrack Ferret Mascot — Video animation + sleeping PNG
 *
 * Full-width responsive banner that scales with screen size.
 * Video plays once, then cross-fades to sleeping PNG.
 */

export default function FerretMascot({ animate = true }: { animate?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'playing' | 'sleeping'>(animate ? 'playing' : 'sleeping');

  useEffect(() => {
    if (!animate) return;

    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => setPhase('sleeping');

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => setPhase('sleeping'));

    return () => video.removeEventListener('ended', handleEnded);
  }, [animate]);

  return (
    <div className="relative w-full overflow-hidden rounded-b-3xl" style={{ aspectRatio: '16 / 5' }}>
      {/* Video animation */}
      <div className={`ferret-video absolute inset-0 ${phase}`}>
        <video
          ref={videoRef}
          src="/ferret-animation.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Sleeping ferret PNG */}
      <div className={`ferret-sleeping absolute inset-0 flex items-center justify-center ${phase}`}>
        <Image
          src="/ferret-sleeping.png"
          alt="PWellTrack ferret mascot sleeping"
          width={400}
          height={400}
          className="h-full w-auto object-contain"
          priority
        />
      </div>

      {/* Zzz overlay */}
      <div className={`zzz-overlay absolute ${phase}`} style={{ right: '30%', top: '8%' }}>
        <span className="zzz-1 block text-[#C4B3E0] font-bold opacity-0">z</span>
        <span className="zzz-2 block text-[#D5CEF0] font-bold opacity-0 text-xs -mt-1">z</span>
        <span className="zzz-3 block text-[#E0DAF4] font-bold opacity-0 text-[10px] -mt-1">z</span>
      </div>

      <style jsx>{`
        .ferret-video {
          transition: opacity 1s ease-in-out;
        }
        .ferret-video.playing { opacity: 1; }
        .ferret-video.sleeping { opacity: 0; pointer-events: none; }

        .ferret-sleeping {
          transition: opacity 1s ease-in-out, transform 0.8s ease-in-out;
        }
        .ferret-sleeping.playing { opacity: 0; transform: scale(0.9); }
        .ferret-sleeping.sleeping {
          opacity: 1;
          transform: scale(1);
          animation: breathe 3.5s 1s ease-in-out infinite;
        }

        .zzz-overlay { pointer-events: none; }
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
