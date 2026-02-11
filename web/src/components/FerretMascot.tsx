'use client';

import { useEffect, useState } from 'react';

/**
 * PWellTrack Ferret Mascot — two-pose animated SVG
 *
 * Pose A: Ferret sitting upright, looking at viewer with curious eyes
 * Pose B: Ferret curled into ball, sleeping (final logo)
 *
 * Animation: A fades/morphs → B over ~2.5s with visible body rotation
 * Post-sleep: gentle breathing loop + occasional tail twitch
 *
 * Colors: cream/beige body, soft lavender accents (NOT strong violet)
 */

export default function FerretMascot({ size = 160, animate = true }: { size?: number; animate?: boolean }) {
  const [phase, setPhase] = useState<'sitting' | 'turning' | 'sleeping'>(animate ? 'sitting' : 'sleeping');

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase('turning'), 1000);
    const t2 = setTimeout(() => setPhase('sleeping'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animate]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>

      {/* ══════ POSE A: Sitting upright ══════ */}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className={`absolute inset-0 ferret-sitting ${phase}`}
        aria-hidden={phase === 'sleeping'}
      >
        <defs>
          <radialGradient id="furA" cx="45%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFF5EB" />
            <stop offset="35%" stopColor="#F5E6D3" />
            <stop offset="100%" stopColor="#E8D4BC" />
          </radialGradient>
          <linearGradient id="lavA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9B8E8" />
            <stop offset="100%" stopColor="#B4A0D9" />
          </linearGradient>
          <radialGradient id="lightA" cx="45%" cy="15%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="shadowA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(180,160,217,0.12)" />
            <stop offset="100%" stopColor="rgba(180,160,217,0)" />
          </radialGradient>
          <radialGradient id="bellyA" cx="50%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#FFF8F2" />
            <stop offset="100%" stopColor="#F5E6D3" />
          </radialGradient>
          <radialGradient id="earInA" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#DDD0F0" />
            <stop offset="100%" stopColor="#C4B3E0" />
          </radialGradient>
          <radialGradient id="noseA" cx="40%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#C4B3E0" />
            <stop offset="100%" stopColor="#B4A0D9" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="175" rx="40" ry="6" fill="url(#shadowA)" />

        {/* Tail behind body */}
        <path d="M 125,150 Q 145,140 150,125 Q 155,110 145,108" fill="none" stroke="#E8D4BC" strokeWidth="10" strokeLinecap="round" />
        <circle cx="145" cy="109" r="6" fill="url(#lavA)" opacity="0.6" />

        {/* Body — upright oval */}
        <ellipse cx="100" cy="135" rx="35" ry="40" fill="url(#furA)" />
        <ellipse cx="100" cy="130" rx="22" ry="28" fill="url(#bellyA)" opacity="0.5" />
        <ellipse cx="98" cy="115" rx="24" ry="20" fill="url(#lightA)" />

        {/* Front paws resting on ground */}
        <ellipse cx="82" cy="168" rx="10" ry="7" fill="#F0DCC8" />
        <ellipse cx="118" cy="168" rx="10" ry="7" fill="#F0DCC8" />
        <ellipse cx="82" cy="170" rx="5" ry="3" fill="url(#lavA)" opacity="0.15" />
        <ellipse cx="118" cy="170" rx="5" ry="3" fill="url(#lavA)" opacity="0.15" />

        {/* Head — big, round, cute */}
        <ellipse cx="100" cy="80" rx="36" ry="32" fill="url(#furA)" />

        {/* Face mask band — soft lavender */}
        <path d="M 70,76 Q 82,67 100,66 Q 118,67 130,76 Q 124,86 100,87 Q 76,86 70,76 Z"
          fill="url(#lavA)" opacity="0.25" />

        {/* Forehead patch */}
        <ellipse cx="100" cy="64" rx="16" ry="9" fill="#FFF5EB" opacity="0.45" />

        {/* Head highlight */}
        <ellipse cx="95" cy="62" rx="22" ry="14" fill="url(#lightA)" />

        {/* Ears */}
        <ellipse cx="72" cy="54" rx="12" ry="15" fill="#EDD9C4" transform="rotate(-12 72 54)" />
        <ellipse cx="72" cy="55" rx="7" ry="9" fill="url(#earInA)" transform="rotate(-12 72 55)" opacity="0.6" />
        <ellipse cx="128" cy="54" rx="12" ry="15" fill="#EDD9C4" transform="rotate(12 128 54)" />
        <ellipse cx="128" cy="55" rx="7" ry="9" fill="url(#earInA)" transform="rotate(12 128 55)" opacity="0.6" />

        {/* Cheeks */}
        <ellipse cx="76" cy="84" rx="7" ry="5" fill="#F9D4C2" opacity="0.2" />
        <ellipse cx="124" cy="84" rx="7" ry="5" fill="#F9D4C2" opacity="0.2" />

        {/* Eyes — big, curious, round */}
        <circle cx="86" cy="77" r="5" fill="#2D2D2D" />
        <circle cx="114" cy="77" r="5" fill="#2D2D2D" />
        {/* Eye reflections */}
        <circle cx="84" cy="75" r="2" fill="rgba(255,255,255,0.75)" />
        <circle cx="112" cy="75" r="2" fill="rgba(255,255,255,0.75)" />
        <circle cx="88" cy="79" r="0.8" fill="rgba(255,255,255,0.4)" />
        <circle cx="116" cy="79" r="0.8" fill="rgba(255,255,255,0.4)" />

        {/* Nose */}
        <ellipse cx="100" cy="88" rx="5.5" ry="4" fill="url(#noseA)" />
        <ellipse cx="99" cy="87" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.25)" />

        {/* Mouth */}
        <path d="M 96,92 Q 100,95 104,92" fill="none" stroke="#C4A882" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />

        {/* Whisker dots */}
        <circle cx="79" cy="88" r="1" fill="#C4A882" opacity="0.25" />
        <circle cx="76" cy="91" r="1" fill="#C4A882" opacity="0.25" />
        <circle cx="121" cy="88" r="1" fill="#C4A882" opacity="0.25" />
        <circle cx="124" cy="91" r="1" fill="#C4A882" opacity="0.25" />
      </svg>

      {/* ══════ POSE B: Curled sleeping ══════ */}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className={`absolute inset-0 ferret-curled ${phase}`}
        aria-label="PWellTrack ferret mascot"
      >
        <defs>
          <radialGradient id="furB" cx="45%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFF5EB" />
            <stop offset="35%" stopColor="#F5E6D3" />
            <stop offset="100%" stopColor="#E8D4BC" />
          </radialGradient>
          <linearGradient id="lavB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9B8E8" />
            <stop offset="100%" stopColor="#B4A0D9" />
          </linearGradient>
          <radialGradient id="lightB" cx="45%" cy="20%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="shadowB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(180,160,217,0.12)" />
            <stop offset="100%" stopColor="rgba(180,160,217,0)" />
          </radialGradient>
          <radialGradient id="bellyB" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFF8F2" />
            <stop offset="100%" stopColor="#F5E6D3" />
          </radialGradient>
          <radialGradient id="earInB" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#DDD0F0" />
            <stop offset="100%" stopColor="#C4B3E0" />
          </radialGradient>
          <radialGradient id="noseB" cx="40%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#C4B3E0" />
            <stop offset="100%" stopColor="#B4A0D9" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="162" rx="55" ry="8" fill="url(#shadowB)" />

        {/* Tail wrapping around body */}
        <g className="ferret-tail-b">
          <path d="M 58,142 Q 42,150 38,138 Q 34,126 50,122 Q 66,118 78,130"
            fill="none" stroke="#E8D4BC" strokeWidth="14" strokeLinecap="round" />
          <circle cx="40" cy="136" r="8" fill="url(#lavB)" opacity="0.5" />
        </g>

        {/* Body — curled bean */}
        <g className="ferret-body-b">
          <ellipse cx="100" cy="128" rx="50" ry="36" fill="url(#furB)" />
          <ellipse cx="96" cy="122" rx="32" ry="22" fill="url(#bellyB)" opacity="0.5" />
          <ellipse cx="95" cy="112" rx="34" ry="20" fill="url(#lightB)" />
        </g>

        {/* Back paw */}
        <ellipse cx="132" cy="150" rx="9" ry="6" fill="#EDD9C4" />
        <ellipse cx="134" cy="151" rx="4.5" ry="3" fill="url(#lavB)" opacity="0.15" />

        {/* Front paws tucked */}
        <ellipse cx="80" cy="132" rx="10" ry="8" fill="#F5E6D3" />
        <ellipse cx="92" cy="134" rx="10" ry="8" fill="#F5E6D3" />
        <ellipse cx="80" cy="134" rx="5" ry="3" fill="url(#lavB)" opacity="0.12" />
        <ellipse cx="92" cy="136" rx="5" ry="3" fill="url(#lavB)" opacity="0.12" />

        {/* Head resting */}
        <g className="ferret-head-b">
          <ellipse cx="86" cy="102" rx="34" ry="30" fill="url(#furB)" />

          {/* Face mask */}
          <path d="M 58,97 Q 70,88 86,87 Q 102,88 112,97 Q 106,106 86,107 Q 66,106 58,97 Z"
            fill="url(#lavB)" opacity="0.22" />

          {/* Forehead patch */}
          <ellipse cx="86" cy="86" rx="15" ry="9" fill="#FFF5EB" opacity="0.4" />
          <ellipse cx="82" cy="84" rx="22" ry="14" fill="url(#lightB)" />

          {/* Ears */}
          <ellipse cx="62" cy="78" rx="11" ry="14" fill="#EDD9C4" transform="rotate(-15 62 78)" />
          <ellipse cx="62" cy="79" rx="6.5" ry="8.5" fill="url(#earInB)" transform="rotate(-15 62 79)" opacity="0.55" />
          <ellipse cx="108" cy="78" rx="11" ry="14" fill="#EDD9C4" transform="rotate(15 108 78)" />
          <ellipse cx="108" cy="79" rx="6.5" ry="8.5" fill="url(#earInB)" transform="rotate(15 108 79)" opacity="0.55" />

          {/* Cheeks */}
          <ellipse cx="68" cy="104" rx="7" ry="5" fill="#F9D4C2" opacity="0.18" />
          <ellipse cx="104" cy="104" rx="7" ry="5" fill="#F9D4C2" opacity="0.18" />

          {/* Eyes — closed (sleeping) */}
          <g className="ferret-eyes-b">
            {/* Closed eye lines */}
            <path d="M 72,97 Q 76,100 80,97" fill="none" stroke="#2D2D2D" strokeWidth="1.8" strokeLinecap="round" className="eye-closed" />
            <path d="M 92,97 Q 96,100 100,97" fill="none" stroke="#2D2D2D" strokeWidth="1.8" strokeLinecap="round" className="eye-closed" />
          </g>

          {/* Nose */}
          <ellipse cx="86" cy="110" rx="5.5" ry="4" fill="url(#noseB)" />
          <ellipse cx="85" cy="109" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.2)" />

          {/* Mouth — slight smile */}
          <path d="M 83,114 Q 86,116 89,114" fill="none" stroke="#C4A882" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />

          {/* Whisker dots */}
          <circle cx="71" cy="108" r="1" fill="#C4A882" opacity="0.2" />
          <circle cx="68" cy="111" r="1" fill="#C4A882" opacity="0.2" />
          <circle cx="101" cy="108" r="1" fill="#C4A882" opacity="0.2" />
          <circle cx="104" cy="111" r="1" fill="#C4A882" opacity="0.2" />

          {/* Zzz bubble */}
          <g className="zzz-bubble" opacity="0">
            <text x="120" y="72" fontSize="11" fill="#C4B3E0" fontWeight="bold">z</text>
            <text x="130" y="62" fontSize="9" fill="#D5CEF0" fontWeight="bold">z</text>
            <text x="137" y="54" fontSize="7" fill="#E0DAF4" fontWeight="bold">z</text>
          </g>
        </g>
      </svg>

      <style jsx>{`
        /* ─── POSE VISIBILITY & TRANSITIONS ─── */

        .ferret-sitting {
          transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
        }
        .ferret-curled {
          transition: opacity 0.8s ease-in-out, transform 0.6s ease-in-out;
        }

        /* Phase: SITTING — show pose A, hide pose B */
        .ferret-sitting.sitting {
          opacity: 1;
          transform: scale(1);
        }
        .ferret-curled.sitting {
          opacity: 0;
          transform: scale(0.9) rotate(10deg);
        }

        /* Phase: TURNING — both visible briefly, A spins out, B spins in */
        .ferret-sitting.turning {
          opacity: 0;
          transform: scale(0.85) rotate(-15deg);
          transition: opacity 0.7s ease-in, transform 0.7s ease-in;
        }
        .ferret-curled.turning {
          opacity: 1;
          transform: scale(1.02) rotate(0deg);
          transition: opacity 0.6s 0.3s ease-out, transform 0.6s 0.3s ease-out;
        }

        /* Phase: SLEEPING — only pose B, with breathing */
        .ferret-sitting.sleeping {
          opacity: 0;
          transform: scale(0.8) rotate(-15deg);
          pointer-events: none;
        }
        .ferret-curled.sleeping {
          opacity: 1;
          transform: scale(1);
          animation: breathe 3.5s ease-in-out infinite;
        }

        /* Zzz appears after settling */
        .ferret-curled.sleeping .zzz-bubble {
          animation: zzzAppear 1s 0.5s ease-out forwards, zzzFloat 3s 1.5s ease-in-out infinite;
        }

        /* Tail micro-movement while sleeping */
        .ferret-curled.sleeping .ferret-tail-b {
          animation: tailTwitch 5s ease-in-out 2s infinite;
        }

        /* Sitting head curiosity animation */
        .ferret-sitting.sitting .ferret-head-b,
        .ferret-sitting.sitting {
          /* nothing special */
        }

        /* Slight head tilt when sitting */
        @keyframes headTilt {
          0%, 100% { transform: rotate(0deg); }
          40% { transform: rotate(4deg) translateY(-1px); }
          70% { transform: rotate(-2deg); }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.012) translateY(-1.5px); }
        }

        @keyframes tailTwitch {
          0%, 88%, 100% { transform: translate(0, 0) rotate(0deg); }
          92% { transform: translate(2px, -1px) rotate(2deg); }
          96% { transform: translate(-1px, 0) rotate(-1deg); }
        }

        @keyframes zzzAppear {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 0.6; transform: translateY(0); }
        }

        @keyframes zzzFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
