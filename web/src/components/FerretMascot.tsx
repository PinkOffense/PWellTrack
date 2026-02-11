'use client';

import { useEffect, useState } from 'react';

/**
 * PWellTrack Ferret Mascot — 3D clay/toy style
 *
 * Two SVG poses with cross-fade animation:
 *   Pose A: Sitting upright, curious eyes
 *   Pose B: Curled sleeping (final logo)
 *
 * 3D effect achieved via:
 *   - Multi-layer radial gradients for volume
 *   - Rim lighting on edges
 *   - Specular highlights from top-left light
 *   - Ambient occlusion at form intersections
 *   - Subsurface scattering glow on ears
 *   - Soft cast shadow on ground
 */

export default function FerretMascot({ size = 160, animate = true }: { size?: number; animate?: boolean }) {
  const [phase, setPhase] = useState<'sitting' | 'turning' | 'sleeping'>(animate ? 'sitting' : 'sleeping');

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase('turning'), 1000);
    const t2 = setTimeout(() => setPhase('sleeping'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animate]);

  /* Shared gradient defs used by both poses */
  const sharedDefs = (id: string) => (
    <defs>
      {/* ── Main fur: warm cream with 3D volume ── */}
      <radialGradient id={`fur-${id}`} cx="38%" cy="28%" r="68%">
        <stop offset="0%" stopColor="#FFF8F0" />
        <stop offset="25%" stopColor="#F7E8D5" />
        <stop offset="55%" stopColor="#EDCFAF" />
        <stop offset="100%" stopColor="#D4B896" />
      </radialGradient>

      {/* ── Belly: lighter, warmer center ── */}
      <radialGradient id={`belly-${id}`} cx="50%" cy="35%" r="55%">
        <stop offset="0%" stopColor="#FFFCF7" />
        <stop offset="60%" stopColor="#FBF0E0" />
        <stop offset="100%" stopColor="#F0DBBF" />
      </radialGradient>

      {/* ── Top-left specular light ── */}
      <radialGradient id={`spec-${id}`} cx="30%" cy="15%" r="45%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>

      {/* ── Rim light (back-edge glow) ── */}
      <radialGradient id={`rim-${id}`} cx="75%" cy="25%" r="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
        <stop offset="70%" stopColor="rgba(255,255,255,0)" />
        <stop offset="90%" stopColor="rgba(255,255,255,0.2)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
      </radialGradient>

      {/* ── Ambient occlusion (soft dark contact) ── */}
      <radialGradient id={`ao-${id}`} cx="50%" cy="80%" r="50%">
        <stop offset="0%" stopColor="rgba(160,130,100,0.12)" />
        <stop offset="100%" stopColor="rgba(160,130,100,0)" />
      </radialGradient>

      {/* ── Ground shadow ── */}
      <radialGradient id={`gshadow-${id}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(150,130,170,0.18)" />
        <stop offset="60%" stopColor="rgba(150,130,170,0.06)" />
        <stop offset="100%" stopColor="rgba(150,130,170,0)" />
      </radialGradient>

      {/* ── Lavender accent gradient ── */}
      <radialGradient id={`lav-${id}`} cx="40%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#D5CEF0" />
        <stop offset="50%" stopColor="#C4B3E0" />
        <stop offset="100%" stopColor="#B4A0D0" />
      </radialGradient>

      {/* ── Ear subsurface scattering ── */}
      <radialGradient id={`earglow-${id}`} cx="50%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#E8DEFA" />
        <stop offset="40%" stopColor="#D5CAF0" />
        <stop offset="100%" stopColor="#C0B0DC" />
      </radialGradient>

      {/* ── Nose 3D ── */}
      <radialGradient id={`nose-${id}`} cx="35%" cy="30%" r="55%">
        <stop offset="0%" stopColor="#D5C5E8" />
        <stop offset="50%" stopColor="#C0ACD8" />
        <stop offset="100%" stopColor="#A898C4" />
      </radialGradient>

      {/* ── Body shadow depth ── */}
      <radialGradient id={`depth-${id}`} cx="50%" cy="70%" r="50%">
        <stop offset="0%" stopColor="rgba(180,155,120,0.08)" />
        <stop offset="100%" stopColor="rgba(180,155,120,0)" />
      </radialGradient>

      {/* Filters for soft edges */}
      <filter id={`soften-${id}`}>
        <feGaussianBlur stdDeviation="0.5" />
      </filter>
    </defs>
  );

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>

      {/* ══════════════════════════════════════════════
          POSE A — Sitting upright, curious
         ══════════════════════════════════════════════ */}
      <svg viewBox="0 0 200 200" width={size} height={size}
        className={`absolute inset-0 ferret-sitting ${phase}`}
        aria-hidden={phase === 'sleeping'}>
        {sharedDefs('a')}

        {/* Ground shadow */}
        <ellipse cx="100" cy="178" rx="48" ry="8" fill="url(#gshadow-a)" />

        {/* ── Tail (behind body) ── */}
        <path d="M 128,152 Q 150,142 155,124 Q 158,108 148,104"
          fill="none" stroke="#E0C8A8" strokeWidth="12" strokeLinecap="round" />
        <path d="M 128,152 Q 150,142 155,124 Q 158,108 148,104"
          fill="none" stroke="url(#rim-a)" strokeWidth="12" strokeLinecap="round" />
        <circle cx="148" cy="105" r="7" fill="url(#lav-a)" opacity="0.55" />
        <circle cx="146" cy="103" r="3" fill="rgba(255,255,255,0.2)" />

        {/* ── Body ── */}
        <ellipse cx="100" cy="136" rx="37" ry="42" fill="url(#fur-a)" />
        <ellipse cx="100" cy="136" rx="37" ry="42" fill="url(#depth-a)" />
        <ellipse cx="100" cy="136" rx="37" ry="42" fill="url(#rim-a)" />
        {/* Belly */}
        <ellipse cx="100" cy="132" rx="24" ry="30" fill="url(#belly-a)" opacity="0.6" />
        {/* Specular */}
        <ellipse cx="92" cy="115" rx="20" ry="18" fill="url(#spec-a)" />
        {/* AO at base */}
        <ellipse cx="100" cy="168" rx="30" ry="10" fill="url(#ao-a)" />

        {/* ── Front paws ── */}
        <ellipse cx="80" cy="170" rx="11" ry="8" fill="url(#fur-a)" />
        <ellipse cx="80" cy="170" rx="11" ry="8" fill="url(#rim-a)" />
        <ellipse cx="78" cy="168" rx="5" ry="3.5" fill="rgba(255,255,255,0.2)" />
        <ellipse cx="80" cy="173" rx="5" ry="3" fill="url(#lav-a)" opacity="0.12" />

        <ellipse cx="120" cy="170" rx="11" ry="8" fill="url(#fur-a)" />
        <ellipse cx="120" cy="170" rx="11" ry="8" fill="url(#rim-a)" />
        <ellipse cx="118" cy="168" rx="5" ry="3.5" fill="rgba(255,255,255,0.2)" />
        <ellipse cx="120" cy="173" rx="5" ry="3" fill="url(#lav-a)" opacity="0.12" />

        {/* ── Head ── */}
        <ellipse cx="100" cy="78" rx="38" ry="34" fill="url(#fur-a)" />
        <ellipse cx="100" cy="78" rx="38" ry="34" fill="url(#rim-a)" />
        {/* Head specular highlight */}
        <ellipse cx="90" cy="62" rx="22" ry="16" fill="url(#spec-a)" />
        {/* Head depth shadow at neck */}
        <ellipse cx="100" cy="105" rx="22" ry="8" fill="url(#ao-a)" />

        {/* Face mask band */}
        <path d="M 68,74 Q 82,64 100,63 Q 118,64 132,74 Q 126,85 100,86 Q 74,85 68,74 Z"
          fill="url(#lav-a)" opacity="0.2" />

        {/* Forehead lighter patch */}
        <ellipse cx="100" cy="62" rx="17" ry="10" fill="#FFF8F0" opacity="0.4" />
        <ellipse cx="96" cy="58" rx="10" ry="6" fill="rgba(255,255,255,0.25)" />

        {/* ── Ears ── */}
        {/* Left ear */}
        <ellipse cx="70" cy="50" rx="14" ry="17" fill="url(#fur-a)" transform="rotate(-10 70 50)" />
        <ellipse cx="70" cy="50" rx="14" ry="17" fill="url(#rim-a)" transform="rotate(-10 70 50)" />
        <ellipse cx="70" cy="52" rx="8" ry="11" fill="url(#earglow-a)" transform="rotate(-10 70 52)" opacity="0.55" />
        <ellipse cx="68" cy="48" rx="5" ry="6" fill="rgba(255,255,255,0.15)" transform="rotate(-10 68 48)" />
        {/* Right ear */}
        <ellipse cx="130" cy="50" rx="14" ry="17" fill="url(#fur-a)" transform="rotate(10 130 50)" />
        <ellipse cx="130" cy="50" rx="14" ry="17" fill="url(#rim-a)" transform="rotate(10 130 50)" />
        <ellipse cx="130" cy="52" rx="8" ry="11" fill="url(#earglow-a)" transform="rotate(10 130 52)" opacity="0.55" />
        <ellipse cx="128" cy="48" rx="5" ry="6" fill="rgba(255,255,255,0.15)" transform="rotate(10 128 48)" />

        {/* ── Cheeks (warm blush) ── */}
        <ellipse cx="74" cy="84" rx="8" ry="5.5" fill="#F5CAB8" opacity="0.18" />
        <ellipse cx="126" cy="84" rx="8" ry="5.5" fill="#F5CAB8" opacity="0.18" />

        {/* ── Eyes (3D with depth) ── */}
        {/* Left eye socket shadow */}
        <ellipse cx="86" cy="77" rx="7.5" ry="7" fill="rgba(100,80,60,0.06)" />
        <circle cx="86" cy="76" r="5.5" fill="#1E1E1E" />
        <circle cx="86" cy="76" r="4.5" fill="#2D2D2D" />
        {/* Iris highlight ring */}
        <circle cx="86" cy="76" r="3.5" fill="rgba(60,50,40,0.3)" />
        {/* Main reflection */}
        <circle cx="83.5" cy="74" r="2.2" fill="rgba(255,255,255,0.85)" />
        {/* Secondary reflection */}
        <circle cx="88" cy="78" r="1" fill="rgba(255,255,255,0.4)" />

        {/* Right eye */}
        <ellipse cx="114" cy="77" rx="7.5" ry="7" fill="rgba(100,80,60,0.06)" />
        <circle cx="114" cy="76" r="5.5" fill="#1E1E1E" />
        <circle cx="114" cy="76" r="4.5" fill="#2D2D2D" />
        <circle cx="114" cy="76" r="3.5" fill="rgba(60,50,40,0.3)" />
        <circle cx="111.5" cy="74" r="2.2" fill="rgba(255,255,255,0.85)" />
        <circle cx="116" cy="78" r="1" fill="rgba(255,255,255,0.4)" />

        {/* ── Nose (3D with volume) ── */}
        <ellipse cx="100" cy="88" rx="6" ry="4.5" fill="url(#nose-a)" />
        {/* Nose specular */}
        <ellipse cx="98" cy="86.5" rx="3" ry="2" fill="rgba(255,255,255,0.35)" />
        {/* Nostrils */}
        <ellipse cx="98" cy="89" rx="1.2" ry="0.8" fill="rgba(140,115,170,0.3)" />
        <ellipse cx="102" cy="89" rx="1.2" ry="0.8" fill="rgba(140,115,170,0.3)" />

        {/* Mouth */}
        <path d="M 96,92 Q 100,96 104,92" fill="none" stroke="#C0A080" strokeWidth="0.9" strokeLinecap="round" opacity="0.3" />

        {/* Whisker dots */}
        <circle cx="78" cy="88" r="1" fill="#C0A080" opacity="0.2" />
        <circle cx="75" cy="91" r="0.8" fill="#C0A080" opacity="0.15" />
        <circle cx="122" cy="88" r="1" fill="#C0A080" opacity="0.2" />
        <circle cx="125" cy="91" r="0.8" fill="#C0A080" opacity="0.15" />
      </svg>

      {/* ══════════════════════════════════════════════
          POSE B — Curled up, sleeping
         ══════════════════════════════════════════════ */}
      <svg viewBox="0 0 200 200" width={size} height={size}
        className={`absolute inset-0 ferret-curled ${phase}`}
        aria-label="PWellTrack ferret mascot">
        {sharedDefs('b')}

        {/* Ground shadow */}
        <ellipse cx="100" cy="165" rx="58" ry="10" fill="url(#gshadow-b)" />

        {/* ── Tail wrapping ── */}
        <g className="ferret-tail-b">
          <path d="M 55,145 Q 38,154 32,140 Q 28,126 44,120 Q 60,114 75,128"
            fill="none" stroke="#E0C8A8" strokeWidth="15" strokeLinecap="round" />
          <path d="M 55,145 Q 38,154 32,140 Q 28,126 44,120 Q 60,114 75,128"
            fill="none" stroke="url(#rim-b)" strokeWidth="15" strokeLinecap="round" />
          {/* Tail tip lavender */}
          <circle cx="34" cy="138" r="9" fill="url(#lav-b)" opacity="0.5" />
          <circle cx="32" cy="135" r="3.5" fill="rgba(255,255,255,0.2)" />
        </g>

        {/* ── Body curled ── */}
        <ellipse cx="100" cy="128" rx="52" ry="38" fill="url(#fur-b)" />
        <ellipse cx="100" cy="128" rx="52" ry="38" fill="url(#depth-b)" />
        <ellipse cx="100" cy="128" rx="52" ry="38" fill="url(#rim-b)" />
        {/* Belly */}
        <ellipse cx="96" cy="122" rx="34" ry="24" fill="url(#belly-b)" opacity="0.55" />
        {/* Specular */}
        <ellipse cx="88" cy="108" rx="28" ry="18" fill="url(#spec-b)" />
        {/* AO at base */}
        <ellipse cx="100" cy="160" rx="40" ry="8" fill="url(#ao-b)" />

        {/* ── Back paw ── */}
        <ellipse cx="135" cy="152" rx="10" ry="7" fill="url(#fur-b)" />
        <ellipse cx="135" cy="152" rx="10" ry="7" fill="url(#rim-b)" />
        <ellipse cx="133" cy="150" rx="5" ry="3" fill="rgba(255,255,255,0.15)" />
        <ellipse cx="137" cy="154" rx="4.5" ry="3" fill="url(#lav-b)" opacity="0.1" />

        {/* ── Front paws tucked ── */}
        <ellipse cx="78" cy="133" rx="11" ry="9" fill="url(#fur-b)" />
        <ellipse cx="78" cy="133" rx="11" ry="9" fill="url(#rim-b)" />
        <ellipse cx="76" cy="131" rx="5" ry="3.5" fill="rgba(255,255,255,0.15)" />
        <ellipse cx="90" cy="135" rx="11" ry="9" fill="url(#fur-b)" />
        <ellipse cx="90" cy="135" rx="11" ry="9" fill="url(#rim-b)" />
        <ellipse cx="88" cy="133" rx="5" ry="3.5" fill="rgba(255,255,255,0.15)" />

        {/* ── Head resting ── */}
        <g className="ferret-head-b">
          <ellipse cx="84" cy="100" rx="36" ry="32" fill="url(#fur-b)" />
          <ellipse cx="84" cy="100" rx="36" ry="32" fill="url(#rim-b)" />
          {/* Head specular */}
          <ellipse cx="76" cy="84" rx="20" ry="16" fill="url(#spec-b)" />
          {/* Neck AO */}
          <ellipse cx="90" cy="126" rx="18" ry="6" fill="url(#ao-b)" />

          {/* Face mask */}
          <path d="M 54,96 Q 66,86 84,85 Q 102,86 112,96 Q 106,106 84,107 Q 62,106 54,96 Z"
            fill="url(#lav-b)" opacity="0.18" />

          {/* Forehead lighter */}
          <ellipse cx="84" cy="84" rx="16" ry="10" fill="#FFF8F0" opacity="0.35" />
          <ellipse cx="80" cy="80" rx="10" ry="6" fill="rgba(255,255,255,0.2)" />

          {/* ── Ears ── */}
          <ellipse cx="58" cy="74" rx="12" ry="15" fill="url(#fur-b)" transform="rotate(-15 58 74)" />
          <ellipse cx="58" cy="74" rx="12" ry="15" fill="url(#rim-b)" transform="rotate(-15 58 74)" />
          <ellipse cx="58" cy="76" rx="7" ry="9.5" fill="url(#earglow-b)" transform="rotate(-15 58 76)" opacity="0.5" />
          <ellipse cx="56" cy="72" rx="4" ry="5" fill="rgba(255,255,255,0.12)" transform="rotate(-15 56 72)" />

          <ellipse cx="108" cy="74" rx="12" ry="15" fill="url(#fur-b)" transform="rotate(15 108 74)" />
          <ellipse cx="108" cy="74" rx="12" ry="15" fill="url(#rim-b)" transform="rotate(15 108 74)" />
          <ellipse cx="108" cy="76" rx="7" ry="9.5" fill="url(#earglow-b)" transform="rotate(15 108 76)" opacity="0.5" />
          <ellipse cx="106" cy="72" rx="4" ry="5" fill="rgba(255,255,255,0.12)" transform="rotate(15 106 72)" />

          {/* Cheeks */}
          <ellipse cx="64" cy="104" rx="8" ry="5" fill="#F5CAB8" opacity="0.15" />
          <ellipse cx="104" cy="104" rx="8" ry="5" fill="#F5CAB8" opacity="0.15" />

          {/* ── Closed eyes (curved lines with lash detail) ── */}
          <g className="ferret-eyes-b">
            {/* Eye socket shadows */}
            <ellipse cx="74" cy="96" rx="7" ry="5" fill="rgba(100,80,60,0.05)" />
            <ellipse cx="94" cy="96" rx="7" ry="5" fill="rgba(100,80,60,0.05)" />
            {/* Closed eye curves */}
            <path d="M 68,96 Q 74,100 80,96" fill="none" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round" />
            <path d="M 88,96 Q 94,100 100,96" fill="none" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round" />
            {/* Tiny eyelash accents */}
            <path d="M 68,96 Q 66,94 65,92" fill="none" stroke="#3D3D3D" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
            <path d="M 100,96 Q 102,94 103,92" fill="none" stroke="#3D3D3D" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          </g>

          {/* ── Nose ── */}
          <ellipse cx="84" cy="110" rx="6" ry="4.5" fill="url(#nose-b)" />
          <ellipse cx="82" cy="108.5" rx="3" ry="2" fill="rgba(255,255,255,0.3)" />
          <ellipse cx="82.5" cy="111" rx="1.2" ry="0.8" fill="rgba(140,115,170,0.25)" />
          <ellipse cx="85.5" cy="111" rx="1.2" ry="0.8" fill="rgba(140,115,170,0.25)" />

          {/* Mouth */}
          <path d="M 81,114 Q 84,117 87,114" fill="none" stroke="#C0A080" strokeWidth="0.9" strokeLinecap="round" opacity="0.25" />

          {/* Whisker dots */}
          <circle cx="69" cy="108" r="1" fill="#C0A080" opacity="0.18" />
          <circle cx="66" cy="111" r="0.8" fill="#C0A080" opacity="0.12" />
          <circle cx="99" cy="108" r="1" fill="#C0A080" opacity="0.18" />
          <circle cx="102" cy="111" r="0.8" fill="#C0A080" opacity="0.12" />

          {/* ── Zzz bubble ── */}
          <g className="zzz-bubble" opacity="0">
            <text x="118" y="72" fontSize="12" fill="#C4B3E0" fontFamily="system-ui" fontWeight="700" opacity="0.7">z</text>
            <text x="128" y="61" fontSize="10" fill="#D5CEF0" fontFamily="system-ui" fontWeight="700" opacity="0.6">z</text>
            <text x="136" y="52" fontSize="8" fill="#E0DAF4" fontFamily="system-ui" fontWeight="700" opacity="0.5">z</text>
          </g>
        </g>
      </svg>

      <style jsx>{`
        .ferret-sitting {
          transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
        }
        .ferret-curled {
          transition: opacity 0.8s ease-in-out, transform 0.6s ease-in-out;
        }

        /* SITTING: show A, hide B */
        .ferret-sitting.sitting {
          opacity: 1;
          transform: scale(1);
        }
        .ferret-curled.sitting {
          opacity: 0;
          transform: scale(0.88) rotate(10deg);
        }

        /* TURNING: cross-fade with rotation */
        .ferret-sitting.turning {
          opacity: 0;
          transform: scale(0.85) rotate(-18deg);
          transition: opacity 0.7s ease-in, transform 0.7s ease-in;
        }
        .ferret-curled.turning {
          opacity: 1;
          transform: scale(1.02) rotate(0deg);
          transition: opacity 0.6s 0.25s ease-out, transform 0.6s 0.25s ease-out;
        }

        /* SLEEPING: only B, breathing */
        .ferret-sitting.sleeping {
          opacity: 0;
          transform: scale(0.8) rotate(-18deg);
          pointer-events: none;
        }
        .ferret-curled.sleeping {
          opacity: 1;
          transform: scale(1);
          animation: breathe 3.5s ease-in-out infinite;
        }

        .ferret-curled.sleeping .zzz-bubble {
          animation: zzzAppear 1s 0.6s ease-out forwards, zzzFloat 3s 1.6s ease-in-out infinite;
        }

        .ferret-curled.sleeping .ferret-tail-b {
          animation: tailTwitch 5s ease-in-out 2.5s infinite;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.012) translateY(-1.5px); }
        }

        @keyframes tailTwitch {
          0%, 88%, 100% { transform: translate(0, 0) rotate(0deg); }
          92% { transform: translate(2px, -1px) rotate(1.5deg); }
          96% { transform: translate(-1px, 0.5px) rotate(-0.8deg); }
        }

        @keyframes zzzAppear {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 0.65; transform: translateY(0); }
        }

        @keyframes zzzFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
