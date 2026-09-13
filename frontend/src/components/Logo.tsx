import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const LogoBadge: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="shieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="50%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="mountainGrad" x1="12" y1="16" x2="36" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="alertGrad" x1="20" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>

    {/* Hexagonal Shield Base */}
    <path
      d="M24 4L42 12V25.2C42 34.6 34.4 42.4 24 45C13.6 42.4 6 34.6 6 25.2V12L24 4Z"
      fill="url(#shieldGrad)"
      stroke="#38bdf8"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Topography Contour / Mountain Silhouette */}
    <path
      d="M11 34L20 22L27 30L33 24L37 34H11Z"
      fill="url(#mountainGrad)"
      opacity="0.85"
    />
    <path
      d="M16 34L23 25L28 31L32 27L35 34H16Z"
      fill="#bae6fd"
      opacity="0.35"
    />

    {/* Radar Scan Rings */}
    <circle cx="24" cy="18" r="8" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
    <circle cx="24" cy="18" r="4" stroke="#e0f2fe" strokeWidth="1" opacity="0.8" />

    {/* Warning Beacon Pulse Dot */}
    <circle cx="24" cy="18" r="2.5" fill="url(#alertGrad)" />
  </svg>
);

export default function Logo({ size = 38, showText = true }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <LogoBadge size={size} />
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: '#f8fafc',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              NER-LEWS
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                textTransform: 'uppercase',
              }}
            >
              Operational
            </span>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
            }}
          >
            North Eastern Region · Landslide Early Warning
          </span>
        </div>
      )}
    </div>
  );
}
