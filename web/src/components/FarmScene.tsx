'use client';

export default function FarmScene() {
  return (
    <div className="relative w-full overflow-hidden h-36 sm:h-44 mt-6">
      {/* Sky with clouds */}
      <div className="absolute inset-0">
        <svg className="cloud cloud-1" viewBox="0 0 80 40" width="70" height="35">
          <ellipse cx="40" cy="25" rx="35" ry="12" fill="white" opacity="0.7"/>
          <ellipse cx="28" cy="20" rx="20" ry="12" fill="white" opacity="0.7"/>
          <ellipse cx="52" cy="18" rx="22" ry="13" fill="white" opacity="0.7"/>
        </svg>
        <svg className="cloud cloud-2" viewBox="0 0 80 40" width="55" height="28">
          <ellipse cx="40" cy="25" rx="35" ry="12" fill="white" opacity="0.5"/>
          <ellipse cx="28" cy="20" rx="20" ry="12" fill="white" opacity="0.5"/>
          <ellipse cx="52" cy="18" rx="22" ry="13" fill="white" opacity="0.5"/>
        </svg>
      </div>

      {/* Ground / grass */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 800 60" className="w-full" preserveAspectRatio="none">
          <path d="M0,20 Q100,0 200,15 Q300,30 400,10 Q500,0 600,20 Q700,35 800,15 L800,60 L0,60 Z" fill="#86efac"/>
          <path d="M0,30 Q100,20 200,28 Q300,40 400,25 Q500,15 600,32 Q700,40 800,28 L800,60 L0,60 Z" fill="#4ade80"/>
          <path d="M0,42 Q200,35 400,42 Q600,48 800,40 L800,60 L0,60 Z" fill="#22c55e"/>
        </svg>
      </div>

      {/* Fence */}
      <div className="absolute bottom-8 w-full">
        <svg viewBox="0 0 800 30" className="w-full opacity-30" preserveAspectRatio="none">
          {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720].map(x => (
            <g key={x}>
              <rect x={x + 5} y="2" width="4" height="28" rx="1" fill="#92400e"/>
            </g>
          ))}
          <rect x="0" y="8" width="800" height="3" rx="1" fill="#92400e"/>
          <rect x="0" y="20" width="800" height="3" rx="1" fill="#92400e"/>
        </svg>
      </div>

      {/* Sun */}
      <svg className="absolute top-2 right-8 sun-glow" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="12" fill="#fbbf24" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <line
            key={angle}
            x1="20" y1="20" x2={20 + 18 * Math.cos(angle * Math.PI / 180)} y2={20 + 18 * Math.sin(angle * Math.PI / 180)}
            stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.6"
          />
        ))}
      </svg>

      {/* Animals parade */}
      <div className="animals-parade absolute bottom-6 sm:bottom-8">
        {/* Dog */}
        <svg className="animal animal-bounce-1" width="48" height="40" viewBox="0 0 48 40" style={{ marginRight: '12px' }}>
          {/* Body */}
          <ellipse cx="24" cy="26" rx="14" ry="10" fill="#d97706"/>
          {/* Head */}
          <circle cx="36" cy="18" r="8" fill="#d97706"/>
          {/* Ear */}
          <ellipse cx="42" cy="13" rx="4" ry="6" fill="#92400e" transform="rotate(20 42 13)"/>
          {/* Eye */}
          <circle cx="38" cy="16" r="1.5" fill="#1e293b"/>
          {/* Nose */}
          <circle cx="43" cy="19" r="2" fill="#1e293b"/>
          {/* Tail */}
          <path d="M10,22 Q4,12 8,8" stroke="#d97706" strokeWidth="3" fill="none" strokeLinecap="round" className="tail-wag"/>
          {/* Legs */}
          <rect x="16" y="33" width="3" height="6" rx="1.5" fill="#92400e"/>
          <rect x="22" y="33" width="3" height="6" rx="1.5" fill="#92400e"/>
          <rect x="28" y="33" width="3" height="6" rx="1.5" fill="#92400e"/>
          {/* Tongue */}
          <ellipse cx="44" cy="22" rx="1.5" ry="2.5" fill="#f87171"/>
        </svg>

        {/* Cat */}
        <svg className="animal animal-bounce-2" width="42" height="38" viewBox="0 0 42 38" style={{ marginRight: '14px' }}>
          {/* Body */}
          <ellipse cx="21" cy="24" rx="12" ry="10" fill="#a78bfa"/>
          {/* Head */}
          <circle cx="33" cy="16" r="7" fill="#a78bfa"/>
          {/* Ears */}
          <polygon points="29,6 27,14 33,12" fill="#a78bfa"/>
          <polygon points="37,4 40,12 34,11" fill="#a78bfa"/>
          <polygon points="30,7 28,13 33,12" fill="#ddd6fe" opacity="0.5"/>
          <polygon points="37,5 39,11 35,11" fill="#ddd6fe" opacity="0.5"/>
          {/* Eyes */}
          <ellipse cx="31" cy="15" rx="1.5" ry="2" fill="#22c55e"/>
          <circle cx="31" cy="15" r="0.8" fill="#1e293b"/>
          <ellipse cx="36" cy="15" rx="1.5" ry="2" fill="#22c55e"/>
          <circle cx="36" cy="15" r="0.8" fill="#1e293b"/>
          {/* Nose */}
          <polygon points="33,18 32,19.5 34,19.5" fill="#f9a8d4"/>
          {/* Whiskers */}
          <line x1="26" y1="17" x2="30" y2="18" stroke="#c4b5fd" strokeWidth="0.5"/>
          <line x1="26" y1="19" x2="30" y2="19" stroke="#c4b5fd" strokeWidth="0.5"/>
          <line x1="37" y1="18" x2="41" y2="17" stroke="#c4b5fd" strokeWidth="0.5"/>
          <line x1="37" y1="19" x2="41" y2="19" stroke="#c4b5fd" strokeWidth="0.5"/>
          {/* Tail */}
          <path d="M9,20 Q2,14 6,6" stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round" className="tail-sway"/>
          {/* Legs */}
          <rect x="14" y="31" width="3" height="6" rx="1.5" fill="#8b5cf6"/>
          <rect x="19" y="31" width="3" height="6" rx="1.5" fill="#8b5cf6"/>
          <rect x="25" y="31" width="3" height="6" rx="1.5" fill="#8b5cf6"/>
        </svg>

        {/* Ferret */}
        <svg className="animal animal-bounce-3" width="56" height="32" viewBox="0 0 56 32" style={{ marginRight: '10px' }}>
          {/* Long body */}
          <ellipse cx="28" cy="20" rx="20" ry="7" fill="#fbbf24"/>
          <ellipse cx="28" cy="20" rx="16" ry="5" fill="#fde68a"/>
          {/* Head */}
          <circle cx="46" cy="16" r="6" fill="#fbbf24"/>
          {/* Mask */}
          <ellipse cx="46" cy="16" rx="4" ry="3" fill="#92400e" opacity="0.4"/>
          {/* Eyes */}
          <circle cx="44" cy="14" r="1.2" fill="#1e293b"/>
          <circle cx="48" cy="14" r="1.2" fill="#1e293b"/>
          {/* Nose */}
          <circle cx="50" cy="16" r="1.5" fill="#1e293b"/>
          {/* Ears */}
          <circle cx="43" cy="11" r="2.5" fill="#f59e0b"/>
          <circle cx="49" cy="11" r="2.5" fill="#f59e0b"/>
          {/* Tail */}
          <path d="M8,18 Q2,10 5,5" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" className="tail-sway"/>
          {/* Legs (short!) */}
          <rect x="18" y="25" width="2.5" height="5" rx="1.2" fill="#d97706"/>
          <rect x="23" y="25" width="2.5" height="5" rx="1.2" fill="#d97706"/>
          <rect x="33" y="25" width="2.5" height="5" rx="1.2" fill="#d97706"/>
          <rect x="38" y="25" width="2.5" height="5" rx="1.2" fill="#d97706"/>
        </svg>

        {/* Pig */}
        <svg className="animal animal-bounce-4" width="44" height="36" viewBox="0 0 44 36" style={{ marginRight: '12px' }}>
          {/* Body */}
          <ellipse cx="22" cy="22" rx="14" ry="11" fill="#fda4af"/>
          {/* Head */}
          <circle cx="34" cy="16" r="8" fill="#fda4af"/>
          {/* Snout */}
          <ellipse cx="40" cy="18" rx="4" ry="3" fill="#fb7185"/>
          <circle cx="39" cy="17.5" r="1" fill="#e11d48"/>
          <circle cx="41" cy="17.5" r="1" fill="#e11d48"/>
          {/* Eyes */}
          <circle cx="33" cy="13" r="1.5" fill="#1e293b"/>
          <circle cx="37" cy="13" r="1.5" fill="#1e293b"/>
          {/* Ears */}
          <ellipse cx="30" cy="9" rx="3.5" ry="4" fill="#fb7185" transform="rotate(-15 30 9)"/>
          <ellipse cx="36" cy="8" rx="3.5" ry="4" fill="#fb7185" transform="rotate(10 36 8)"/>
          {/* Curly tail */}
          <path d="M8,18 Q4,14 6,10 Q8,6 5,4" stroke="#fda4af" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Legs */}
          <rect x="14" y="30" width="3" height="5" rx="1.5" fill="#fb7185"/>
          <rect x="19" y="30" width="3" height="5" rx="1.5" fill="#fb7185"/>
          <rect x="25" y="30" width="3" height="5" rx="1.5" fill="#fb7185"/>
        </svg>

        {/* Goat */}
        <svg className="animal animal-bounce-5" width="46" height="40" viewBox="0 0 46 40" style={{ marginRight: '0' }}>
          {/* Body */}
          <ellipse cx="23" cy="24" rx="14" ry="10" fill="#e5e7eb"/>
          {/* Head */}
          <circle cx="36" cy="16" r="7" fill="#f3f4f6"/>
          {/* Horns */}
          <path d="M33,10 Q30,2 34,0" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M38,9 Q41,1 37,0" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Eyes */}
          <ellipse cx="34" cy="15" rx="1.5" ry="2" fill="#fbbf24"/>
          <rect cx="34" cy="15" x="33.5" y="14.2" width="1" height="1.6" fill="#1e293b"/>
          <ellipse cx="39" cy="15" rx="1.5" ry="2" fill="#fbbf24"/>
          <rect cx="39" cy="15" x="38.5" y="14.2" width="1" height="1.6" fill="#1e293b"/>
          {/* Beard */}
          <path d="M36,22 Q36,27 34,29" stroke="#d4d4d8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          {/* Ears */}
          <ellipse cx="30" cy="13" rx="4" ry="2" fill="#e5e7eb" transform="rotate(-20 30 13)"/>
          <ellipse cx="42" cy="13" rx="4" ry="2" fill="#e5e7eb" transform="rotate(20 42 13)"/>
          {/* Tail */}
          <path d="M9,20 Q6,15 8,12" stroke="#d4d4d8" strokeWidth="2" fill="none" strokeLinecap="round" className="tail-wag"/>
          {/* Legs */}
          <rect x="14" y="31" width="3" height="7" rx="1.5" fill="#9ca3af"/>
          <rect x="20" y="31" width="3" height="7" rx="1.5" fill="#9ca3af"/>
          <rect x="26" y="31" width="3" height="7" rx="1.5" fill="#9ca3af"/>
        </svg>
      </div>

      {/* Grass blades in front */}
      <div className="absolute bottom-0 w-full pointer-events-none">
        <svg viewBox="0 0 800 20" className="w-full" preserveAspectRatio="none">
          {[20,55,90,130,170,210,260,310,355,400,445,490,535,580,620,660,700,740,780].map((x, i) => (
            <path
              key={i}
              d={`M${x},20 Q${x - 3},${8 + (i % 3) * 3} ${x + (i % 2 ? 4 : -4)},${2 + (i % 4) * 2}`}
              stroke="#16a34a"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity={0.4 + (i % 3) * 0.2}
            />
          ))}
        </svg>
      </div>

      <style jsx>{`
        .cloud {
          position: absolute;
        }
        .cloud-1 {
          top: 5px;
          animation: cloudFloat 20s linear infinite;
        }
        .cloud-2 {
          top: 20px;
          animation: cloudFloat 28s linear infinite;
          animation-delay: -10s;
        }
        @keyframes cloudFloat {
          0% { left: -100px; }
          100% { left: 110%; }
        }

        .sun-glow {
          animation: sunPulse 3s ease-in-out infinite;
        }
        @keyframes sunPulse {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        .animals-parade {
          display: flex;
          align-items: flex-end;
          animation: parade 18s linear infinite;
        }
        @keyframes parade {
          0% { transform: translateX(-320px); }
          100% { transform: translateX(calc(100vw + 50px)); }
        }

        .animal-bounce-1 { animation: bounce 0.6s ease-in-out infinite alternate; }
        .animal-bounce-2 { animation: bounce 0.55s ease-in-out infinite alternate; animation-delay: -0.15s; }
        .animal-bounce-3 { animation: bounce 0.5s ease-in-out infinite alternate; animation-delay: -0.3s; }
        .animal-bounce-4 { animation: bounce 0.58s ease-in-out infinite alternate; animation-delay: -0.1s; }
        .animal-bounce-5 { animation: bounce 0.52s ease-in-out infinite alternate; animation-delay: -0.25s; }

        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-5px); }
        }

        :global(.tail-wag) {
          animation: tailWag 0.4s ease-in-out infinite alternate;
          transform-origin: bottom right;
        }
        @keyframes tailWag {
          0% { transform: rotate(-10deg); }
          100% { transform: rotate(10deg); }
        }

        :global(.tail-sway) {
          animation: tailSway 0.8s ease-in-out infinite alternate;
          transform-origin: bottom right;
        }
        @keyframes tailSway {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  );
}
