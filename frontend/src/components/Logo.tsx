import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const LogoBadge: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <img 
    src="/paharsafelogo.svg" 
    alt="PaharSafe Logo" 
    width={size} 
    height={size} 
    style={{ flexShrink: 0 }} 
  />
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
                color: '#fdfaf6',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              PaharSafe
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
              color: '#bdae9d',
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
