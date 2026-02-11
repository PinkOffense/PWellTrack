'use client';

export default function FarmScene() {
  return (
    <div className="relative w-full overflow-hidden h-48 sm:h-56 mt-4">
      {/* Background hills */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ height: '100%' }}>
        {/* Far hills */}
        <path d="M0,120 Q150,60 300,100 Q450,140 600,90 Q750,50 900,100 Q950,120 1000,110 L1000,200 L0,200Z" fill="#bbf7d0" />
        {/* Mid hills */}
        <path d="M0,140 Q120,100 250,130 Q400,160 550,120 Q700,80 850,130 Q950,155 1000,140 L1000,200 L0,200Z" fill="#86efac" />
        {/* Near hill */}
        <path d="M0,160 Q200,135 400,155 Q600,175 800,150 Q900,140 1000,158 L1000,200 L0,200Z" fill="#4ade80" />
        {/* Ground */}
        <rect x="0" y="175" width="1000" height="25" fill="#22c55e" />

        {/* Flowers on far hill */}
        {[180, 350, 520, 680, 820].map((x, i) => (
          <g key={`flower-far-${i}`} transform={`translate(${x}, ${105 + (i % 3) * 8})`}>
            <circle cx="0" cy="0" r="3" fill={['#fda4af', '#c4b5fd', '#fde68a', '#93c5fd', '#fda4af'][i]} />
            <circle cx="0" cy="0" r="1.2" fill="#fef08a" />
            <line x1="0" y1="3" x2="0" y2="12" stroke="#16a34a" strokeWidth="1.5" />
          </g>
        ))}

        {/* Flowers on near ground */}
        {[60, 150, 280, 420, 560, 700, 850, 940].map((x, i) => (
          <g key={`flower-${i}`} transform={`translate(${x}, ${160 + (i % 3) * 4})`}>
            {[0, 72, 144, 216, 288].map(angle => (
              <ellipse
                key={angle}
                cx={4 * Math.cos(angle * Math.PI / 180)}
                cy={4 * Math.sin(angle * Math.PI / 180)}
                rx="2.5" ry="3.5"
                fill={['#f9a8d4', '#c4b5fd', '#fde68a', '#fca5a5', '#a5b4fc', '#86efac', '#f9a8d4', '#fde68a'][i]}
                transform={`rotate(${angle} ${4 * Math.cos(angle * Math.PI / 180)} ${4 * Math.sin(angle * Math.PI / 180)})`}
              />
            ))}
            <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
            <line x1="0" y1="5" x2="0" y2="18" stroke="#16a34a" strokeWidth="1.5" />
            <path d={`M0,12 Q${i % 2 ? 6 : -6},10 ${i % 2 ? 8 : -8},13`} stroke="#16a34a" strokeWidth="1" fill="none" />
          </g>
        ))}

        {/* Trees */}
        <g transform="translate(80, 85)">
          <rect x="-4" y="15" width="8" height="20" rx="3" fill="#92400e" />
          <ellipse cx="0" cy="8" rx="20" ry="22" fill="#16a34a" opacity="0.7" />
          <ellipse cx="-6" cy="2" rx="14" ry="16" fill="#22c55e" opacity="0.8" />
          <ellipse cx="8" cy="5" rx="12" ry="14" fill="#15803d" opacity="0.5" />
        </g>
        <g transform="translate(920, 90)">
          <rect x="-3" y="12" width="6" height="18" rx="2" fill="#92400e" />
          <ellipse cx="0" cy="6" rx="16" ry="18" fill="#16a34a" opacity="0.7" />
          <ellipse cx="5" cy="0" rx="12" ry="14" fill="#22c55e" opacity="0.8" />
        </g>

        {/* Barn in background */}
        <g transform="translate(750, 65)">
          <rect x="0" y="15" width="50" height="40" rx="2" fill="#dc2626" opacity="0.5" />
          <polygon points="0,15 25,-5 50,15" fill="#991b1b" opacity="0.5" />
          <rect x="18" y="30" width="14" height="25" rx="1" fill="#7f1d1d" opacity="0.4" />
          <rect x="8" y="22" width="8" height="8" rx="1" fill="#fef08a" opacity="0.3" />
          <rect x="34" y="22" width="8" height="8" rx="1" fill="#fef08a" opacity="0.3" />
        </g>
      </svg>

      {/* Clouds */}
      <svg className="cloud cloud-1" width="90" height="40" viewBox="0 0 90 40">
        <ellipse cx="45" cy="28" rx="40" ry="10" fill="white" opacity="0.8" />
        <ellipse cx="30" cy="22" rx="22" ry="14" fill="white" opacity="0.9" />
        <ellipse cx="55" cy="20" rx="24" ry="15" fill="white" opacity="0.9" />
        <ellipse cx="42" cy="16" rx="18" ry="12" fill="white" opacity="0.95" />
      </svg>
      <svg className="cloud cloud-2" width="70" height="32" viewBox="0 0 70 32">
        <ellipse cx="35" cy="22" rx="30" ry="8" fill="white" opacity="0.6" />
        <ellipse cx="25" cy="18" rx="18" ry="11" fill="white" opacity="0.7" />
        <ellipse cx="45" cy="16" rx="16" ry="12" fill="white" opacity="0.7" />
      </svg>
      <svg className="cloud cloud-3" width="60" height="28" viewBox="0 0 60 28">
        <ellipse cx="30" cy="20" rx="26" ry="7" fill="white" opacity="0.5" />
        <ellipse cx="22" cy="15" rx="15" ry="10" fill="white" opacity="0.6" />
        <ellipse cx="38" cy="14" rx="14" ry="9" fill="white" opacity="0.6" />
      </svg>

      {/* Sun with warm glow */}
      <div className="absolute top-1 right-6 sm:right-12 sun-glow">
        <svg width="50" height="50" viewBox="0 0 50 50">
          <defs>
            <radialGradient id="sunGlow">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="25" cy="25" r="24" fill="url(#sunGlow)" />
          <circle cx="25" cy="25" r="12" fill="#fbbf24" />
          <circle cx="25" cy="25" r="10" fill="#fcd34d" />
          {/* Rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
            <line
              key={angle}
              x1={25 + 14 * Math.cos(angle * Math.PI / 180)}
              y1={25 + 14 * Math.sin(angle * Math.PI / 180)}
              x2={25 + 20 * Math.cos(angle * Math.PI / 180)}
              y2={25 + 20 * Math.sin(angle * Math.PI / 180)}
              stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
              className="sun-ray"
            />
          ))}
        </svg>
      </div>

      {/* Butterflies */}
      <svg className="butterfly butterfly-1" width="16" height="14" viewBox="0 0 16 14">
        <g className="butterfly-wings">
          <ellipse cx="4" cy="5" rx="4" ry="5" fill="#c084fc" opacity="0.8" />
          <ellipse cx="12" cy="5" rx="4" ry="5" fill="#c084fc" opacity="0.8" />
          <ellipse cx="4" cy="4" rx="2.5" ry="3" fill="#e9d5ff" opacity="0.6" />
          <ellipse cx="12" cy="4" rx="2.5" ry="3" fill="#e9d5ff" opacity="0.6" />
        </g>
        <line x1="8" y1="0" x2="8" y2="12" stroke="#7c3aed" strokeWidth="0.8" />
        <circle cx="8" cy="1" r="1" fill="#7c3aed" />
      </svg>
      <svg className="butterfly butterfly-2" width="14" height="12" viewBox="0 0 14 12">
        <g className="butterfly-wings-2">
          <ellipse cx="3.5" cy="4.5" rx="3.5" ry="4.5" fill="#fb923c" opacity="0.7" />
          <ellipse cx="10.5" cy="4.5" rx="3.5" ry="4.5" fill="#fb923c" opacity="0.7" />
          <ellipse cx="3.5" cy="3.5" rx="2" ry="2.5" fill="#fed7aa" opacity="0.5" />
          <ellipse cx="10.5" cy="3.5" rx="2" ry="2.5" fill="#fed7aa" opacity="0.5" />
        </g>
        <line x1="7" y1="0" x2="7" y2="10" stroke="#c2410c" strokeWidth="0.7" />
        <circle cx="7" cy="1" r="0.8" fill="#c2410c" />
      </svg>

      {/* ===== ANIMALS PARADE ===== */}
      <div className="animals-parade">

        {/* === DOG (Golden Retriever) === */}
        <svg className="animal-walk" width="70" height="60" viewBox="0 0 70 60">
          {/* Shadow */}
          <ellipse cx="35" cy="56" rx="22" ry="3" fill="#000" opacity="0.08" />
          {/* Tail */}
          <path className="tail-wag" d="M8,28 Q2,18 6,10 Q8,6 10,4" stroke="#c2813d" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="32" cy="34" rx="20" ry="13" fill="#d4943e" />
          <ellipse cx="32" cy="32" rx="17" ry="10" fill="#dba456" />
          {/* Belly */}
          <ellipse cx="34" cy="38" rx="12" ry="6" fill="#f0d48a" opacity="0.6" />
          {/* Back legs */}
          <g className="legs-back">
            <rect x="14" y="43" width="5" height="12" rx="2.5" fill="#c2813d" />
            <rect x="22" y="43" width="5" height="12" rx="2.5" fill="#b5763a" />
            <ellipse cx="16.5" cy="55" rx="3.5" ry="2" fill="#a06830" />
            <ellipse cx="24.5" cy="55" rx="3.5" ry="2" fill="#a06830" />
          </g>
          {/* Front legs */}
          <g className="legs-front">
            <rect x="38" y="43" width="5" height="12" rx="2.5" fill="#c2813d" />
            <rect x="46" y="43" width="5" height="12" rx="2.5" fill="#b5763a" />
            <ellipse cx="40.5" cy="55" rx="3.5" ry="2" fill="#a06830" />
            <ellipse cx="48.5" cy="55" rx="3.5" ry="2" fill="#a06830" />
          </g>
          {/* Collar */}
          <ellipse cx="44" cy="30" rx="8" ry="3" fill="#ef4444" transform="rotate(-10 44 30)" />
          <circle cx="48" cy="32" r="2" fill="#fbbf24" />
          {/* Head */}
          <circle cx="52" cy="22" r="11" fill="#dba456" />
          {/* Cheek */}
          <circle cx="56" cy="26" r="3" fill="#f0c674" opacity="0.5" />
          {/* Ears */}
          <ellipse cx="44" cy="14" rx="6" ry="8" fill="#c2813d" transform="rotate(-15 44 14)" />
          <ellipse cx="44" cy="15" rx="4" ry="5" fill="#b07030" transform="rotate(-15 44 15)" opacity="0.4" />
          <ellipse cx="59" cy="16" rx="5" ry="7" fill="#c2813d" transform="rotate(20 59 16)" />
          {/* Eyes - happy squint */}
          <path d="M48,19 Q50,17 52,19" stroke="#3d2c1a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M54,18 Q56,16 58,18" stroke="#3d2c1a" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Eye sparkle */}
          <circle cx="50" cy="18" r="0.8" fill="white" opacity="0.8" />
          <circle cx="56" cy="17" r="0.8" fill="white" opacity="0.8" />
          {/* Nose */}
          <ellipse cx="60" cy="22" rx="3" ry="2.5" fill="#3d2c1a" />
          <ellipse cx="60" cy="21.5" rx="1.5" ry="1" fill="#5a4535" opacity="0.5" />
          {/* Mouth & tongue */}
          <path d="M57,25 Q59,27 61,25" stroke="#3d2c1a" strokeWidth="1" fill="none" />
          <ellipse cx="59" cy="27" rx="2.5" ry="3.5" fill="#f87171" />
          <ellipse cx="59" cy="26.5" rx="1.5" ry="2" fill="#fca5a5" opacity="0.5" />
        </svg>

        {/* === CAT === */}
        <svg className="animal-walk-2" width="58" height="56" viewBox="0 0 58 56">
          <ellipse cx="29" cy="52" rx="18" ry="3" fill="#000" opacity="0.08" />
          {/* Tail - curvy S shape */}
          <path className="tail-sway" d="M6,30 Q-2,20 4,12 Q10,4 8,0" stroke="#a78bfa" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="28" cy="34" rx="16" ry="12" fill="#a78bfa" />
          <ellipse cx="28" cy="32" rx="13" ry="9" fill="#b89cfc" />
          {/* Stripes */}
          <path d="M22,26 L20,33" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
          <path d="M27,25 L26,32" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
          <path d="M32,26 L33,33" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
          {/* Belly */}
          <ellipse cx="29" cy="38" rx="8" ry="5" fill="#ddd6fe" opacity="0.5" />
          {/* Legs */}
          <rect x="16" y="42" width="4.5" height="10" rx="2.2" fill="#9370db" />
          <rect x="22" y="42" width="4.5" height="10" rx="2.2" fill="#8b65d0" />
          <rect x="32" y="42" width="4.5" height="10" rx="2.2" fill="#9370db" />
          <rect x="38" y="42" width="4.5" height="10" rx="2.2" fill="#8b65d0" />
          {/* Paws */}
          <ellipse cx="18.2" cy="52" rx="3.2" ry="2" fill="#ddd6fe" />
          <ellipse cx="24.2" cy="52" rx="3.2" ry="2" fill="#ddd6fe" />
          <ellipse cx="34.2" cy="52" rx="3.2" ry="2" fill="#ddd6fe" />
          <ellipse cx="40.2" cy="52" rx="3.2" ry="2" fill="#ddd6fe" />
          {/* Head */}
          <circle cx="44" cy="22" r="10" fill="#b89cfc" />
          {/* Ears - triangular */}
          <polygon points="36,8 33,18 40,16" fill="#a78bfa" />
          <polygon points="50,6 54,16 47,15" fill="#a78bfa" />
          <polygon points="37,10 34,17 40,16" fill="#ddd6fe" opacity="0.5" />
          <polygon points="50,8 53,15 48,15" fill="#ddd6fe" opacity="0.5" />
          {/* Eyes - big cute */}
          <ellipse cx="40" cy="21" rx="3" ry="3.5" fill="white" />
          <ellipse cx="49" cy="21" rx="3" ry="3.5" fill="white" />
          <ellipse cx="41" cy="21.5" rx="2" ry="2.5" fill="#22c55e" />
          <ellipse cx="49.5" cy="21.5" rx="2" ry="2.5" fill="#22c55e" />
          <circle cx="41.5" cy="21" r="1.2" fill="#1a1a2e" />
          <circle cx="50" cy="21" r="1.2" fill="#1a1a2e" />
          <circle cx="42" cy="20" r="0.6" fill="white" />
          <circle cx="50.5" cy="20" r="0.6" fill="white" />
          {/* Nose */}
          <path d="M44,25 L43,26.5 L45,26.5 Z" fill="#f9a8d4" />
          {/* Mouth */}
          <path d="M44,26.5 L44,28" stroke="#c084fc" strokeWidth="0.8" />
          <path d="M42,28 Q44,30 46,28" stroke="#c084fc" strokeWidth="0.8" fill="none" />
          {/* Whiskers */}
          <line x1="34" y1="24" x2="39" y2="25" stroke="#d8b4fe" strokeWidth="0.7" />
          <line x1="33" y1="26" x2="39" y2="26.5" stroke="#d8b4fe" strokeWidth="0.7" />
          <line x1="34" y1="28" x2="39" y2="27.5" stroke="#d8b4fe" strokeWidth="0.7" />
          <line x1="49" y1="25" x2="54" y2="24" stroke="#d8b4fe" strokeWidth="0.7" />
          <line x1="49" y1="26.5" x2="55" y2="26" stroke="#d8b4fe" strokeWidth="0.7" />
          <line x1="49" y1="27.5" x2="54" y2="28" stroke="#d8b4fe" strokeWidth="0.7" />
          {/* Rosy cheeks */}
          <circle cx="37" cy="26" r="2.5" fill="#f9a8d4" opacity="0.3" />
          <circle cx="52" cy="26" r="2.5" fill="#f9a8d4" opacity="0.3" />
        </svg>

        {/* === FERRET === */}
        <svg className="animal-walk-3" width="76" height="50" viewBox="0 0 76 50">
          <ellipse cx="38" cy="46" rx="28" ry="3" fill="#000" opacity="0.08" />
          {/* Tail - fluffy */}
          <path className="tail-sway" d="M4,30 Q-2,22 2,14 Q6,8 4,2" stroke="#e8a834" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M4,30 Q-2,22 2,14 Q6,8 4,2" stroke="#fcd34d" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Body - long and low */}
          <ellipse cx="36" cy="32" rx="26" ry="10" fill="#e8a834" />
          <ellipse cx="36" cy="30" rx="22" ry="7" fill="#f0bc4c" />
          {/* Belly stripe */}
          <ellipse cx="36" cy="35" rx="18" ry="5" fill="#fde68a" opacity="0.6" />
          {/* Legs - stubby */}
          <rect x="16" y="38" width="4" height="8" rx="2" fill="#c98a20" />
          <rect x="23" y="38" width="4" height="8" rx="2" fill="#b87d1c" />
          <rect x="44" y="38" width="4" height="8" rx="2" fill="#c98a20" />
          <rect x="51" y="38" width="4" height="8" rx="2" fill="#b87d1c" />
          <ellipse cx="18" cy="46" rx="3" ry="1.5" fill="#a06e18" />
          <ellipse cx="25" cy="46" rx="3" ry="1.5" fill="#a06e18" />
          <ellipse cx="46" cy="46" rx="3" ry="1.5" fill="#a06e18" />
          <ellipse cx="53" cy="46" rx="3" ry="1.5" fill="#a06e18" />
          {/* Head */}
          <ellipse cx="62" cy="24" rx="10" ry="9" fill="#f0bc4c" />
          {/* Mask markings */}
          <ellipse cx="58" cy="23" rx="4" ry="5" fill="#7c5030" opacity="0.35" />
          <ellipse cx="66" cy="23" rx="4" ry="5" fill="#7c5030" opacity="0.35" />
          {/* Ears - round */}
          <circle cx="56" cy="16" r="4" fill="#e8a834" />
          <circle cx="56" cy="16" r="2.5" fill="#fde68a" opacity="0.5" />
          <circle cx="68" cy="16" r="4" fill="#e8a834" />
          <circle cx="68" cy="16" r="2.5" fill="#fde68a" opacity="0.5" />
          {/* Eyes - bright and curious */}
          <circle cx="58" cy="22" r="2.5" fill="white" />
          <circle cx="66" cy="22" r="2.5" fill="white" />
          <circle cx="58.5" cy="22.5" r="1.5" fill="#1a1a2e" />
          <circle cx="66.5" cy="22.5" r="1.5" fill="#1a1a2e" />
          <circle cx="59" cy="21.5" r="0.6" fill="white" />
          <circle cx="67" cy="21.5" r="0.6" fill="white" />
          {/* Nose */}
          <ellipse cx="71" cy="25" rx="2.5" ry="2" fill="#3d2c1a" />
          <ellipse cx="71" cy="24.5" rx="1.2" ry="0.8" fill="#5a4535" opacity="0.4" />
          {/* Mouth - happy */}
          <path d="M68,27 Q70,29 72,27" stroke="#8b6040" strokeWidth="0.8" fill="none" />
          {/* Rosy cheeks */}
          <circle cx="56" cy="26" r="2" fill="#fda4af" opacity="0.3" />
          <circle cx="68" cy="26" r="2" fill="#fda4af" opacity="0.3" />
          {/* Forehead light patch */}
          <ellipse cx="62" cy="18" rx="3" ry="2" fill="#fde68a" opacity="0.5" />
        </svg>

        {/* === PIG === */}
        <svg className="animal-walk-4" width="62" height="54" viewBox="0 0 62 54">
          <ellipse cx="31" cy="50" rx="20" ry="3" fill="#000" opacity="0.08" />
          {/* Curly tail */}
          <path d="M6,28 Q2,22 5,16 Q8,10 5,6 Q3,2 5,0" stroke="#fda4af" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Body - round */}
          <ellipse cx="30" cy="32" rx="19" ry="14" fill="#fda4af" />
          <ellipse cx="30" cy="30" rx="16" ry="11" fill="#fbb9c4" />
          {/* Belly spot */}
          <ellipse cx="30" cy="36" rx="10" ry="6" fill="#fcd5dc" opacity="0.6" />
          {/* Legs - chubby */}
          <rect x="16" y="42" width="5" height="9" rx="2.5" fill="#f9899c" />
          <rect x="23" y="42" width="5" height="9" rx="2.5" fill="#f47f94" />
          <rect x="34" y="42" width="5" height="9" rx="2.5" fill="#f9899c" />
          <rect x="41" y="42" width="5" height="9" rx="2.5" fill="#f47f94" />
          {/* Hooves */}
          <ellipse cx="18.5" cy="51" rx="3.5" ry="2" fill="#e06078" />
          <ellipse cx="25.5" cy="51" rx="3.5" ry="2" fill="#e06078" />
          <ellipse cx="36.5" cy="51" rx="3.5" ry="2" fill="#e06078" />
          <ellipse cx="43.5" cy="51" rx="3.5" ry="2" fill="#e06078" />
          {/* Head */}
          <circle cx="48" cy="22" r="11" fill="#fbb9c4" />
          {/* Ears - floppy */}
          <ellipse cx="41" cy="12" rx="5" ry="6" fill="#f9899c" transform="rotate(-20 41 12)" />
          <ellipse cx="41" cy="13" rx="3" ry="4" fill="#fda4af" transform="rotate(-20 41 13)" opacity="0.5" />
          <ellipse cx="53" cy="11" rx="5" ry="6" fill="#f9899c" transform="rotate(15 53 11)" />
          <ellipse cx="53" cy="12" rx="3" ry="4" fill="#fda4af" transform="rotate(15 53 12)" opacity="0.5" />
          {/* Eyes - cute round */}
          <circle cx="44" cy="20" r="2.5" fill="white" />
          <circle cx="52" cy="20" r="2.5" fill="white" />
          <circle cx="44.5" cy="20.5" r="1.5" fill="#1a1a2e" />
          <circle cx="52.5" cy="20.5" r="1.5" fill="#1a1a2e" />
          <circle cx="45" cy="19.5" r="0.6" fill="white" />
          <circle cx="53" cy="19.5" r="0.6" fill="white" />
          {/* Snout */}
          <ellipse cx="56" cy="24" rx="5.5" ry="4" fill="#f9899c" />
          <ellipse cx="56" cy="24" rx="4" ry="3" fill="#f47f94" />
          <circle cx="54.5" cy="24" r="1.2" fill="#e06078" />
          <circle cx="57.5" cy="24" r="1.2" fill="#e06078" />
          {/* Mouth */}
          <path d="M52,28 Q54,30 56,28" stroke="#e06078" strokeWidth="0.8" fill="none" />
          {/* Rosy cheeks */}
          <circle cx="41" cy="25" r="3" fill="#f9a8d4" opacity="0.35" />
          <circle cx="55" cy="28" r="2.5" fill="#f9a8d4" opacity="0.35" />
        </svg>

        {/* === GOAT === */}
        <svg className="animal-walk-5" width="64" height="58" viewBox="0 0 64 58">
          <ellipse cx="32" cy="54" rx="20" ry="3" fill="#000" opacity="0.08" />
          {/* Tail - short */}
          <path className="tail-wag" d="M8,28 Q4,22 7,18" stroke="#d1d5db" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="30" cy="32" rx="18" ry="13" fill="#e5e7eb" />
          <ellipse cx="30" cy="30" rx="15" ry="10" fill="#f0f0f2" />
          {/* Belly */}
          <ellipse cx="30" cy="36" rx="10" ry="5" fill="white" opacity="0.5" />
          {/* Legs - slender */}
          <rect x="16" y="42" width="4" height="12" rx="2" fill="#c4c8ce" />
          <rect x="22" y="42" width="4" height="12" rx="2" fill="#b8bcc2" />
          <rect x="34" y="42" width="4" height="12" rx="2" fill="#c4c8ce" />
          <rect x="40" y="42" width="4" height="12" rx="2" fill="#b8bcc2" />
          {/* Hooves */}
          <ellipse cx="18" cy="54" rx="3" ry="1.8" fill="#6b7280" />
          <ellipse cx="24" cy="54" rx="3" ry="1.8" fill="#6b7280" />
          <ellipse cx="36" cy="54" rx="3" ry="1.8" fill="#6b7280" />
          <ellipse cx="42" cy="54" rx="3" ry="1.8" fill="#6b7280" />
          {/* Bell */}
          <ellipse cx="42" cy="35" rx="3" ry="2" fill="#fbbf24" />
          <circle cx="42" cy="36.5" r="1" fill="#d97706" />
          {/* Head */}
          <ellipse cx="48" cy="20" rx="10" ry="9" fill="#f3f4f6" />
          {/* Horns - curved */}
          <path d="M42,12 Q38,2 42,-2" stroke="#d4a574" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M52,10 Q56,0 52,-3" stroke="#d4a574" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M42,12 Q38,2 42,-2" stroke="#e8c49a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M52,10 Q56,0 52,-3" stroke="#e8c49a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Ears - horizontal */}
          <ellipse cx="38" cy="18" rx="6" ry="2.5" fill="#e5e7eb" transform="rotate(-15 38 18)" />
          <ellipse cx="38" cy="18" rx="4" ry="1.5" fill="#fda4af" transform="rotate(-15 38 18)" opacity="0.3" />
          <ellipse cx="58" cy="17" rx="6" ry="2.5" fill="#e5e7eb" transform="rotate(15 58 17)" />
          {/* Eyes - rectangular pupil like real goats */}
          <ellipse cx="44" cy="19" rx="2.5" ry="3" fill="#fef3c7" />
          <rect x="43" y="18" width="2" height="2.5" rx="0.3" fill="#1a1a2e" />
          <ellipse cx="52" cy="19" rx="2.5" ry="3" fill="#fef3c7" />
          <rect x="51" y="18" width="2" height="2.5" rx="0.3" fill="#1a1a2e" />
          {/* Nose */}
          <ellipse cx="55" cy="23" rx="2" ry="1.5" fill="#d1d5db" />
          <circle cx="54.2" cy="23" r="0.7" fill="#9ca3af" />
          <circle cx="55.8" cy="23" r="0.7" fill="#9ca3af" />
          {/* Beard */}
          <path d="M48,28 Q48,34 46,37" stroke="#d1d5db" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M49,29 Q50,35 48,38" stroke="#d1d5db" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Mouth - content smile */}
          <path d="M50,25 Q52,27 54,25" stroke="#9ca3af" strokeWidth="0.8" fill="none" />
          {/* Rosy cheeks */}
          <circle cx="42" cy="23" r="2" fill="#fda4af" opacity="0.2" />
          <circle cx="55" cy="23" r="2" fill="#fda4af" opacity="0.2" />
        </svg>
      </div>

      <style jsx>{`
        .cloud {
          position: absolute;
        }
        .cloud-1 {
          top: 0;
          animation: cloudFloat 25s linear infinite;
        }
        .cloud-2 {
          top: 15px;
          animation: cloudFloat 35s linear infinite;
          animation-delay: -12s;
        }
        .cloud-3 {
          top: 8px;
          animation: cloudFloat 30s linear infinite;
          animation-delay: -20s;
        }
        @keyframes cloudFloat {
          0% { left: -120px; }
          100% { left: calc(100% + 20px); }
        }

        .sun-glow {
          animation: sunPulse 4s ease-in-out infinite;
        }
        @keyframes sunPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        :global(.sun-ray) {
          animation: rayRotate 8s linear infinite;
          transform-origin: 25px 25px;
        }
        @keyframes rayRotate {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }

        .butterfly {
          position: absolute;
        }
        .butterfly-1 {
          top: 30px;
          animation: butterflyPath1 12s ease-in-out infinite;
        }
        .butterfly-2 {
          top: 50px;
          animation: butterflyPath2 15s ease-in-out infinite;
          animation-delay: -5s;
        }
        @keyframes butterflyPath1 {
          0% { left: 10%; top: 35px; }
          25% { left: 30%; top: 15px; }
          50% { left: 50%; top: 40px; }
          75% { left: 70%; top: 10px; }
          100% { left: 90%; top: 30px; }
        }
        @keyframes butterflyPath2 {
          0% { left: 80%; top: 50px; }
          25% { left: 60%; top: 20px; }
          50% { left: 40%; top: 45px; }
          75% { left: 20%; top: 15px; }
          100% { left: 5%; top: 40px; }
        }
        :global(.butterfly-wings) {
          animation: wingFlap 0.3s ease-in-out infinite alternate;
          transform-origin: 8px 7px;
        }
        :global(.butterfly-wings-2) {
          animation: wingFlap 0.25s ease-in-out infinite alternate;
          transform-origin: 7px 6px;
        }
        @keyframes wingFlap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.4); }
        }

        .animals-parade {
          position: absolute;
          bottom: 10px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: parade 22s linear infinite;
        }
        @keyframes parade {
          0% { transform: translateX(-380px); }
          100% { transform: translateX(calc(100vw + 60px)); }
        }

        /* Gentle walking bob - each animal slightly different rhythm */
        .animal-walk { animation: walkBob 0.7s ease-in-out infinite; }
        .animal-walk-2 { animation: walkBob 0.65s ease-in-out infinite; animation-delay: -0.2s; }
        .animal-walk-3 { animation: walkBob 0.6s ease-in-out infinite; animation-delay: -0.35s; }
        .animal-walk-4 { animation: walkBob 0.68s ease-in-out infinite; animation-delay: -0.1s; }
        .animal-walk-5 { animation: walkBob 0.63s ease-in-out infinite; animation-delay: -0.45s; }

        @keyframes walkBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-0.5deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-3px) rotate(0.5deg); }
        }

        :global(.tail-wag) {
          animation: tailWag 0.35s ease-in-out infinite alternate;
          transform-origin: 80% 90%;
        }
        @keyframes tailWag {
          0% { transform: rotate(-12deg); }
          100% { transform: rotate(12deg); }
        }

        :global(.tail-sway) {
          animation: tailSway 1s ease-in-out infinite alternate;
          transform-origin: 80% 90%;
        }
        @keyframes tailSway {
          0% { transform: rotate(-6deg); }
          100% { transform: rotate(6deg); }
        }

        :global(.legs-back) {
          animation: legWalkBack 0.35s ease-in-out infinite alternate;
          transform-origin: 50% 42px;
        }
        :global(.legs-front) {
          animation: legWalkFront 0.35s ease-in-out infinite alternate;
          transform-origin: 50% 42px;
        }
        @keyframes legWalkBack {
          0% { transform: rotate(-3deg); }
          100% { transform: rotate(3deg); }
        }
        @keyframes legWalkFront {
          0% { transform: rotate(3deg); }
          100% { transform: rotate(-3deg); }
        }
      `}</style>
    </div>
  );
}
