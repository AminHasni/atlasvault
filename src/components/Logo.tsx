import React from 'react';

export const AtlasLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative ${className} group`}>
      <svg
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-transform group-hover:scale-110"
      >
        <path
          d="M50 5L93.3 30V80L50 105L6.7 80V30L50 5Z"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        />
        {/* Styled A from the reference image */}
        <path
          d="M30 80L50 25L70 80"
          stroke="url(#gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38 60H62"
          stroke="url(#gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 25V105"
          stroke="url(#gradient)"
          strokeWidth="1"
          strokeLinecap="round"
          className="opacity-20"
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="100" y2="115" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#D946EF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
