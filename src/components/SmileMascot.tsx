/**
 * Friendly animated tooth mascot for the public booking hero.
 * Pure SVG + CSS keyframes (see globals.css). One 7s looping scene:
 * a toothbrush slides in and scrubs the tooth (with foam), exits,
 * then a shine sweeps across the tooth and sparkle bursts pop.
 * The tooth itself floats gently, blinks and draws its smile in.
 */

const TOOTH_PATH =
  "M60 16 C38 16 28 32 30 52 C32 74 40 102 49 102 C56 102 55 78 60 78 C65 78 64 102 71 102 C80 102 88 74 90 52 C92 32 82 16 60 16 Z";

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
          <linearGradient id="brushGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4ba3ff" />
            <stop offset="100%" stopColor="#005dac" />
          </linearGradient>
          <linearGradient id="shineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="toothClip">
            <path d={TOOTH_PATH} />
          </clipPath>
        </defs>

        <g className="mascot-float">
          {/* Tooth body */}
          <path
            d={TOOTH_PATH}
            fill="url(#toothGrad)"
            style={{ filter: "drop-shadow(0 10px 18px rgba(0, 93, 172, 0.28))" }}
          />
          {/* Static shine */}
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

          {/* Shine sweep across the tooth after brushing (clipped to tooth shape) */}
          <g clipPath="url(#toothClip)">
            <rect className="mascot-shine-sweep" x="-34" y="8" width="24" height="100" fill="url(#shineGrad)" />
          </g>

          {/* Foam bubbles while scrubbing */}
          <g>
            <circle className="mascot-foam" cx="46" cy="15" r="3" fill="#ffffff" stroke="#cfe3ff" strokeWidth="0.8" />
            <circle className="mascot-foam" cx="56" cy="11" r="2.4" fill="#ffffff" stroke="#cfe3ff" strokeWidth="0.8" style={{ animationDelay: "0.35s" }} />
            <circle className="mascot-foam" cx="66" cy="14" r="3.4" fill="#ffffff" stroke="#cfe3ff" strokeWidth="0.8" style={{ animationDelay: "0.7s" }} />
            <circle className="mascot-foam" cx="74" cy="10" r="2.2" fill="#ffffff" stroke="#cfe3ff" strokeWidth="0.8" style={{ animationDelay: "1s" }} />
          </g>

          {/* Sparkle bursts right after the shine sweep */}
          <g transform="translate(40 28)">
            <path className="mascot-burst" d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z" fill="#ffc94d" />
          </g>
          <g transform="translate(76 36)">
            <path className="mascot-burst" d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill="#ffffff" style={{ animationDelay: "0.15s" }} />
          </g>
          <g transform="translate(60 20)">
            <path className="mascot-burst" d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z" fill="#ffc94d" style={{ animationDelay: "0.3s" }} />
          </g>

          {/* Toothbrush: head + bristles on the left, handle extends right.
              Bristle tips sit at local y=17 and scrub the crown top. */}
          <g className="mascot-brush">
            {/* Bristles */}
            <rect x="-1" y="0" width="2.6" height="9" rx="1" fill="#dbeafe" />
            <rect x="3" y="0" width="2.6" height="9" rx="1" fill="#eaf3ff" />
            <rect x="7" y="0" width="2.6" height="9" rx="1" fill="#dbeafe" />
            <rect x="11" y="0" width="2.6" height="9" rx="1" fill="#eaf3ff" />
            <rect x="15" y="0" width="2.6" height="9" rx="1" fill="#dbeafe" />
            {/* Head */}
            <rect x="-4" y="8" width="25" height="8" rx="4" fill="#4ba3ff" />
            {/* Handle */}
            <rect x="16" y="8.8" width="46" height="6.4" rx="3.2" fill="url(#brushGrad)" />
          </g>
        </g>

        {/* Ambient twinkling sparkles (positioned via the outer <g>; the CSS
            scale/rotate animation lives on the inner path so it doesn't
            override placement) */}
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
