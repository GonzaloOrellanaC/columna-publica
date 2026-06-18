import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-11 md:h-12 w-auto", showText = true }) => {
  return (
    <div className="flex items-center select-none hover:opacity-90 transition-opacity">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 120"
        role="img"
        aria-label="Columna Pública"
        className={className}
      >
        <title>Columna Pública - Horizontal (letras blancas)</title>
        <g transform="matrix(0.3, 0, 0, 0.3, 10, -17)" fill="#ffffff">
          <rect x="140" y="125" width="120" height="10" />
          <rect x="172" y="135" width="56" height="35" />
          <path d="M 172,135 A 18,18 0 0,0 172,170 A 25,25 0 0,1 172,135 Z" />
          <path d="M 228,135 A 18,18 0 0,1 228,170 A 25,25 0 0,0 228,135 Z" />
          <path d="M162,190 L238,190 L228,170 L172,170 Z" />
          <rect x="172" y="190" width="12" height="200" />
          <rect x="194" y="190" width="12" height="200" />
          <rect x="216" y="190" width="12" height="200" />
        </g>

        {showText && (
          <>
            {/* Text explicitly white */}
            <text x="110" y="65" fontFamily="Cinzel, serif" fontSize="38" fontWeight="700" textAnchor="start" fill="#ffffff">COLUMNA</text>
            <text x="115" y="95" fontFamily="Cinzel, serif" fontSize="14" letterSpacing="0.5em" fontWeight="400" textAnchor="start" fill="#ffffff">PÚBLICA</text>
          </>
        )}
      </svg>
    </div>
  );
};

export default Logo;
