import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Code2, Wifi, Zap, ArrowRight, Layers, Smartphone } from 'lucide-react';
import { COMPANY_INFO } from '../data/companyData';

interface HeroSectionProps {
  onOpenInquiry: (category?: string) => void;
  onExploreCapabilities: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenInquiry, onExploreCapabilities }) => {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative bg-slate-900 text-slate-100 overflow-hidden pt-16 pb-20 border-b border-slate-800">
      {/* Background Tech Grids & Subtle Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.h1 
            id="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white"
          >
            Engineering Hardware.{' '}
            <span className="text-blue-500">Building Software.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal"
          >
            {COMPANY_INFO.heroDescription}
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            className="text-sm text-slate-400 max-w-2xl mx-auto font-medium"
          >
            {COMPANY_INFO.heroSecondary}
          </motion.p>

          {/* Primary CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
            className="pt-4 flex items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenInquiry()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Core Pillars */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.45,
                }
              }
            }}
            className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left"
          >
            {[
              { icon: Cpu, label: 'PCB & Firmware' },
              { icon: Code2, label: 'Web & Backend' },
              { icon: Smartphone, label: 'Android Apps' },
              { icon: Wifi, label: 'Connected IoT' },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3 shadow-xs"
                >
                  <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-semibold">{pillar.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
};

