'use client';

import { useEffect, useState } from 'react';

/**
 * PWellTrack Ferret Mascot
 *
 * Design spec (for AI/artist recreation):
 * ─────────────────────────────────────────
 * Animal: Ferret, 3D clay/toy aesthetic, minimalista
 * Proportions: Head ~40% of total height, oversized vs body. Body compact, rounded "bean" shape
 * Base pose: Curled into near-circle, tail wrapping around body
 * Forms: All volumes very smooth/rounded, no fur detail, clean sculpted surfaces
 * Expression: Small dot eyes (black), tiny nose (dark lilac), calm/sleepy, friendly
 *
 * Colors:
 *   - Main fur: warm cream #F5E6D3 to #EDD9C4
 *   - Purple accents: ears, face mask band, tail tip, paw tips → #9B7ED8 to #7C5CBF
 *   - Belly/chin: lighter cream #FAF0E6
 *   - Nose: #8B6DB5
 *   - Eyes: #2D2D2D with tiny white reflection
 *
 * Lighting: Soft top-down, gentle shadows, rubber-toy specular highlights
 *
 * Animation storyboard (2s total):
 *   KF 0.0s: Sitting upright, ears perked, eyes open, curious expression
 *   KF 0.4s: Head tilts slightly right, small blink
 *   KF 0.8s: Body begins rotating/leaning to curl
 *   KF 1.3s: Body fully curled into ball, tail wraps around
 *   KF 1.7s: Eyes half-closed
 *   KF 2.0s: Eyes fully closed, gentle breathing micro-motion
 *
 * Post-animation: Subtle breathing (scale 1.0 ↔ 1.015, 3s cycle) forever
 */

export default function FerretMascot({ size = 96, animate = true }: { size?: number; animate?: boolean }) {
  const [phase, setPhase] = useState<'sitting' | 'curling' | 'sleeping'>(animate ? 'sitting' : 'sleeping');

  useEffect(() => {
    if (!animate) return;
    // sitting → curling at 600ms, curling → sleeping at 1400ms
    const t1 = setTimeout(() => setPhase('curling'), 600);
    const t2 = setTimeout(() => setPhase('sleeping'), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animate]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className={`ferret-mascot ${phase}`}
        aria-label="PWellTrack ferret mascot"
      >
        <defs>
          {/* Body fur gradient - warm cream */}
          <radialGradient id="furMain" cx="45%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FAF0E6" />
            <stop offset="40%" stopColor="#F5E6D3" />
            <stop offset="100%" stopColor="#E8D4BC" />
          </radialGradient>

          {/* Purple accent gradient */}
          <linearGradient id="purpleAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#7C5CBF" />
          </linearGradient>

          {/* Belly lighter tone */}
          <radialGradient id="belly" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="100%" stopColor="#F5E6D3" />
          </radialGradient>

          {/* Top-down lighting highlight */}
          <radialGradient id="topLight" cx="45%" cy="20%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Soft shadow */}
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,109,181,0.15)" />
            <stop offset="100%" stopColor="rgba(139,109,181,0)" />
          </radialGradient>

          {/* Ear inner gradient */}
          <radialGradient id="earInner" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#9B7ED8" />
          </radialGradient>

          {/* Nose gradient */}
          <radialGradient id="noseGrad" cx="40%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#9B7ED8" />
            <stop offset="100%" stopColor="#7C5CBF" />
          </radialGradient>
        </defs>

        {/* ═══ SLEEPING POSE (curled up — final/static logo) ═══ */}
        <g className="ferret-sleeping-pose">
          {/* Ground shadow */}
          <ellipse cx="100" cy="162" rx="52" ry="8" fill="url(#shadow)" />

          {/* Tail — wraps around body from bottom-right to left */}
          <g className="ferret-tail">
            <path
              d="M 62,140 Q 48,148 45,138 Q 42,128 55,125 Q 68,122 80,132"
              fill="none"
              stroke="url(#furMain)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Tail tip — purple */}
            <circle cx="47" cy="136" r="8" fill="url(#purpleAccent)" opacity="0.85" />
          </g>

          {/* Body — curled bean shape */}
          <g className="ferret-body">
            <ellipse cx="100" cy="128" rx="48" ry="35" fill="url(#furMain)" />
            {/* Belly highlight */}
            <ellipse cx="96" cy="122" rx="30" ry="20" fill="url(#belly)" opacity="0.6" />
            {/* Top light reflection */}
            <ellipse cx="95" cy="112" rx="32" ry="18" fill="url(#topLight)" />
          </g>

          {/* Back paws (tiny, peeking out) */}
          <ellipse cx="130" cy="148" rx="8" ry="6" fill="#EDD9C4" />
          <ellipse cx="132" cy="149" rx="4" ry="3" fill="url(#purpleAccent)" opacity="0.3" />

          {/* Front paws (tucked under chin) */}
          <ellipse cx="82" cy="130" rx="9" ry="7" fill="#F5E6D3" />
          <ellipse cx="92" cy="132" rx="9" ry="7" fill="#F5E6D3" />
          {/* Paw pad accents */}
          <ellipse cx="82" cy="132" rx="4" ry="3" fill="url(#purpleAccent)" opacity="0.2" />
          <ellipse cx="92" cy="134" rx="4" ry="3" fill="url(#purpleAccent)" opacity="0.2" />

          {/* Head — resting on body, slightly oversized */}
          <g className="ferret-head">
            <ellipse cx="88" cy="103" rx="32" ry="28" fill="url(#furMain)" />

            {/* Face mask band — purple band across eyes */}
            <path
              d="M 62,98 Q 74,90 88,89 Q 102,90 114,98 Q 108,106 88,107 Q 68,106 62,98 Z"
              fill="url(#purpleAccent)"
              opacity="0.35"
            />

            {/* Forehead lighter patch */}
            <ellipse cx="88" cy="88" rx="14" ry="8" fill="#FAF0E6" opacity="0.5" />

            {/* Top highlight on head */}
            <ellipse cx="84" cy="86" rx="20" ry="12" fill="url(#topLight)" />

            {/* Cheeks — subtle warm */}
            <ellipse cx="70" cy="104" rx="6" ry="5" fill="#F9D4C2" opacity="0.25" />
            <ellipse cx="106" cy="104" rx="6" ry="5" fill="#F9D4C2" opacity="0.25" />

            {/* Ears */}
            <g className="ferret-ears">
              {/* Left ear */}
              <ellipse cx="66" cy="82" rx="10" ry="13" fill="#EDD9C4"
                transform="rotate(-15 66 82)" />
              <ellipse cx="66" cy="83" rx="6" ry="8" fill="url(#earInner)"
                transform="rotate(-15 66 83)" opacity="0.7" />

              {/* Right ear */}
              <ellipse cx="110" cy="82" rx="10" ry="13" fill="#EDD9C4"
                transform="rotate(15 110 82)" />
              <ellipse cx="110" cy="83" rx="6" ry="8" fill="url(#earInner)"
                transform="rotate(15 110 83)" opacity="0.7" />
            </g>

            {/* Nose */}
            <ellipse cx="88" cy="110" rx="5" ry="3.5" fill="url(#noseGrad)" />
            {/* Nose highlight */}
            <ellipse cx="87" cy="109" rx="2" ry="1.2" fill="rgba(255,255,255,0.3)" />

            {/* Mouth line */}
            <path
              d="M 85,113 Q 88,115 91,113"
              fill="none"
              stroke="#C4A882"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Eyes */}
            <g className="ferret-eyes">
              {/* Left eye */}
              <ellipse className="ferret-eye-left" cx="78" cy="99" rx="3.5" ry="3.5" fill="#2D2D2D" />
              <circle cx="77" cy="98" r="1.2" fill="rgba(255,255,255,0.7)" className="eye-reflection" />

              {/* Right eye */}
              <ellipse className="ferret-eye-right" cx="98" cy="99" rx="3.5" ry="3.5" fill="#2D2D2D" />
              <circle cx="97" cy="98" r="1.2" fill="rgba(255,255,255,0.7)" className="eye-reflection" />

              {/* Eyelids (close over eyes during sleep) */}
              <ellipse className="ferret-eyelid-left" cx="78" cy="99" rx="5" ry="0" fill="#EDD9C4" />
              <ellipse className="ferret-eyelid-right" cx="98" cy="99" rx="5" ry="0" fill="#EDD9C4" />
            </g>

            {/* Whisker dots */}
            <circle cx="73" cy="108" r="0.8" fill="#C4A882" opacity="0.3" />
            <circle cx="70" cy="110" r="0.8" fill="#C4A882" opacity="0.3" />
            <circle cx="103" cy="108" r="0.8" fill="#C4A882" opacity="0.3" />
            <circle cx="106" cy="110" r="0.8" fill="#C4A882" opacity="0.3" />
          </g>
        </g>
      </svg>

      <style jsx>{`
        .ferret-mascot {
          overflow: visible;
        }

        /* ─── SITTING PHASE: eyes open, head up, slight bounce ─── */
        .ferret-mascot.sitting .ferret-head {
          animation: headCurious 0.6s ease-in-out forwards;
        }
        .ferret-mascot.sitting .ferret-eyes .ferret-eye-left,
        .ferret-mascot.sitting .ferret-eyes .ferret-eye-right {
          ry: 3.5;
        }
        .ferret-mascot.sitting .ferret-eyelid-left,
        .ferret-mascot.sitting .ferret-eyelid-right {
          ry: 0;
        }
        .ferret-mascot.sitting .ferret-sleeping-pose {
          animation: sitUpPose 0.3s ease-out forwards;
        }

        /* ─── CURLING PHASE: body settles, head tilts ─── */
        .ferret-mascot.curling .ferret-head {
          animation: headSettle 0.8s ease-in-out forwards;
        }
        .ferret-mascot.curling .ferret-sleeping-pose {
          animation: curlDown 0.8s ease-in-out forwards;
        }
        .ferret-mascot.curling .ferret-eyes .ferret-eye-left,
        .ferret-mascot.curling .ferret-eyes .ferret-eye-right {
          animation: eyesHalfClose 0.8s ease-in-out forwards;
        }
        .ferret-mascot.curling .ferret-tail {
          animation: tailWrap 0.8s ease-in-out forwards;
        }

        /* ─── SLEEPING PHASE: eyes closed, gentle breathing ─── */
        .ferret-mascot.sleeping .ferret-eyelid-left,
        .ferret-mascot.sleeping .ferret-eyelid-right {
          animation: eyelidsClose 0.6s ease-in-out forwards;
        }
        .ferret-mascot.sleeping .ferret-eyes .ferret-eye-left,
        .ferret-mascot.sleeping .ferret-eyes .ferret-eye-right {
          ry: 1;
        }
        .ferret-mascot.sleeping .eye-reflection {
          opacity: 0;
        }
        .ferret-mascot.sleeping .ferret-sleeping-pose {
          animation: breathe 3s ease-in-out infinite;
        }
        .ferret-mascot.sleeping .ferret-tail {
          animation: tailTwitch 4s ease-in-out 2s infinite;
        }

        /* ─── KEYFRAMES ─── */

        @keyframes sitUpPose {
          0% { transform: translateY(4px) scale(0.95); opacity: 0.5; }
          100% { transform: translateY(-2px) scale(1.02); opacity: 1; }
        }

        @keyframes headCurious {
          0% { transform: rotate(0deg) translateY(0); }
          30% { transform: rotate(5deg) translateY(-2px); }
          60% { transform: rotate(-3deg) translateY(-1px); }
          100% { transform: rotate(0deg) translateY(0); }
        }

        @keyframes headSettle {
          0% { transform: rotate(0deg) translateY(-2px); }
          50% { transform: rotate(3deg) translateY(0); }
          100% { transform: rotate(0deg) translateY(2px); }
        }

        @keyframes curlDown {
          0% { transform: translateY(-2px) scale(1.02); }
          40% { transform: translateY(0) scale(1.01); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes eyesHalfClose {
          0% { ry: 3.5; }
          100% { ry: 1.5; }
        }

        @keyframes eyelidsClose {
          0% { ry: 0; }
          100% { ry: 5; }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.015) translateY(-1px); }
        }

        @keyframes tailTwitch {
          0%, 85%, 100% { transform: translateX(0) rotate(0deg); }
          90% { transform: translateX(2px) rotate(2deg); }
          95% { transform: translateX(-1px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
}
