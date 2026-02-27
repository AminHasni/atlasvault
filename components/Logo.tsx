import React from 'react';

export const Logo = ({ className = "h-8 w-8" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="atlas-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      
      {/* Hexagon Outline */}
      <path 
        d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" 
        stroke="url(#atlas-grad)" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />
      
      {/* Zig-zag and top stroke of V */}
      <path 
        d="M11 72.5 L39 25 L61 75 L89 27.5 L61.4 43.4" 
        stroke="url(#atlas-grad)" 
        strokeWidth="6" 
        strokeLinejoin="round" 
        strokeLinecap="round"
      />
      
      {/* Crossbar of A */}
      <path 
        d="M27.2 45 L54.8 60.9" 
        stroke="url(#atlas-grad)" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
    </svg>
  );
};
