import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean; // If true, logo is white. If false, logo is deep navy blue.
  siteName?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-10', light = true, siteName = "Columna Pública" }) => {
  const fillColor = light ? '#ffffff' : '#0c2340'; // white vs deep navy blue

  // Extract first word and rest of name to fit standard neoclassical stack
  const words = siteName.trim().split(/\s+/);
  const part1 = words[0]?.toUpperCase() || "COLUMNA";
  const part2 = words.slice(1).join(" ")?.toUpperCase() || "PÚBLICA";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 120"
      className={className}
      role="img"
      aria-label={siteName}
    >
      <title>{siteName} Logo</title>
      <g transform="matrix(0.3, 0, 0, 0.3, 10, -17)" fill={fillColor}>
        <rect x="140" y="125" width="120" height="10" />
        <rect x="172" y="135" width="56" height="35" />
        <path d="M 172,135 A 18,18 0 0,0 172,170 A 25,25 0 0,1 172,135 Z" />
        <path d="M 228,135 A 18,18 0 0,1 228,170 A 25,25 0 0,0 228,135 Z" />
        <path d="M162,190 L238,190 L228,170 L172,170 Z" />
        <rect x="172" y="190" width="12" height="200" />
        <rect x="194" y="190" width="12" height="200" />
        <rect x="216" y="190" width="12" height="200" />
      </g>

      <text
        x="110"
        y="65"
        fontFamily="Cinzel, serif"
        fontSize="36"
        fontWeight="700"
        textAnchor="start"
        fill={fillColor}
      >
        {part1}
      </text>
      <text
        x="115"
        y="95"
        fontFamily="Cinzel, serif"
        fontSize="13"
        letterSpacing="0.4em"
        fontWeight="400"
        textAnchor="start"
        fill={fillColor}
      >
        {part2}
      </text>
    </svg>
  );
};
