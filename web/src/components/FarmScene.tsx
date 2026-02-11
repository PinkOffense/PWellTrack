'use client';

export default function FarmScene() {
  return (
    <div className="relative w-full overflow-hidden h-44 sm:h-52">
      {/* Background landscape */}
      <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice">
        {/* Sky gradient via rect */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#dcfce7" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1200" height="220" fill="url(#skyGrad)" />

        {/* Sun */}
        <circle cx="1080" cy="35" r="50" fill="url(#sunGlow)" />
        <circle cx="1080" cy="35" r="18" fill="#fcd34d" />
        <circle cx="1080" cy="35" r="15" fill="#fde68a" />

        {/* Far mountains/hills */}
        <path d="M0,130 Q80,85 180,110 Q280,135 380,95 Q480,60 580,100 Q680,130 780,90 Q880,55 980,95 Q1080,125 1200,100 L1200,220 L0,220Z" fill="#d1fae5" opacity="0.7" />

        {/* Barn */}
        <g transform="translate(900, 72)">
          <rect x="0" y="18" width="55" height="42" rx="1" fill="#b91c1c" opacity="0.55" />
          <polygon points="-3,18 27.5,-4 58,18" fill="#7f1d1d" opacity="0.5" />
          <rect x="20" y="34" width="15" height="26" rx="1" fill="#450a0a" opacity="0.4" />
          <line x1="27.5" y1="34" x2="27.5" y2="60" stroke="#7f1d1d" strokeWidth="1" opacity="0.3" />
          <rect x="6" y="26" width="10" height="8" rx="1" fill="#fef9c3" opacity="0.3" />
          <rect x="39" y="26" width="10" height="8" rx="1" fill="#fef9c3" opacity="0.3" />
          <line x1="11" y1="26" x2="11" y2="34" stroke="#7f1d1d" strokeWidth="0.5" opacity="0.3" />
          <line x1="6" y1="30" x2="16" y2="30" stroke="#7f1d1d" strokeWidth="0.5" opacity="0.3" />
        </g>

        {/* Trees */}
        <g transform="translate(100, 80)">
          <rect x="-3" y="22" width="6" height="24" rx="2" fill="#713f12" opacity="0.6" />
          <ellipse cx="0" cy="12" rx="22" ry="24" fill="#166534" opacity="0.5" />
          <ellipse cx="-5" cy="6" rx="15" ry="18" fill="#15803d" opacity="0.55" />
          <ellipse cx="7" cy="8" rx="13" ry="16" fill="#14532d" opacity="0.35" />
        </g>
        <g transform="translate(1100, 82)">
          <rect x="-2.5" y="18" width="5" height="20" rx="2" fill="#713f12" opacity="0.6" />
          <ellipse cx="0" cy="10" rx="18" ry="20" fill="#166534" opacity="0.5" />
          <ellipse cx="5" cy="4" rx="12" ry="14" fill="#15803d" opacity="0.5" />
        </g>
        <g transform="translate(550, 76)">
          <rect x="-2" y="16" width="4" height="16" rx="1.5" fill="#713f12" opacity="0.5" />
          <ellipse cx="0" cy="8" rx="14" ry="16" fill="#166534" opacity="0.4" />
          <ellipse cx="-4" cy="4" rx="10" ry="12" fill="#15803d" opacity="0.4" />
        </g>

        {/* Mid hills */}
        <path d="M0,150 Q100,125 220,142 Q360,162 480,135 Q620,108 760,140 Q900,162 1050,130 Q1130,118 1200,138 L1200,220 L0,220Z" fill="#86efac" opacity="0.8" />

        {/* Fence on mid hill */}
        {[140, 220, 300, 380, 460, 540, 620, 700, 780, 860, 940, 1020].map(x => (
          <g key={`fence-${x}`} opacity="0.2">
            <rect x={x} y="140" width="3" height="20" rx="1" fill="#78350f" />
          </g>
        ))}
        <rect x="140" y="145" width="883" height="2" rx="0.5" fill="#78350f" opacity="0.15" />
        <rect x="140" y="153" width="883" height="2" rx="0.5" fill="#78350f" opacity="0.15" />

        {/* Near hill */}
        <path d="M0,170 Q150,155 300,165 Q500,180 700,160 Q900,145 1050,165 Q1150,172 1200,168 L1200,220 L0,220Z" fill="#4ade80" />

        {/* Ground */}
        <rect x="0" y="188" width="1200" height="32" fill="#22c55e" />

        {/* Flowers - small detailed */}
        {[80, 200, 340, 480, 620, 760, 900, 1050].map((x, i) => (
          <g key={`f-${i}`} transform={`translate(${x}, ${172 + (i % 3) * 5})`}>
            {[0, 72, 144, 216, 288].map(a => (
              <ellipse key={a}
                cx={3.5 * Math.cos(a * Math.PI / 180)} cy={3.5 * Math.sin(a * Math.PI / 180)}
                rx="2" ry="3" fill={['#fda4af','#c4b5fd','#fde68a','#fca5a5','#a5b4fc','#fbcfe8','#bfdbfe','#fde68a'][i]}
                transform={`rotate(${a} ${3.5 * Math.cos(a * Math.PI / 180)} ${3.5 * Math.sin(a * Math.PI / 180)})`}
                opacity="0.8"
              />
            ))}
            <circle cx="0" cy="0" r="2" fill="#fef08a" />
            <line x1="0" y1="4" x2="0" y2="14" stroke="#15803d" strokeWidth="1.2" opacity="0.6" />
          </g>
        ))}

        {/* Tiny background flowers */}
        {[160, 290, 430, 570, 720, 850, 990].map((x, i) => (
          <g key={`sf-${i}`} transform={`translate(${x}, ${138 + (i % 4) * 6})`} opacity="0.5">
            <circle cx="0" cy="0" r="2.5" fill={['#fda4af','#c4b5fd','#93c5fd','#fde68a','#fbcfe8','#a5b4fc','#fda4af'][i]} />
            <circle cx="0" cy="0" r="1" fill="#fef9c3" />
            <line x1="0" y1="2.5" x2="0" y2="8" stroke="#16a34a" strokeWidth="0.8" />
          </g>
        ))}

        {/* Grass tufts on ground */}
        {[30, 110, 195, 280, 370, 460, 550, 640, 730, 820, 910, 1000, 1090, 1170].map((x, i) => (
          <g key={`grass-${i}`} opacity={0.35 + (i % 3) * 0.15}>
            <path d={`M${x},192 Q${x - 2},${184 - (i % 3) * 3} ${x + (i % 2 ? 3 : -3)},${178 + (i % 4) * 2}`} stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d={`M${x + 4},192 Q${x + 5},${186 - (i % 2) * 4} ${x + (i % 2 ? 8 : 1)},${180 + (i % 3) * 2}`} stroke="#15803d" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        ))}
      </svg>

      {/* Clouds - soft and fluffy */}
      <svg className="cloud cloud-1" width="100" height="44" viewBox="0 0 100 44">
        <ellipse cx="50" cy="30" rx="45" ry="12" fill="white" opacity="0.7" />
        <ellipse cx="35" cy="22" rx="22" ry="16" fill="white" opacity="0.85" />
        <ellipse cx="60" cy="20" rx="26" ry="17" fill="white" opacity="0.85" />
        <ellipse cx="48" cy="15" rx="20" ry="14" fill="white" opacity="0.9" />
      </svg>
      <svg className="cloud cloud-2" width="75" height="34" viewBox="0 0 75 34">
        <ellipse cx="38" cy="24" rx="32" ry="9" fill="white" opacity="0.5" />
        <ellipse cx="26" cy="18" rx="18" ry="12" fill="white" opacity="0.6" />
        <ellipse cx="48" cy="16" rx="20" ry="13" fill="white" opacity="0.65" />
      </svg>
      <svg className="cloud cloud-3" width="65" height="30" viewBox="0 0 65 30">
        <ellipse cx="32" cy="22" rx="28" ry="7" fill="white" opacity="0.45" />
        <ellipse cx="24" cy="16" rx="16" ry="11" fill="white" opacity="0.55" />
        <ellipse cx="42" cy="15" rx="15" ry="10" fill="white" opacity="0.5" />
      </svg>

      {/* Butterflies */}
      <svg className="butterfly bf-1" width="18" height="16" viewBox="0 0 18 16">
        <g className="bf-wings">
          <ellipse cx="5" cy="6" rx="4.5" ry="5.5" fill="#c084fc" opacity="0.7" />
          <ellipse cx="13" cy="6" rx="4.5" ry="5.5" fill="#c084fc" opacity="0.7" />
          <ellipse cx="5" cy="5" rx="2.5" ry="3" fill="#e9d5ff" opacity="0.5" />
          <ellipse cx="13" cy="5" rx="2.5" ry="3" fill="#e9d5ff" opacity="0.5" />
          <circle cx="5" cy="6" r="1" fill="#a855f7" opacity="0.4" />
          <circle cx="13" cy="6" r="1" fill="#a855f7" opacity="0.4" />
        </g>
        <line x1="9" y1="1" x2="9" y2="14" stroke="#7c3aed" strokeWidth="0.8" />
        <line x1="9" y1="1" x2="7" y2="0" stroke="#7c3aed" strokeWidth="0.5" />
        <line x1="9" y1="1" x2="11" y2="0" stroke="#7c3aed" strokeWidth="0.5" />
      </svg>
      <svg className="butterfly bf-2" width="14" height="12" viewBox="0 0 14 12">
        <g className="bf-wings-2">
          <ellipse cx="3.5" cy="5" rx="3.5" ry="4.5" fill="#fb923c" opacity="0.6" />
          <ellipse cx="10.5" cy="5" rx="3.5" ry="4.5" fill="#fb923c" opacity="0.6" />
          <ellipse cx="3.5" cy="4" rx="2" ry="2.5" fill="#fed7aa" opacity="0.4" />
          <ellipse cx="10.5" cy="4" rx="2" ry="2.5" fill="#fed7aa" opacity="0.4" />
        </g>
        <line x1="7" y1="1" x2="7" y2="11" stroke="#c2410c" strokeWidth="0.6" />
      </svg>

      {/* ===== ANIMALS - gentle stroll ===== */}
      <div className="animals-stroll">
        {/* DOG - Golden Retriever */}
        <svg className="animal a1" width="72" height="62" viewBox="0 0 72 62">
          <ellipse cx="36" cy="58" rx="24" ry="3" fill="#000" opacity="0.06" />
          {/* Tail */}
          <path className="wag" d="M7,28 Q1,18 5,10 Q7,5 10,3" stroke="#c2813d" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path className="wag" d="M8,27 Q3,19 6,12 Q8,7 10,5" stroke="#dba456" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="33" cy="35" rx="21" ry="14" fill="#c2813d" />
          <ellipse cx="33" cy="33" rx="18" ry="11" fill="#dba456" />
          <ellipse cx="35" cy="39" rx="13" ry="7" fill="#f0d48a" opacity="0.5" />
          {/* Legs */}
          <rect x="15" y="45" width="5.5" height="12" rx="2.8" fill="#b5763a" />
          <rect x="22" y="45" width="5.5" height="12" rx="2.8" fill="#a06830" />
          <rect x="39" y="45" width="5.5" height="12" rx="2.8" fill="#b5763a" />
          <rect x="46" y="45" width="5.5" height="12" rx="2.8" fill="#a06830" />
          <ellipse cx="17.8" cy="57" rx="4" ry="2.2" fill="#92580e" />
          <ellipse cx="24.8" cy="57" rx="4" ry="2.2" fill="#92580e" />
          <ellipse cx="41.8" cy="57" rx="4" ry="2.2" fill="#92580e" />
          <ellipse cx="48.8" cy="57" rx="4" ry="2.2" fill="#92580e" />
          {/* Collar */}
          <path d="M42,31 Q48,28 53,30" stroke="#dc2626" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="32" r="2.5" fill="#fbbf24" />
          <circle cx="50" cy="32" r="1.2" fill="#f59e0b" />
          {/* Head */}
          <circle cx="54" cy="22" r="12" fill="#dba456" />
          <circle cx="54" cy="24" r="8" fill="#e8b960" opacity="0.4" />
          {/* Ears */}
          <ellipse cx="44" cy="14" rx="6.5" ry="9" fill="#b5763a" transform="rotate(-12 44 14)" />
          <ellipse cx="44" cy="15" rx="4.5" ry="6" fill="#a06830" transform="rotate(-12 44 15)" opacity="0.3" />
          <ellipse cx="62" cy="16" rx="5.5" ry="8" fill="#b5763a" transform="rotate(18 62 16)" />
          <ellipse cx="62" cy="17" rx="3.5" ry="5" fill="#a06830" transform="rotate(18 62 17)" opacity="0.3" />
          {/* Eyes - happy closed */}
          <path d="M49,20 Q51,17.5 53,20" stroke="#3d2218" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M56,19 Q58,16.5 60,19" stroke="#3d2218" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Eyebrows */}
          <path d="M48.5,17.5 Q50.5,16 52.5,17" stroke="#92580e" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M56.5,16.5 Q58.5,15 60,16.5" stroke="#92580e" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
          {/* Nose */}
          <ellipse cx="62" cy="22.5" rx="3.5" ry="2.8" fill="#2d1810" />
          <ellipse cx="62" cy="22" rx="2" ry="1.2" fill="#4a3020" opacity="0.5" />
          {/* Mouth */}
          <path d="M59,26 Q61,28 63,26" stroke="#3d2218" strokeWidth="1" fill="none" />
          <path d="M61,26.5 L61,28" stroke="#3d2218" strokeWidth="0.8" />
          {/* Tongue */}
          <ellipse cx="61" cy="29.5" rx="3" ry="4" fill="#f87171" />
          <ellipse cx="61" cy="29" rx="2" ry="2.5" fill="#fca5a5" opacity="0.5" />
          <line x1="61" y1="27" x2="61" y2="32" stroke="#ef4444" strokeWidth="0.5" opacity="0.3" />
          {/* Cheek blush */}
          <circle cx="47" cy="24" r="3" fill="#fda4af" opacity="0.15" />
          <circle cx="64" cy="24" r="2.5" fill="#fda4af" opacity="0.15" />
        </svg>

        {/* CAT - Purple */}
        <svg className="animal a2" width="60" height="58" viewBox="0 0 60 58">
          <ellipse cx="30" cy="54" rx="20" ry="3" fill="#000" opacity="0.06" />
          {/* Tail - elegant S */}
          <path className="sway" d="M5,32 Q-3,22 3,13 Q9,4 7,0" stroke="#9370db" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M6,31 Q-1,22 4,14 Q9,6 7,2" stroke="#b89cfc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="28" cy="36" rx="17" ry="13" fill="#9370db" />
          <ellipse cx="28" cy="34" rx="14" ry="10" fill="#a78bfa" />
          {/* Stripes */}
          <path d="M21,27 Q20,33 21,38" stroke="#7c3aed" strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
          <path d="M26,26 Q25.5,32 26,37" stroke="#7c3aed" strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
          <path d="M31,27 Q31.5,33 31,38" stroke="#7c3aed" strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
          {/* Belly */}
          <ellipse cx="29" cy="40" rx="9" ry="5" fill="#ddd6fe" opacity="0.4" />
          {/* Legs */}
          <rect x="16" y="45" width="5" height="10" rx="2.5" fill="#8b65d0" />
          <rect x="22" y="45" width="5" height="10" rx="2.5" fill="#7c5cb8" />
          <rect x="32" y="45" width="5" height="10" rx="2.5" fill="#8b65d0" />
          <rect x="38" y="45" width="5" height="10" rx="2.5" fill="#7c5cb8" />
          {/* Paws */}
          <ellipse cx="18.5" cy="55" rx="3.5" ry="2" fill="#e0d5f7" />
          <ellipse cx="24.5" cy="55" rx="3.5" ry="2" fill="#e0d5f7" />
          <ellipse cx="34.5" cy="55" rx="3.5" ry="2" fill="#e0d5f7" />
          <ellipse cx="40.5" cy="55" rx="3.5" ry="2" fill="#e0d5f7" />
          {/* Toe beans */}
          {[18.5, 24.5, 34.5, 40.5].map(px => (
            <g key={px}>
              <circle cx={px - 1} cy={55} r="0.7" fill="#c4b5fd" opacity="0.5" />
              <circle cx={px + 1} cy={55} r="0.7" fill="#c4b5fd" opacity="0.5" />
            </g>
          ))}
          {/* Head */}
          <circle cx="44" cy="24" r="11" fill="#a78bfa" />
          {/* Ears */}
          <polygon points="36,9 32,20 40,18" fill="#9370db" />
          <polygon points="50,7 55,18 47,17" fill="#9370db" />
          <polygon points="37,11 33.5,19 40,18" fill="#ddd6fe" opacity="0.4" />
          <polygon points="50,9 54,17 48,17" fill="#ddd6fe" opacity="0.4" />
          {/* Eyes */}
          <ellipse cx="40" cy="23" rx="3.2" ry="3.8" fill="white" />
          <ellipse cx="49" cy="23" rx="3.2" ry="3.8" fill="white" />
          <ellipse cx="40.8" cy="23.5" rx="2.2" ry="2.8" fill="#22c55e" />
          <ellipse cx="49.5" cy="23.5" rx="2.2" ry="2.8" fill="#22c55e" />
          <ellipse cx="40.8" cy="23.5" rx="1.5" ry="2.5" fill="#15803d" opacity="0.4" />
          <ellipse cx="49.5" cy="23.5" rx="1.5" ry="2.5" fill="#15803d" opacity="0.4" />
          <circle cx="41.2" cy="23" r="1.3" fill="#111" />
          <circle cx="49.8" cy="23" r="1.3" fill="#111" />
          <circle cx="41.6" cy="22" r="0.7" fill="white" />
          <circle cx="50.2" cy="22" r="0.7" fill="white" />
          <circle cx="40.5" cy="24" r="0.4" fill="white" opacity="0.6" />
          <circle cx="49.2" cy="24" r="0.4" fill="white" opacity="0.6" />
          {/* Nose */}
          <path d="M44.5,27.5 L43.5,29 L45.5,29 Z" fill="#f9a8d4" />
          {/* Mouth */}
          <path d="M44.5,29 L44.5,30.5" stroke="#c084fc" strokeWidth="0.8" />
          <path d="M42.5,30.5 Q44.5,32.5 46.5,30.5" stroke="#c084fc" strokeWidth="0.8" fill="none" />
          {/* Whiskers */}
          <line x1="33" y1="26.5" x2="39" y2="27.5" stroke="#d8b4fe" strokeWidth="0.6" />
          <line x1="32.5" y1="28.5" x2="39" y2="29" stroke="#d8b4fe" strokeWidth="0.6" />
          <line x1="33" y1="30.5" x2="39" y2="30" stroke="#d8b4fe" strokeWidth="0.6" />
          <line x1="50" y1="27.5" x2="56" y2="26.5" stroke="#d8b4fe" strokeWidth="0.6" />
          <line x1="50" y1="29" x2="56.5" y2="28.5" stroke="#d8b4fe" strokeWidth="0.6" />
          <line x1="50" y1="30" x2="56" y2="30.5" stroke="#d8b4fe" strokeWidth="0.6" />
          {/* Cheeks */}
          <circle cx="37.5" cy="28.5" r="2.8" fill="#f9a8d4" opacity="0.2" />
          <circle cx="52" cy="28.5" r="2.8" fill="#f9a8d4" opacity="0.2" />
        </svg>

        {/* FERRET */}
        <svg className="animal a3" width="78" height="52" viewBox="0 0 78 52">
          <ellipse cx="39" cy="48" rx="30" ry="3" fill="#000" opacity="0.06" />
          {/* Tail */}
          <path className="sway" d="M3,30 Q-3,22 1,14 Q5,6 3,1" stroke="#c98a20" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <path d="M4,29 Q-1,22 2,15 Q5,8 4,3" stroke="#e8a834" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M4.5,28 Q0,22 3,16" stroke="#fde68a" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
          {/* Body */}
          <ellipse cx="37" cy="33" rx="27" ry="11" fill="#d4943e" />
          <ellipse cx="37" cy="31" rx="23" ry="8" fill="#e8a834" />
          <ellipse cx="37" cy="36" rx="19" ry="5.5" fill="#fde68a" opacity="0.5" />
          {/* Legs */}
          <rect x="17" y="40" width="4.5" height="8" rx="2.2" fill="#b5763a" />
          <rect x="24" y="40" width="4.5" height="8" rx="2.2" fill="#a06830" />
          <rect x="46" y="40" width="4.5" height="8" rx="2.2" fill="#b5763a" />
          <rect x="53" y="40" width="4.5" height="8" rx="2.2" fill="#a06830" />
          <ellipse cx="19.2" cy="48" rx="3.2" ry="1.8" fill="#92580e" />
          <ellipse cx="26.2" cy="48" rx="3.2" ry="1.8" fill="#92580e" />
          <ellipse cx="48.2" cy="48" rx="3.2" ry="1.8" fill="#92580e" />
          <ellipse cx="55.2" cy="48" rx="3.2" ry="1.8" fill="#92580e" />
          {/* Head */}
          <ellipse cx="64" cy="25" rx="11" ry="10" fill="#e8a834" />
          {/* Mask */}
          <ellipse cx="60" cy="24" rx="4.5" ry="5.5" fill="#6b4423" opacity="0.3" />
          <ellipse cx="68" cy="24" rx="4.5" ry="5.5" fill="#6b4423" opacity="0.3" />
          <ellipse cx="64" cy="19" rx="3.5" ry="2.5" fill="#fde68a" opacity="0.5" />
          {/* Ears */}
          <circle cx="57" cy="16" r="4.5" fill="#d4943e" />
          <circle cx="57" cy="16" r="2.8" fill="#fde68a" opacity="0.4" />
          <circle cx="71" cy="16" r="4.5" fill="#d4943e" />
          <circle cx="71" cy="16" r="2.8" fill="#fde68a" opacity="0.4" />
          {/* Eyes */}
          <circle cx="60" cy="23" r="2.8" fill="white" />
          <circle cx="68" cy="23" r="2.8" fill="white" />
          <circle cx="60.5" cy="23.5" r="1.8" fill="#1a1a2e" />
          <circle cx="68.5" cy="23.5" r="1.8" fill="#1a1a2e" />
          <circle cx="61" cy="22.5" r="0.7" fill="white" />
          <circle cx="69" cy="22.5" r="0.7" fill="white" />
          {/* Nose */}
          <ellipse cx="73" cy="26" rx="2.8" ry="2.2" fill="#2d1810" />
          <ellipse cx="73" cy="25.5" rx="1.4" ry="1" fill="#4a3020" opacity="0.4" />
          {/* Mouth */}
          <path d="M70,28.5 Q72,30.5 74,28.5" stroke="#8b6040" strokeWidth="0.8" fill="none" />
          {/* Cheeks */}
          <circle cx="58" cy="27" r="2.2" fill="#fda4af" opacity="0.2" />
          <circle cx="70" cy="27" r="2.2" fill="#fda4af" opacity="0.2" />
        </svg>

        {/* PIG */}
        <svg className="animal a4" width="64" height="56" viewBox="0 0 64 56">
          <ellipse cx="32" cy="52" rx="22" ry="3" fill="#000" opacity="0.06" />
          {/* Curly tail */}
          <path d="M5,28 Q1,22 4,16 Q7,10 4,6 Q2,2 4,0" stroke="#f9a8d4" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M6,27 Q2.5,22 5,17 Q7.5,12 5,8" stroke="#fbb9c4" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          {/* Body */}
          <ellipse cx="30" cy="33" rx="20" ry="15" fill="#fda4af" />
          <ellipse cx="30" cy="31" rx="17" ry="12" fill="#fbb9c4" />
          <ellipse cx="30" cy="37" rx="11" ry="7" fill="#fce4ec" opacity="0.5" />
          {/* Legs */}
          <rect x="16" y="44" width="5.5" height="9" rx="2.8" fill="#f4819a" />
          <rect x="23" y="44" width="5.5" height="9" rx="2.8" fill="#e86f88" />
          <rect x="35" y="44" width="5.5" height="9" rx="2.8" fill="#f4819a" />
          <rect x="42" y="44" width="5.5" height="9" rx="2.8" fill="#e86f88" />
          {/* Hooves */}
          <ellipse cx="18.8" cy="53" rx="3.8" ry="2" fill="#d4546c" />
          <ellipse cx="25.8" cy="53" rx="3.8" ry="2" fill="#d4546c" />
          <ellipse cx="37.8" cy="53" rx="3.8" ry="2" fill="#d4546c" />
          <ellipse cx="44.8" cy="53" rx="3.8" ry="2" fill="#d4546c" />
          {/* Hoof split */}
          {[18.8, 25.8, 37.8, 44.8].map(hx => (
            <line key={hx} x1={hx} y1="51.5" x2={hx} y2="54" stroke="#c14060" strokeWidth="0.6" opacity="0.4" />
          ))}
          {/* Head */}
          <circle cx="49" cy="22" r="12" fill="#fbb9c4" />
          <circle cx="49" cy="24" r="8" fill="#fcc5d2" opacity="0.3" />
          {/* Ears */}
          <ellipse cx="41" cy="12" rx="5.5" ry="7" fill="#f4819a" transform="rotate(-18 41 12)" />
          <ellipse cx="41" cy="13" rx="3.5" ry="4.5" fill="#fda4af" transform="rotate(-18 41 13)" opacity="0.5" />
          <ellipse cx="55" cy="11" rx="5.5" ry="7" fill="#f4819a" transform="rotate(15 55 11)" />
          <ellipse cx="55" cy="12" rx="3.5" ry="4.5" fill="#fda4af" transform="rotate(15 55 12)" opacity="0.5" />
          {/* Eyes */}
          <circle cx="45" cy="20" r="2.8" fill="white" />
          <circle cx="53" cy="20" r="2.8" fill="white" />
          <circle cx="45.5" cy="20.5" r="1.7" fill="#1a1a2e" />
          <circle cx="53.5" cy="20.5" r="1.7" fill="#1a1a2e" />
          <circle cx="46" cy="19.5" r="0.7" fill="white" />
          <circle cx="54" cy="19.5" r="0.7" fill="white" />
          {/* Eyelashes */}
          <path d="M43,18 Q44,17 45,17.5" stroke="#d4546c" strokeWidth="0.6" fill="none" opacity="0.4" />
          <path d="M55,17.5 Q56,17 57,18" stroke="#d4546c" strokeWidth="0.6" fill="none" opacity="0.4" />
          {/* Snout */}
          <ellipse cx="57" cy="24.5" rx="6" ry="4.5" fill="#f4819a" />
          <ellipse cx="57" cy="24.5" rx="4.5" ry="3.5" fill="#e86f88" />
          <ellipse cx="55" cy="24.5" rx="1.3" ry="1.8" fill="#c14060" />
          <ellipse cx="59" cy="24.5" rx="1.3" ry="1.8" fill="#c14060" />
          {/* Mouth */}
          <path d="M53,29 Q55,31 57,29" stroke="#d4546c" strokeWidth="0.8" fill="none" />
          {/* Cheeks */}
          <circle cx="42" cy="26" r="3.2" fill="#f9a8d4" opacity="0.25" />
          <circle cx="57" cy="29" r="2.5" fill="#f9a8d4" opacity="0.25" />
        </svg>

        {/* GOAT */}
        <svg className="animal a5" width="66" height="62" viewBox="0 0 66 62">
          <ellipse cx="33" cy="58" rx="22" ry="3" fill="#000" opacity="0.06" />
          {/* Tail */}
          <path className="wag" d="M7,30 Q3,24 6,19" stroke="#d1d5db" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="30" cy="34" rx="19" ry="14" fill="#d1d5db" />
          <ellipse cx="30" cy="32" rx="16" ry="11" fill="#e5e7eb" />
          <ellipse cx="30" cy="38" rx="11" ry="6" fill="#f3f4f6" opacity="0.5" />
          {/* Legs */}
          <rect x="16" y="44" width="4.5" height="13" rx="2.2" fill="#b8bcc2" />
          <rect x="22" y="44" width="4.5" height="13" rx="2.2" fill="#a8acb2" />
          <rect x="34" y="44" width="4.5" height="13" rx="2.2" fill="#b8bcc2" />
          <rect x="40" y="44" width="4.5" height="13" rx="2.2" fill="#a8acb2" />
          {/* Hooves */}
          <ellipse cx="18.2" cy="57.5" rx="3.2" ry="2" fill="#6b7280" />
          <ellipse cx="24.2" cy="57.5" rx="3.2" ry="2" fill="#6b7280" />
          <ellipse cx="36.2" cy="57.5" rx="3.2" ry="2" fill="#6b7280" />
          <ellipse cx="42.2" cy="57.5" rx="3.2" ry="2" fill="#6b7280" />
          {[18.2, 24.2, 36.2, 42.2].map(hx => (
            <line key={hx} x1={hx} y1="56" x2={hx} y2="59" stroke="#4b5563" strokeWidth="0.5" opacity="0.4" />
          ))}
          {/* Bell */}
          <ellipse cx="42" cy="38" rx="3.5" ry="2.5" fill="#fbbf24" />
          <ellipse cx="42" cy="37.5" rx="2.5" ry="1.5" fill="#fcd34d" opacity="0.5" />
          <circle cx="42" cy="39.5" r="1.2" fill="#b45309" />
          <path d="M39,36 Q42,34 45,36" stroke="#d97706" strokeWidth="0.8" fill="none" />
          {/* Head */}
          <ellipse cx="50" cy="22" rx="11" ry="10" fill="#f0f0f2" />
          {/* Horns */}
          <path d="M43,13 Q38,2 43,-3" stroke="#c9a06c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M55,11 Q60,-1 55,-4" stroke="#c9a06c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M43,13 Q38,2 43,-3" stroke="#dbb88a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M55,11 Q60,-1 55,-4" stroke="#dbb88a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Horn rings */}
          <path d="M41.5,8 Q42.5,7.5 43.5,8.5" stroke="#b8956a" strokeWidth="0.6" fill="none" opacity="0.4" />
          <path d="M40.5,5 Q42,4.5 43,5.5" stroke="#b8956a" strokeWidth="0.6" fill="none" opacity="0.4" />
          <path d="M56.5,7 Q55.5,6.5 54.5,7.5" stroke="#b8956a" strokeWidth="0.6" fill="none" opacity="0.4" />
          {/* Ears */}
          <ellipse cx="39" cy="20" rx="6.5" ry="2.8" fill="#e5e7eb" transform="rotate(-12 39 20)" />
          <ellipse cx="39" cy="20" rx="4.5" ry="1.8" fill="#fda4af" transform="rotate(-12 39 20)" opacity="0.2" />
          <ellipse cx="61" cy="19" rx="6.5" ry="2.8" fill="#e5e7eb" transform="rotate(12 61 19)" />
          {/* Eyes - rectangular pupil */}
          <ellipse cx="46" cy="21" rx="2.8" ry="3.2" fill="#fef3c7" />
          <ellipse cx="54" cy="21" rx="2.8" ry="3.2" fill="#fef3c7" />
          <rect x="45" y="20" width="2.2" height="2.8" rx="0.4" fill="#1a1a2e" />
          <rect x="53" y="20" width="2.2" height="2.8" rx="0.4" fill="#1a1a2e" />
          <circle cx="46.5" cy="20" r="0.5" fill="white" opacity="0.7" />
          <circle cx="54.5" cy="20" r="0.5" fill="white" opacity="0.7" />
          {/* Nose */}
          <ellipse cx="57" cy="25" rx="2.5" ry="1.8" fill="#d1d5db" />
          <circle cx="56" cy="25" r="0.8" fill="#9ca3af" />
          <circle cx="58" cy="25" r="0.8" fill="#9ca3af" />
          {/* Beard */}
          <path d="M49,30 Q49,37 47,41" stroke="#c4c8ce" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M50.5,31 Q51,38 49,42" stroke="#d1d5db" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M48,32 Q47.5,37 46,40" stroke="#d1d5db" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
          {/* Mouth */}
          <path d="M52,27 Q54,29 56,27" stroke="#9ca3af" strokeWidth="0.8" fill="none" />
          {/* Cheeks */}
          <circle cx="43" cy="25" r="2.2" fill="#fda4af" opacity="0.15" />
          <circle cx="57" cy="27" r="2" fill="#fda4af" opacity="0.15" />
        </svg>
      </div>

      <style jsx>{`
        .cloud { position: absolute; }
        .cloud-1 { top: 2px; animation: drift 30s linear infinite; }
        .cloud-2 { top: 18px; animation: drift 42s linear infinite; animation-delay: -15s; }
        .cloud-3 { top: 10px; animation: drift 36s linear infinite; animation-delay: -25s; }
        @keyframes drift {
          0% { left: -130px; }
          100% { left: calc(100% + 30px); }
        }

        .butterfly { position: absolute; }
        .bf-1 { animation: bfPath1 16s ease-in-out infinite; }
        .bf-2 { animation: bfPath2 19s ease-in-out infinite; animation-delay: -7s; }
        @keyframes bfPath1 {
          0%   { left: 15%; top: 30px; }
          25%  { left: 35%; top: 12px; }
          50%  { left: 55%; top: 35px; }
          75%  { left: 75%; top: 8px; }
          100% { left: 92%; top: 28px; }
        }
        @keyframes bfPath2 {
          0%   { left: 85%; top: 45px; }
          25%  { left: 65%; top: 18px; }
          50%  { left: 42%; top: 40px; }
          75%  { left: 22%; top: 12px; }
          100% { left: 8%;  top: 38px; }
        }
        :global(.bf-wings)   { animation: flap 0.25s ease-in-out infinite alternate; transform-origin: 9px 8px; }
        :global(.bf-wings-2) { animation: flap 0.22s ease-in-out infinite alternate; transform-origin: 7px 6px; }
        @keyframes flap { 0% { transform: scaleX(1); } 100% { transform: scaleX(0.35); } }

        .animals-stroll {
          position: absolute;
          bottom: 8px;
          display: flex;
          align-items: flex-end;
          gap: 6px;
          animation: stroll 28s linear infinite;
        }
        @keyframes stroll {
          0%   { transform: translateX(-420px); }
          100% { transform: translateX(calc(100vw + 80px)); }
        }

        .animal { display: block; }
        .a1 { animation: gentleWalk 0.9s ease-in-out infinite; }
        .a2 { animation: gentleWalk 0.85s ease-in-out infinite; animation-delay: -0.2s; }
        .a3 { animation: gentleWalk 0.8s ease-in-out infinite; animation-delay: -0.4s; }
        .a4 { animation: gentleWalk 0.88s ease-in-out infinite; animation-delay: -0.15s; }
        .a5 { animation: gentleWalk 0.82s ease-in-out infinite; animation-delay: -0.5s; }

        @keyframes gentleWalk {
          0%, 100% { transform: translateY(0); }
          25%  { transform: translateY(-2px) rotate(-0.3deg); }
          75%  { transform: translateY(-2px) rotate(0.3deg); }
        }

        :global(.wag) {
          animation: wag 0.4s ease-in-out infinite alternate;
          transform-origin: 85% 85%;
        }
        @keyframes wag { 0% { transform: rotate(-10deg); } 100% { transform: rotate(10deg); } }

        :global(.sway) {
          animation: sway 1.2s ease-in-out infinite alternate;
          transform-origin: 85% 85%;
        }
        @keyframes sway { 0% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }
      `}</style>
    </div>
  );
}
