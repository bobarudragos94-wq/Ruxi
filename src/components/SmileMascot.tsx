/**
 * Friendly animated tooth mascot for the public booking hero.
 * Pure SVG + CSS keyframes (see globals.css): floats gently, blinks,
 * draws its smile in, with twinkling sparkles and a pulsing halo.
 */
export function SmileMascot() {
  return (
    <div className="relative w-40 h-40 md:w-52 md:h-52 mx-auto select-none" aria-hidden>
      {/* Pulsing gradient halo behind the tooth */}
      <div className="mascot-halo absolute inset-3 rounded-full bg-gradient-to-br from-[#0a84ff]/25 via-[#00c389]/15 to-[#6d4bf6]/20 blur-2xl" />

      <svg viewBox="0 0 120 120" className="relative w-full h-full">
        <defs>
          <linearGradient id="toothGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#eef4ff" />
            <stop offset="100%" stopColor="#d4e3ff" />
          </linearGradient>
        </defs>

        <g className="mascot-float">
          {/* Tooth body */}
          <path
            d="M60 16 C38 16 28 32 30 52 C32 74 40 102 49 102 C56 102 55 78 60 78 C65 78 64 102 71 102 C80 102 88 74 90 52 C92 32 82 16 60 16 Z"
            fill="url(#toothGrad)"
            style={{ filter: "drop-shadow(0 10px 18px rgba(0, 93, 172, 0.28))" }}
          />
          {/* Shine */}
          <ellipse cx="44" cy="32" rx="7" ry="11" fill="#ffffff" opacity="0.85" transform="rotate(-24 44 32)" />

          {/* Eyes (blink) */}
          <circle className="mascot-eye" cx="47" cy="48" r="3.6" fill="#143a5e" />
          <circle className="mascot-eye" cx="73" cy="48" r="3.6" fill="#143a5e" />

          {/* Cheeks */}
          <circle cx="39" cy="57" r="4.2" fill="#ff8fb1" opacity="0.45" />
          <circle cx="81" cy="57" r="4.2" fill="#ff8fb1" opacity="0.45" />

          {/* Smile (draws itself in) */}
          <path
            className="mascot-smile"
            d="M48 59 Q60 71 72 59"
            fill="none"
            stroke="#143a5e"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </g>

        {/* Twinkling sparkles (positioned via the outer <g>; the CSS scale/rotate
            animation lives on the inner path so it doesn't override placement) */}
        <g transform="translate(19 28)">
          <path
            className="mascot-sparkle"
            d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z"
            fill="#ffc94d"
          />
        </g>
        <g transform="translate(102 22)">
          <path
            className="mascot-sparkle"
            d="M0 -4.5 L1.4 -1.4 L4.5 0 L1.4 1.4 L0 4.5 L-1.4 1.4 L-4.5 0 L-1.4 -1.4 Z"
            fill="#0a84ff"
            style={{ animationDelay: "0.9s" }}
          />
        </g>
        <g transform="translate(106 74)">
          <path
            className="mascot-sparkle"
            d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z"
            fill="#00c389"
            style={{ animationDelay: "1.7s" }}
          />
        </g>
        <g transform="translate(14 80)">
          <path
            className="mascot-sparkle"
            d="M0 -3.8 L1.2 -1.2 L3.8 0 L1.2 1.2 L0 3.8 L-1.2 1.2 L-3.8 0 L-1.2 -1.2 Z"
            fill="#6d4bf6"
            style={{ animationDelay: "0.5s" }}
          />
        </g>
      </svg>
    </div>
  );
}
