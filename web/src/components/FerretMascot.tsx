'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * PWellTrack Ferret Mascot — Video animation + sleeping PNG
 *
 * Supports two modes:
 * - Square (default): compact mascot with size prop
 * - Banner: wide LinkedIn-style header with width/height props
 */

interface FerretMascotProps {
  size?: number;
  width?: number;
  height?: number;
  animate?: boolean;
  banner?: boolean;
}

export default function FerretMascot({ size = 180, width, height, animate = true, banner = false }: FerretMascotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'playing' | 'sleeping'>(animate ? 'playing' : 'sleeping');

  const containerWidth = banner ? '100%' : (width ?? size);
  const containerHeight = height ?? (banner ? 200 : size);

  useEffect(() => {
    if (!animate) return;

    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setPhase('sleeping');
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {
      setPhase('sleeping');
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [animate]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${banner ? 'w-full rounded-b-3xl' : 'inline-flex'}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        ...(banner ? {
          background: 'linear-gradient(135deg, #f5f0ff 0%, #ece5ff 30%, #e0d8f5 60%, #f0ecff 100%)',
        } : {}),
      }}
    >
      {/* Soft radial glow behind the ferret */}
      <div
        className="absolute rounded-full"
        style={{
          width: banner ? containerHeight * 1.5 : '100%',
          height: banner ? containerHeight * 1.5 : '100%',
          background: 'radial-gradient(circle, rgba(201,184,232,0.3) 0%, rgba(213,206,240,0.15) 50%, transparent 75%)',
        }}
      />

      {/* Video animation — ferret walking/spinning */}
      <div
        className={`ferret-video absolute ${phase}`}
        style={{
          height: '100%',
          aspectRatio: '1',
        }}
      >
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
      <div
        className={`ferret-sleeping absolute ${phase}`}
        style={{
          height: '100%',
          aspectRatio: '1',
        }}
      >
        <Image
          src="/ferret-sleeping.png"
          alt="PWellTrack ferret mascot sleeping"
          width={typeof containerHeight === 'number' ? containerHeight : 200}
          height={typeof containerHeight === 'number' ? containerHeight : 200}
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 4px 14px rgba(155,142,200,0.3))' }}
          priority
        />
      </div>

      {/* Zzz text overlay */}
      <div
        className={`zzz-overlay absolute ${phase}`}
        style={{
          right: banner ? '35%' : '0',
          top: banner ? '5%' : '0',
        }}
      >
        <span className="zzz-1 block text-[#C4B3E0] font-bold opacity-0">z</span>
        <span className="zzz-2 block text-[#D5CEF0] font-bold opacity-0 text-xs -mt-1">z</span>
        <span className="zzz-3 block text-[#E0DAF4] font-bold opacity-0 text-[10px] -mt-1">z</span>
      </div>

      <style jsx>{`
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

        .zzz-overlay {
          pointer-events: none;
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
