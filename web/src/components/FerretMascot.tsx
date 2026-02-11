'use client';

import { useEffect, useRef } from 'react';

/**
 * PWellTrack Ferret Mascot — Video animation banner
 *
 * Full-width responsive banner that scales with screen size.
 * Video plays once and freezes on its last frame.
 */

export default function FerretMascot({ animate = true }: { animate?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!animate) return;

    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // autoplay blocked — video stays on first frame
    });
  }, [animate]);

  return (
    <div className="relative w-full overflow-hidden rounded-b-3xl" style={{ aspectRatio: '16 / 5' }}>
      <video
        ref={videoRef}
        src="/ferret-animation.mp4"
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
