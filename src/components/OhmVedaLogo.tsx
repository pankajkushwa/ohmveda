import React, { useState, useEffect } from 'react';
import { getStoredCustomLogo } from '../services/dataStorage';

interface OhmVedaLogoProps {
  variant?: 'dark' | 'light' | 'white'; // 'dark' = white text on dark bg, 'light' = dark text on light bg, 'white' = all pure white
  layout?: 'horizontal' | 'stacked' | 'icon-only';
  showSubtitle?: boolean;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  customLogoUrl?: string | null;
  className?: string;
}

export const OhmVedaLogo: React.FC<OhmVedaLogoProps> = ({
  variant = 'dark',
  layout = 'horizontal',
  showSubtitle = false,
  showTagline = false,
  size = 'md',
  customLogoUrl,
  className = '',
}) => {
  const [activeLogoUrl, setActiveLogoUrl] = useState<string | null>(() => {
    return customLogoUrl !== undefined ? customLogoUrl : getStoredCustomLogo();
  });
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    if (customLogoUrl !== undefined) {
      setActiveLogoUrl(customLogoUrl);
      setImgError(false);
      return;
    }

    const handleLogoUpdate = () => {
      setActiveLogoUrl(getStoredCustomLogo());
      setImgError(false);
    };

    window.addEventListener('ohmveda_logo_updated', handleLogoUpdate);
    return () => window.removeEventListener('ohmveda_logo_updated', handleLogoUpdate);
  }, [customLogoUrl]);

  const isDarkBg = variant === 'dark' || variant === 'white';
  const isPureWhite = variant === 'white';
  const uid = `ov_${variant}_${layout}_${size}_${Math.random().toString(36).substring(2, 6)}`;

  // Size mapping
  const sizeConfig = {
    sm: { icon: 44, text: 'text-2xl', sub: 'text-[10px]', tag: 'text-[9px]', gap: 'gap-3' },
    md: { icon: 58, text: 'text-3xl', sub: 'text-[11px]', tag: 'text-[10px]', gap: 'gap-3.5' },
    lg: { icon: 76, text: 'text-4xl', sub: 'text-[12px]', tag: 'text-[11px]', gap: 'gap-4' },
    xl: { icon: 98, text: 'text-5xl', sub: 'text-[13px]', tag: 'text-[12px]', gap: 'gap-4.5' },
    '2xl': { icon: 124, text: 'text-6xl', sub: 'text-[15px]', tag: 'text-[13px]', gap: 'gap-5' },
  }[size];

  // Color variables
  const ohmTextColor = isPureWhite ? 'text-white' : isDarkBg ? 'text-slate-100' : 'text-[#03045E]';
  const vedaTextColor = isPureWhite ? 'text-cyan-300' : 'text-[#0096C7]';
  const subTextColor = isPureWhite ? 'text-slate-200' : isDarkBg ? 'text-cyan-400' : 'text-[#03045E]';
  const tagTextColor = isPureWhite ? 'text-slate-300' : isDarkBg ? 'text-slate-300' : 'text-slate-600';

  // Custom Uploaded Logo Element vs Vector Emblem
  const renderEmblem = () => {
    if (activeLogoUrl && !imgError) {
      return (
        <img
          src={activeLogoUrl}
          alt="OhmVeda Custom Logo"
          onError={() => setImgError(true)}
          style={{
            height: `${Math.round(sizeConfig.icon * 1.25)}px`,
            maxHeight: `${Math.round(sizeConfig.icon * 1.5)}px`,
            width: 'auto',
          }}
          className="shrink-0 object-contain max-w-[280px] sm:max-w-[340px] transition-transform duration-300 group-hover:scale-105"
        />
      );
    }

    return (
      <svg
        width={sizeConfig.icon}
        height={sizeConfig.icon}
        style={{
          width: `${sizeConfig.icon}px`,
          height: `${sizeConfig.icon}px`,
          minWidth: `${sizeConfig.icon}px`,
          minHeight: `${sizeConfig.icon}px`,
        }}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        aria-label="OhmVeda Emblem"
      >
        <defs>
          {/* Omega Arch Gradient */}
          <linearGradient id={`archGrad_${uid}`} x1="20" y1="20" x2="180" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00B4D8" />
            <stop offset="50%" stopColor="#0077B6" />
            <stop offset="100%" stopColor={isPureWhite ? '#FFFFFF' : isDarkBg ? '#38BDF8' : '#03045E'} />
          </linearGradient>

          {/* PCB Traces Gradient */}
          <linearGradient id={`pcbGrad_${uid}`} x1="130" y1="20" x2="185" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor={isPureWhite ? '#FFFFFF' : isDarkBg ? '#38BDF8' : '#0077B6'} />
          </linearGradient>

          {/* V-Shape Color */}
          <linearGradient id={`vGrad_${uid}`} x1="60" y1="80" x2="140" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isPureWhite ? '#FFFFFF' : isDarkBg ? '#F8FAFC' : '#03045E'} />
            <stop offset="100%" stopColor={isPureWhite ? '#E2E8F0' : isDarkBg ? '#CBD5E1' : '#0B192C'} />
          </linearGradient>
        </defs>

        {/* Outer Omega Arch */}
        <path
          d="M 22 152 H 54 C 54 82, 58 32, 100 32 C 142 32, 146 82, 146 152 H 178"
          stroke={isPureWhite ? '#FFFFFF' : `url(#archGrad_${uid})`}
          strokeWidth="18"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />

        {/* Inner V-Shape */}
        <path
          d="M 60 82 L 100 150 L 140 82"
          stroke={`url(#vGrad_${uid})`}
          strokeWidth="18"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />

        {/* Top Center PCB Pin & Terminal Dot */}
        <line
          x1="100"
          y1="72"
          x2="100"
          y2="42"
          stroke={isPureWhite ? '#FFFFFF' : isDarkBg ? '#F8FAFC' : '#03045E'}
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <circle
          cx="100"
          cy="34"
          r="6.5"
          fill={isDarkBg ? '#0F172A' : '#FFFFFF'}
          stroke={isPureWhite ? '#FFFFFF' : isDarkBg ? '#F8FAFC' : '#03045E'}
          strokeWidth="4"
        />

        {/* Center Golden/Orange Lightning Bolt */}
        <path
          d="M 103 60 L 87 96 H 101 L 94 124 L 115 88 H 100 Z"
          fill="#FF9F00"
        />

        {/* Top-Right PCB Traces */}
        <g
          stroke={isPureWhite ? '#FFFFFF' : `url(#pcbGrad_${uid})`}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 128 50 L 146 28 H 156" />
          <circle cx="162" cy="28" r="4.5" fill={isDarkBg ? '#0F172A' : '#FFFFFF'} stroke={isPureWhite ? '#FFFFFF' : '#00B4D8'} strokeWidth="3" />
          <circle cx="162" cy="28" r="1.5" fill={isPureWhite ? '#FFFFFF' : '#00B4D8'} />

          <path d="M 138 68 H 162" />
          <circle cx="168" cy="68" r="4.5" fill={isDarkBg ? '#0F172A' : '#FFFFFF'} stroke={isPureWhite ? '#FFFFFF' : '#00B4D8'} strokeWidth="3" />
          <circle cx="168" cy="68" r="1.5" fill={isPureWhite ? '#FFFFFF' : '#00B4D8'} />

          <path d="M 140 86 L 154 100 H 166" />
          <circle cx="172" cy="100" r="4.5" fill={isDarkBg ? '#0F172A' : '#FFFFFF'} stroke={isPureWhite ? '#FFFFFF' : '#00B4D8'} strokeWidth="3" />
          <circle cx="172" cy="100" r="1.5" fill={isPureWhite ? '#FFFFFF' : '#00B4D8'} />
        </g>
      </svg>
    );
  };

  const EmblemElement = renderEmblem();

  if (layout === 'icon-only') {
    return <div className={`inline-flex items-center shrink-0 ${className}`}>{EmblemElement}</div>;
  }

  if (layout === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center select-none shrink-0 ${className}`}>
        {/* Emblem or Custom Image */}
        <div className="mb-2 shrink-0 flex items-center justify-center">{EmblemElement}</div>

        {/* OhmVeda Title (Hidden if custom logo already contains complete branded artwork) */}
        {(!activeLogoUrl || imgError) && (
          <div className={`font-extrabold tracking-tight flex items-baseline justify-center leading-none whitespace-nowrap ${sizeConfig.text}`}>
            <span className={ohmTextColor}>Ohm</span>
            <span className={vedaTextColor}>Veda</span>
          </div>
        )}

        {/* Optional Subtitle */}
        {showSubtitle && (
          <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-xs">
            <span className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent to-cyan-500/80" />
            <span className={`font-mono font-black uppercase tracking-[0.25em] ${sizeConfig.sub} ${subTextColor} whitespace-nowrap`}>
              TECHNOLOGIES
            </span>
            <span className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent to-cyan-500/80" />
          </div>
        )}

        {/* Optional Tagline */}
        {showTagline && (
          <div className={`flex items-center justify-center gap-2 mt-2 font-mono font-bold tracking-widest uppercase ${sizeConfig.tag} ${tagTextColor} whitespace-nowrap`}>
            <span>INNOVATE</span>
            <span className="text-cyan-400 font-black">•</span>
            <span>INTEGRATE</span>
            <span className="text-cyan-400 font-black">•</span>
            <span>ELEVATE</span>
          </div>
        )}
      </div>
    );
  }

  // Horizontal Layout (Navbar/Header Default)
  return (
    <div className={`inline-flex items-center ${sizeConfig.gap} select-none shrink-0 ${className}`}>
      {EmblemElement}

      {/* Text column (shown if default emblem or if subtitle/tagline is required) */}
      {(!activeLogoUrl || imgError || showSubtitle || showTagline) && (
        <div className="flex flex-col leading-none justify-center shrink-0">
          {(!activeLogoUrl || imgError) && (
            <div className={`font-extrabold tracking-tight flex items-baseline leading-none whitespace-nowrap ${sizeConfig.text}`}>
              <span className={ohmTextColor}>Ohm</span>
              <span className={vedaTextColor}>Veda</span>
            </div>
          )}

          {/* Optional Subtitle */}
          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2.5 h-[1.5px] bg-cyan-500/80 shrink-0" />
              <span className={`font-mono font-black uppercase tracking-[0.22em] ${sizeConfig.sub} ${subTextColor} whitespace-nowrap`}>
                TECHNOLOGIES
              </span>
              <span className="w-2.5 h-[1.5px] bg-cyan-500/80 shrink-0" />
            </div>
          )}

          {/* Optional Tagline */}
          {showTagline && (
            <div className={`flex items-center gap-1.5 mt-1 font-mono font-semibold tracking-wider uppercase ${sizeConfig.tag} ${tagTextColor} whitespace-nowrap`}>
              <span>INNOVATE</span>
              <span className="text-cyan-400">•</span>
              <span>INTEGRATE</span>
              <span className="text-cyan-400">•</span>
              <span>ELEVATE</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
