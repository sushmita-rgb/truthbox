// Inline SVG logo — gold justice scales + VERIT text, fully transparent background
// Colours match the site accent #97ce23

export default function VeritLogo({ className = "h-14 w-auto", showTagline = true }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 110"
      className={className}
      fill="none"
      aria-label="Verit"
    >
      <defs>
        {/* Lime green gradient — site accent #97ce23 */}
        <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#c8f563" />
          <stop offset="55%"  stopColor="#97ce23" />
          <stop offset="100%" stopColor="#6aa018" />
        </linearGradient>
        {/* Bright white-green for top highlights */}
        <linearGradient id="goldLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="100%" stopColor="#97ce23" />
        </linearGradient>
      </defs>

      {/* ── Justice Scales Icon ── */}
      {/* Vertical centre rod */}
      <rect x="129" y="10" width="2.5" height="46" rx="1.2" fill="url(#gold)" />

      {/* Star / diamond pip at top */}
      <polygon
        points="130.25,5  132,9.5  130.25,12  128.5,9.5"
        fill="url(#goldLight)"
      />

      {/* Horizontal crossbar */}
      <rect x="96" y="21" width="68" height="3" rx="1.5" fill="url(#gold)" />

      {/* Left arm string */}
      <line x1="104" y1="24" x2="100" y2="37" stroke="url(#gold)" strokeWidth="1.4" />
      <line x1="108" y1="24" x2="112" y2="37" stroke="url(#gold)" strokeWidth="1.4" />

      {/* Right arm string */}
      <line x1="152" y1="24" x2="148" y2="37" stroke="url(#gold)" strokeWidth="1.4" />
      <line x1="156" y1="24" x2="160" y2="37" stroke="url(#gold)" strokeWidth="1.4" />

      {/* Left pan */}
      <path
        d="M99 37 Q106 44 113 37"
        stroke="url(#gold)" strokeWidth="1.6" fill="none" strokeLinecap="round"
      />
      <line x1="99" y1="37" x2="113" y2="37" stroke="url(#gold)" strokeWidth="1.4" />

      {/* Right pan */}
      <path
        d="M147 37 Q154 44 161 37"
        stroke="url(#gold)" strokeWidth="1.6" fill="none" strokeLinecap="round"
      />
      <line x1="147" y1="37" x2="161" y2="37" stroke="url(#gold)" strokeWidth="1.4" />

      {/* Base platform */}
      <rect x="122" y="56" width="16.5" height="2.5" rx="1.2" fill="url(#gold)" />
      <rect x="125" y="52" width="10.5" height="4" rx="1.2" fill="url(#gold)" />

      {/* ── VERIT wordmark ── */}
      <text
        x="130"
        y="77"
        textAnchor="middle"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontSize="17"
        fontWeight="bold"
        letterSpacing="8"
        fill="#ffffff"
      >
        VERIT
      </text>

      {/* ── Thin divider line ── */}
      <line x1="68" y1="83" x2="192" y2="83" stroke="#97ce23" strokeWidth="0.6" opacity="0.7" />

      {/* ── Tagline ── */}
      {showTagline && (
        <text
          x="130"
          y="93"
          textAnchor="middle"
          fontFamily="'Georgia', 'Times New Roman', serif"
          fontSize="6.5"
          letterSpacing="2.5"
          fill="#97ce23"
          opacity="0.8"
        >
          AUTHENTIC. PRIVATE. POWERFUL.
        </text>
      )}
    </svg>
  );
}
