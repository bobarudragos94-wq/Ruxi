/**
 * Animated tooth mascot for the public booking hero — a 12s looping,
 * three-act scene with fluid transitions (pure SVG + CSS, no GIF):
 *   Act 1 (0-33%)  "Îngrijire dentară"        — toothbrush scrubs, foam pops
 *   Act 2 (33-66%) "Zâmbete sănătoase"        — golden sparkle ring orbits,
 *                                               star-lets twinkle, shine sweep
 *   Act 3 (66-100%) "Dentistul tău prietenos" — the tooth winks, a heart pops
 * The tooth floats over a mint pedestal with swaying leaves; captions
 * crossfade in sync. Keyframes live in globals.css.
 */

const TOOTH_PATH =
  "M60 16 C38 16 28 32 30 52 C32 74 40 102 49 102 C56 102 55 78 60 78 C65 78 64 102 71 102 C80 102 88 74 90 52 C92 32 82 16 60 16 Z";

const STAR = (s: number) =>
  `M0 ${-s} L${s * 0.3} ${-s * 0.3} L${s} 0 L${s * 0.3} ${s * 0.3} L0 ${s} L${-s * 0.3} ${s * 0.3} L${-s} 0 L${-s * 0.3} ${-s * 0.3} Z`;

/** Ring of golden star-lets orbiting the tooth (act 2). */
const RING_STARS: { x: number; y: number; size: number; fill: string }[] = [
  { x: 102, y: 52, size: 3.2, fill: "#ffb300" },
  { x: 90, y: 63, size: 2, fill: "#ffc94d" },
  { x: 60, y: 68, size: 2.8, fill: "#ffb300" },
  { x: 30, y: 63, size: 1.8, fill: "#ffe08a" },
  { x: 18, y: 52, size: 3, fill: "#ffc94d" },
  { x: 30, y: 41, size: 2, fill: "#ffb300" },
  { x: 60, y: 36, size: 1.6, fill: "#ffe08a" },
  { x: 90, y: 41, size: 2.4, fill: "#ffc94d" },
];

/** Star-lets twinkling on the tooth surface itself (act 2). */
const POLISH_STARS: { x: number; y: number; size: number; fill: string; delay?: string }[] = [
  { x: 42, y: 28, size: 5, fill: "#ffb300" },
  { x: 56, y: 22, size: 3.5, fill: "#ffc94d", delay: "0.18s" },
  { x: 70, y: 30, size: 4.5, fill: "#ffb300", delay: "0.36s" },
  { x: 80, y: 42, size: 3, fill: "#ffe08a", delay: "0.5s" },
  { x: 38, y: 40, size: 3.2, fill: "#ffc94d", delay: "0.62s" },
  { x: 61, y: 34, size: 2.6, fill: "#ffe08a", delay: "0.26s" },
  { x: 50, y: 68, size: 2.8, fill: "#ffc94d", delay: "0.74s" },
];

export function SmileMascot() {
  return (
    <div className="relative w-44 md:w-60 mx-auto select-none" aria-hidden>
      {/* Pulsing gradient halo behind the tooth */}
      <div className="mascot-halo absolute inset-x-3 top-3 bottom-12 rounded-full bg-gradient-to-br from-[#0a84ff]/25 via-[#00c389]/15 to-[#6d4bf6]/20 blur-2xl" />

      <svg viewBox="0 0 120 126" className="relative w-full h-auto">
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
          <linearGradient id="pasteGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d3a6" />
            <stop offset="100%" stopColor="#0bbf92" />
          </linearGradient>
          <linearGradient id="pedestalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d6f7ec" />
            <stop offset="100%" stopColor="#a9e8d2" />
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

        {/* Mint pedestal with leaves (site palette) */}
        <ellipse cx="60" cy="109" rx="36" ry="8" fill="#8fdec0" opacity="0.55" />
        <ellipse cx="60" cy="106" rx="34" ry="7.5" fill="url(#pedestalGrad)" />
        <g className="mascot-leaf">
          <path d="M24 104 C16 96 14 88 18 82 C26 84 30 92 28 102 Z" fill="#7fd8b8" opacity="0.9" />
        </g>
        <g className="mascot-leaf" style={{ animationDelay: "1.2s" }}>
          <path d="M96 104 C104 96 106 88 102 82 C94 84 90 92 92 102 Z" fill="#5ecda6" opacity="0.9" />
        </g>

        <g className="mascot-float">
          {/* Tooth + face wobble together while being brushed */}
          <g className="mascot-jiggle">
            {/* Tooth body */}
            <path
              d={TOOTH_PATH}
              fill="url(#toothGrad)"
              style={{ filter: "drop-shadow(0 10px 18px rgba(0, 93, 172, 0.28))" }}
            />
            {/* Static shine */}
            <ellipse cx="44" cy="32" rx="7" ry="11" fill="#ffffff" opacity="0.85" transform="rotate(-24 44 32)" />

            {/* Eyes: synced blinks; the right eye winks in act 3 */}
            <circle className="mascot-eye-cycle" cx="47" cy="48" r="3.6" fill="#143a5e" />
            <circle className="mascot-eye-wink" cx="73" cy="48" r="3.6" fill="#143a5e" />

            {/* Cheeks */}
            <circle cx="39" cy="57" r="4.2" fill="#ff8fb1" opacity="0.45" />
            <circle cx="81" cy="57" r="4.2" fill="#ff8fb1" opacity="0.45" />

            {/* Smile (draws itself in, widens during the wink) */}
            <g className="mascot-smile-big">
              <path
                className="mascot-smile"
                d="M48 59 Q60 71 72 59"
                fill="none"
                stroke="#143a5e"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* Lamination sweep across the tooth at the start of act 2 */}
          <g clipPath="url(#toothClip)">
            <rect className="mascot-shine-sweep" x="-34" y="8" width="24" height="100" fill="url(#shineGrad)" />
          </g>

          {/* Foam bubbles while scrubbing (act 1) */}
          <g>
            <circle className="mascot-foam" cx="46" cy="15" r="3" fill="#ffffff" stroke="#cfe3ff" strokeWidth="0.8" />
            <circle className="mascot-foam" cx="56" cy="11" r="2.4" fill="#ffffff" stroke="#cfe3ff" strokeWidth="0.8" style={{ animationDelay: "0.5s" }} />
            <circle className="mascot-foam" cx="66" cy="14" r="3.4" fill="#ffffff" stroke="#cfe3ff" strokeWidth="0.8" style={{ animationDelay: "1s" }} />
            <circle className="mascot-foam" cx="74" cy="10" r="2.2" fill="#ffffff" stroke="#cfe3ff" strokeWidth="0.8" style={{ animationDelay: "1.5s" }} />
          </g>

          {/* Golden star-lets twinkling on the white crown (act 2) */}
          {POLISH_STARS.map((s, i) => (
            <g key={`p${i}`} transform={`translate(${s.x} ${s.y})`}>
              <path
                className="mascot-burst"
                d={STAR(s.size)}
                fill={s.fill}
                style={s.delay ? { animationDelay: s.delay } : undefined}
              />
            </g>
          ))}

          {/* Orbiting sparkle ring (act 2) */}
          <g className="mascot-ring">
            {RING_STARS.map((s, i) => (
              <g key={`r${i}`} transform={`translate(${s.x} ${s.y})`}>
                <path d={STAR(s.size)} fill={s.fill} />
              </g>
            ))}
          </g>

          {/* Ad-style gleam flare at the tooth's edge (start of act 2) */}
          <g transform="translate(78 24)">
            <path
              className="mascot-flare"
              d="M0 -11 Q1.2 -1.2 11 0 Q1.2 1.2 0 11 Q-1.2 1.2 -11 0 Q-1.2 -1.2 0 -11 Z"
              fill="#ffc94d"
              opacity="0.9"
            />
            <path
              className="mascot-flare"
              d="M0 -6.5 Q0.8 -0.8 6.5 0 Q0.8 0.8 0 6.5 Q-0.8 0.8 -6.5 0 Q-0.8 -0.8 0 -6.5 Z"
              fill="#ffffff"
              style={{ animationDelay: "0.1s" }}
            />
          </g>

          {/* Hearts popping during the wink (act 3) */}
          <g transform="translate(92 38)">
            <path
              className="mascot-heart"
              d="M0 -2.4 C-1.2 -4.4 -4.8 -4 -4.8 -1.2 C-4.8 1.2 -1.6 3.2 0 4.8 C1.6 3.2 4.8 1.2 4.8 -1.2 C4.8 -4 1.2 -4.4 0 -2.4 Z"
              fill="#ff6b9d"
            />
          </g>
          <g transform="translate(27 40) scale(0.7)">
            <path
              className="mascot-heart"
              d="M0 -2.4 C-1.2 -4.4 -4.8 -4 -4.8 -1.2 C-4.8 1.2 -1.6 3.2 0 4.8 C1.6 3.2 4.8 1.2 4.8 -1.2 C4.8 -4 1.2 -4.4 0 -2.4 Z"
              fill="#ff8fb1"
              style={{ animationDelay: "0.3s" }}
            />
          </g>
          <g transform="translate(99 54) scale(0.55)">
            <path
              className="mascot-heart"
              d="M0 -2.4 C-1.2 -4.4 -4.8 -4 -4.8 -1.2 C-4.8 1.2 -1.6 3.2 0 4.8 C1.6 3.2 4.8 1.2 4.8 -1.2 C4.8 -4 1.2 -4.4 0 -2.4 Z"
              fill="#ff6b9d"
              style={{ animationDelay: "0.5s" }}
            />
          </g>

          {/* Toothbrush (modern): white rounded head with 9 dense tufts
              (blue indicator tufts in the middle), tapered neck, gradient
              handle with teal grip. Bristles point DOWN; tips at local y=17. */}
          <g className="mascot-brush">
            {/* Dense bristle tufts */}
            <rect x="-4" y="8" width="2.2" height="8.6" rx="1.1" fill="#dbeafe" />
            <rect x="-1.2" y="8" width="2.2" height="9" rx="1.1" fill="#eaf3ff" />
            <rect x="1.6" y="8" width="2.2" height="8.6" rx="1.1" fill="#dbeafe" />
            <rect x="4.4" y="8" width="2.2" height="9" rx="1.1" fill="#9cc8ff" />
            <rect x="7.2" y="8" width="2.2" height="8.7" rx="1.1" fill="#7db8ff" />
            <rect x="10" y="8" width="2.2" height="9" rx="1.1" fill="#9cc8ff" />
            <rect x="12.8" y="8" width="2.2" height="8.6" rx="1.1" fill="#eaf3ff" />
            <rect x="15.6" y="8" width="2.2" height="9" rx="1.1" fill="#dbeafe" />
            <rect x="18.4" y="8" width="2.2" height="8.6" rx="1.1" fill="#eaf3ff" />
            {/* White head capsule */}
            <rect x="-6" y="0" width="28.5" height="8.4" rx="4.2" fill="#f2f8ff" stroke="#bcd6f5" strokeWidth="0.6" />
            {/* Tapered neck */}
            <path d="M22 2.2 C27 1.6 30 1.4 34 1.6 L34 7 C30 7.2 27 7 22 6.4 Z" fill="#cfe3ff" />
            {/* Ergonomic handle */}
            <rect x="33" y="0.6" width="35" height="7.6" rx="3.8" fill="url(#brushGrad)" />
            {/* Teal soft-grip */}
            <rect x="45" y="2" width="18" height="4.8" rx="2.4" fill="#0bbf92" />
            <rect x="47.5" y="3" width="1.6" height="2.8" rx="0.8" fill="#089975" />
            <rect x="51" y="3" width="1.6" height="2.8" rx="0.8" fill="#089975" />
            <rect x="54.5" y="3" width="1.6" height="2.8" rx="0.8" fill="#089975" />
            <rect x="58" y="3" width="1.6" height="2.8" rx="0.8" fill="#089975" />
            {/* Gloss highlight */}
            <rect x="35.5" y="1.6" width="26" height="1.5" rx="0.75" fill="#ffffff" opacity="0.4" />
            {/* Mint toothpaste on the bristles (used up as foam appears) */}
            <g className="mascot-paste" transform="translate(0 4.5)">
              <path
                d="M-4 10 Q0 6.5 5 9 Q10 11.5 14 8.5 Q18 6.5 20.5 9.5 Q20.5 12 16 12.5 L-2 12.5 Q-4.5 12 -4 10 Z"
                fill="url(#pasteGrad)"
              />
              <ellipse cx="2" cy="9" rx="2.4" ry="1" fill="#ffffff" opacity="0.45" />
            </g>
          </g>
        </g>

        {/* Ambient twinkling sparkles */}
        <g transform="translate(19 28)">
          <path className="mascot-sparkle" d={STAR(6)} fill="#ffc94d" />
        </g>
        <g transform="translate(102 22)">
          <path className="mascot-sparkle" d={STAR(4.5)} fill="#0a84ff" style={{ animationDelay: "0.9s" }} />
        </g>
        <g transform="translate(108 74)">
          <path className="mascot-sparkle" d={STAR(5)} fill="#00c389" style={{ animationDelay: "1.7s" }} />
        </g>
        <g transform="translate(12 80)">
          <path className="mascot-sparkle" d={STAR(3.8)} fill="#6d4bf6" style={{ animationDelay: "0.5s" }} />
        </g>
      </svg>

      {/* Crossfading captions, one per act */}
      <div className="relative h-7">
        <span className="mascot-caption absolute inset-x-0 text-center text-sm md:text-base font-bold tracking-tight text-[#0a6cdc]">
          Îngrijire dentară
        </span>
        <span
          className="mascot-caption absolute inset-x-0 text-center text-sm md:text-base font-bold tracking-tight text-[#00875a]"
          style={{ animationDelay: "4s" }}
        >
          Zâmbete sănătoase
        </span>
        <span
          className="mascot-caption absolute inset-x-0 text-center text-sm md:text-base font-bold tracking-tight text-[#6d4bf6]"
          style={{ animationDelay: "8s" }}
        >
          Dentistul tău prietenos
        </span>
      </div>

      {/* Story progress: one dot per act */}
      <div className="flex items-center justify-center gap-2 mt-1.5">
        <span className="mascot-dot" />
        <span className="mascot-dot" style={{ animationDelay: "4s" }} />
        <span className="mascot-dot" style={{ animationDelay: "8s" }} />
      </div>
    </div>
  );
}
