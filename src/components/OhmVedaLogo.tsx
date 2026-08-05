import React, { useState, useEffect } from 'react';
import { 
  getStoredCustomLogo, 
  getStoredDefaultEmblemUrl,
  getStoredEmblemStyle, 
  EmblemStyleOption, 
  getStoredBrandTextSettings, 
  BrandTextSettings 
} from '../services/dataStorage';

interface OhmVedaLogoProps {
  variant?: 'dark' | 'light' | 'white'; // 'dark' = white text on dark bg, 'light' = dark text on light bg, 'white' = all pure white
  layout?: 'horizontal' | 'stacked' | 'icon-only';
  showSubtitle?: boolean;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  customLogoUrl?: string | null;
  defaultEmblemUrl?: string | null;
  emblemStyle?: EmblemStyleOption;
  showBrandText?: boolean;
  brandTextOhm?: string;
  brandTextVeda?: string;
  className?: string;
}

export const OhmVedaLogo: React.FC<OhmVedaLogoProps> = ({
  variant = 'dark',
  layout = 'horizontal',
  showSubtitle = false,
  showTagline = false,
  size = 'md',
  customLogoUrl,
  defaultEmblemUrl,
  emblemStyle,
  showBrandText,
  brandTextOhm,
  brandTextVeda,
  className = '',
}) => {
  const [activeLogoUrl, setActiveLogoUrl] = useState<string | null>(() => {
    return customLogoUrl !== undefined ? customLogoUrl : getStoredCustomLogo();
  });
  const [activeDefaultEmblemUrl, setActiveDefaultEmblemUrl] = useState<string | null>(() => {
    return defaultEmblemUrl !== undefined ? defaultEmblemUrl : getStoredDefaultEmblemUrl();
  });
  const [activeEmblemStyle, setActiveEmblemStyle] = useState<EmblemStyleOption>(() => {
    return emblemStyle !== undefined ? emblemStyle : getStoredEmblemStyle();
  });
  const [brandTextSettings, setBrandTextSettings] = useState<BrandTextSettings>(() => {
    const stored = getStoredBrandTextSettings();
    return {
      showBrandText: showBrandText !== undefined ? showBrandText : stored.showBrandText,
      brandTextOhm: brandTextOhm !== undefined ? brandTextOhm : stored.brandTextOhm,
      brandTextVeda: brandTextVeda !== undefined ? brandTextVeda : stored.brandTextVeda,
    };
  });
  const [imgError, setImgError] = useState<boolean>(false);
  const [defaultImgError, setDefaultImgError] = useState<boolean>(false);

  useEffect(() => {
    if (customLogoUrl !== undefined) {
      setActiveLogoUrl(customLogoUrl);
      setImgError(false);
    }
    if (defaultEmblemUrl !== undefined) {
      setActiveDefaultEmblemUrl(defaultEmblemUrl);
      setDefaultImgError(false);
    }
    if (emblemStyle !== undefined) {
      setActiveEmblemStyle(emblemStyle);
    }

    const storedText = getStoredBrandTextSettings();
    setBrandTextSettings({
      showBrandText: showBrandText !== undefined ? showBrandText : storedText.showBrandText,
      brandTextOhm: brandTextOhm !== undefined ? brandTextOhm : storedText.brandTextOhm,
      brandTextVeda: brandTextVeda !== undefined ? brandTextVeda : storedText.brandTextVeda,
    });

    const handleLogoUpdate = () => {
      setActiveLogoUrl(getStoredCustomLogo());
      setActiveDefaultEmblemUrl(getStoredDefaultEmblemUrl());
      setActiveEmblemStyle(getStoredEmblemStyle());
      const updatedText = getStoredBrandTextSettings();
      setBrandTextSettings({
        showBrandText: showBrandText !== undefined ? showBrandText : updatedText.showBrandText,
        brandTextOhm: brandTextOhm !== undefined ? brandTextOhm : updatedText.brandTextOhm,
        brandTextVeda: brandTextVeda !== undefined ? brandTextVeda : updatedText.brandTextVeda,
      });
      setImgError(false);
      setDefaultImgError(false);
    };

    window.addEventListener('ohmveda_logo_updated', handleLogoUpdate);
    return () => window.removeEventListener('ohmveda_logo_updated', handleLogoUpdate);
  }, [customLogoUrl, defaultEmblemUrl, emblemStyle, showBrandText, brandTextOhm, brandTextVeda]);

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

  // Text values
  const isTextEnabled = showBrandText !== undefined ? showBrandText : brandTextSettings.showBrandText;
  const textOhm = brandTextOhm !== undefined ? brandTextOhm : brandTextSettings.brandTextOhm;
  const textVeda = brandTextVeda !== undefined ? brandTextVeda : brandTextSettings.brandTextVeda;

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

    if (activeDefaultEmblemUrl && !defaultImgError) {
      return (
        <img
          src={activeDefaultEmblemUrl}
          alt="OhmVeda Default Emblem"
          onError={() => setDefaultImgError(true)}
          style={{
            height: `${sizeConfig.icon}px`,
            width: 'auto',
            maxHeight: `${Math.round(sizeConfig.icon * 1.3)}px`,
          }}
          className="shrink-0 object-contain max-w-[200px] transition-transform duration-300 group-hover:scale-105"
        />
      );
    }

    // Shared gradients across vector styles
    const sharedDefs = (
      <defs>
        {/* Primary Arch & Gradient */}
        <linearGradient id={`gradPrimary_${uid}`} x1="10" y1="10" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00B4D8" />
          <stop offset="50%" stopColor="#0077B6" />
          <stop offset="100%" stopColor={isPureWhite ? '#FFFFFF' : isDarkBg ? '#38BDF8' : '#03045E'} />
        </linearGradient>

        {/* PCB & Secondary Traces */}
        <linearGradient id={`gradSecondary_${uid}`} x1="120" y1="20" x2="180" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor={isPureWhite ? '#FFFFFF' : isDarkBg ? '#0096C7' : '#0077B6'} />
        </linearGradient>

        {/* V-Shape Inner Core */}
        <linearGradient id={`gradV_${uid}`} x1="50" y1="80" x2="150" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isPureWhite ? '#FFFFFF' : isDarkBg ? '#F8FAFC' : '#03045E'} />
          <stop offset="100%" stopColor={isPureWhite ? '#E2E8F0' : isDarkBg ? '#CBD5E1' : '#0B192C'} />
        </linearGradient>

        {/* Gold Energy Pulse */}
        <linearGradient id={`gradGold_${uid}`} x1="80" y1="50" x2="120" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#FF9F00" />
        </linearGradient>
      </defs>
    );

    // STYLE 1: QUANTUM OMEGA CORE (Default)
    if (activeEmblemStyle === 'quantum') {
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
          aria-label="OhmVeda Quantum Emblem"
        >
          {sharedDefs}
          {/* Outer Omega Arch */}
          <path
            d="M 22 152 H 54 C 54 82, 58 32, 100 32 C 142 32, 146 82, 146 152 H 178"
            stroke={isPureWhite ? '#FFFFFF' : `url(#gradPrimary_${uid})`}
            strokeWidth="18"
            strokeLinecap="square"
            strokeLinejoin="miter"
            fill="none"
          />

          {/* Inner V-Shape */}
          <path
            d="M 60 82 L 100 150 L 140 82"
            stroke={`url(#gradV_${uid})`}
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
            fill={`url(#gradGold_${uid})`}
          />

          {/* Top-Right PCB Traces */}
          <g
            stroke={isPureWhite ? '#FFFFFF' : `url(#gradSecondary_${uid})`}
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
    }

    // STYLE 2: HEX SHIELD CIRCUIT
    if (activeEmblemStyle === 'shield') {
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
          aria-label="OhmVeda Hex Shield Emblem"
        >
          {sharedDefs}
          {/* Hexagon Outer Frame */}
          <polygon
            points="100,12 176,56 176,144 100,188 24,144 24,56"
            stroke={isPureWhite ? '#FFFFFF' : `url(#gradPrimary_${uid})`}
            strokeWidth="10"
            strokeLinejoin="round"
            fill={isDarkBg ? '#0B132B' : '#F0F9FF'}
          />

          {/* Hex Corner PCB Node Dots */}
          <circle cx="100" cy="12" r="5" fill="#38BDF8" />
          <circle cx="176" cy="56" r="5" fill="#00B4D8" />
          <circle cx="176" cy="144" r="5" fill="#0077B6" />
          <circle cx="100" cy="188" r="5" fill="#03045E" />
          <circle cx="24" cy="144" r="5" fill="#0077B6" />
          <circle cx="24" cy="56" r="5" fill="#00B4D8" />

          {/* Inner Omega Arch */}
          <path
            d="M 46 142 H 72 C 72 88, 76 50, 100 50 C 124 50, 128 88, 128 142 H 154"
            stroke={`url(#gradSecondary_${uid})`}
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />

          {/* Inner V-Shape Core */}
          <path
            d="M 68 82 L 100 144 L 132 82"
            stroke={isPureWhite ? '#FFFFFF' : `url(#gradV_${uid})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Center Golden Core Diamond */}
          <polygon
            points="100,72 112,100 100,128 88,100"
            fill={`url(#gradGold_${uid})`}
          />
        </svg>
      );
    }

    // STYLE 3: SEMICONDUCTOR SILICON DIE
    if (activeEmblemStyle === 'semiconductor') {
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
          aria-label="OhmVeda Semiconductor Emblem"
        >
          {sharedDefs}
          {/* IC Chip Main Body */}
          <rect
            x="28"
            y="28"
            width="144"
            height="144"
            rx="18"
            fill={isDarkBg ? '#0B192C' : '#F8FAFC'}
            stroke={isPureWhite ? '#FFFFFF' : `url(#gradPrimary_${uid})`}
            strokeWidth="8"
          />

          {/* IC Pins (Top, Bottom, Left, Right) */}
          <g stroke={isPureWhite ? '#FFFFFF' : '#00B4D8'} strokeWidth="5" strokeLinecap="round">
            {/* Top Pins */}
            <line x1="60" y1="12" x2="60" y2="28" />
            <line x1="100" y1="12" x2="100" y2="28" />
            <line x1="140" y1="12" x2="140" y2="28" />
            {/* Bottom Pins */}
            <line x1="60" y1="172" x2="60" y2="188" />
            <line x1="100" y1="172" x2="100" y2="188" />
            <line x1="140" y1="172" x2="140" y2="188" />
            {/* Left Pins */}
            <line x1="12" y1="60" x2="28" y2="60" />
            <line x1="12" y1="100" x2="28" y2="100" />
            <line x1="12" y1="140" x2="28" y2="140" />
            {/* Right Pins */}
            <line x1="172" y1="60" x2="188" y2="60" />
            <line x1="172" y1="100" x2="188" y2="100" />
            <line x1="172" y1="140" x2="188" y2="140" />
          </g>

          {/* IC Index Notch Circle */}
          <circle cx="48" cy="48" r="5" fill="#38BDF8" />

          {/* Etched Omega Arch */}
          <path
            d="M 54 136 H 74 C 74 92, 78 62, 100 62 C 122 62, 126 92, 126 136 H 146"
            stroke={`url(#gradSecondary_${uid})`}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />

          {/* Etched V-Path */}
          <path
            d="M 74 86 L 100 132 L 126 86"
            stroke={isPureWhite ? '#FFFFFF' : `url(#gradV_${uid})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Center Gold LED Star */}
          <circle cx="100" cy="100" r="7" fill={`url(#gradGold_${uid})`} />
        </svg>
      );
    }

    // STYLE 4: MINIMALIST SPEED CREST
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
        aria-label="OhmVeda Minimalist Speed Emblem"
      >
        {sharedDefs}
        {/* Outer Omega Arch Sweep */}
        <path
          d="M 28 148 C 28 64, 52 28, 100 28 C 148 28, 172 64, 172 148"
          stroke={isPureWhite ? '#FFFFFF' : `url(#gradPrimary_${uid})`}
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
        />

        {/* Dynamic Interlocking V Blade */}
        <path
          d="M 52 76 L 100 160 L 148 76"
          stroke={`url(#gradSecondary_${uid})`}
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Center Golden Core Bolt Node */}
        <polygon points="100,56 108,82 100,108 92,82" fill={`url(#gradGold_${uid})`} />
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

        {/* Brand Name Title */}
        {isTextEnabled && (textOhm || textVeda) && (
          <div className={`font-extrabold tracking-tight flex items-baseline justify-center leading-none whitespace-nowrap ${sizeConfig.text}`}>
            {textOhm && <span className={ohmTextColor}>{textOhm}</span>}
            {textVeda && <span className={textOhm ? vedaTextColor : ohmTextColor}>{textVeda}</span>}
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

      {/* Text column */}
      {(isTextEnabled || showSubtitle || showTagline) && (
        <div className="flex flex-col leading-none justify-center shrink-0">
          {isTextEnabled && (textOhm || textVeda) && (
            <div className={`font-extrabold tracking-tight flex items-baseline leading-none whitespace-nowrap ${sizeConfig.text}`}>
              {textOhm && <span className={ohmTextColor}>{textOhm}</span>}
              {textVeda && <span className={textOhm ? vedaTextColor : ohmTextColor}>{textVeda}</span>}
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
