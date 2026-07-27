import React from 'react';
import { motion } from 'motion/react';
import { COMPANY_INFO } from '../data/companyData';
import { Target, Cloud, Code, Layers, Terminal, Smartphone, Database, Cpu, Laptop, Globe } from 'lucide-react';

interface AboutSectionProps {
  onOpenInquiry?: () => void;
}

// Row 1 Tech Stack (Software & Cloud) - Scrolls Right to Left
const row1Techs = [
  { name: 'AWS', icon: Cloud },
  { name: 'React', icon: Code },
  { name: 'Next.js', icon: Layers },
  { name: 'Node.js', icon: Terminal },
  { name: 'Python', icon: Code },
  { name: 'TypeScript', icon: Code },
  { name: 'Flutter', icon: Smartphone },
  { name: 'Firebase', icon: Cloud },
  { name: 'Docker', icon: Layers },
  { name: 'PostgreSQL', icon: Database },
];

// Row 2 Tech Stack (Hardware, Embedded & Systems) - Scrolls Left to Right
const row2Techs = [
  { name: 'Arduino', icon: Cpu },
  { name: 'ESP32', icon: Cpu },
  { name: 'STM32', icon: Cpu },
  { name: 'Raspberry Pi', icon: Cpu },
  { name: 'Kotlin', icon: Smartphone },
  { name: 'PostgreSQL', icon: Database },
  { name: 'Docker', icon: Layers },
  { name: 'Linux', icon: Laptop },
  { name: 'Embedded C/C++', icon: Cpu },
  { name: 'MQTT / IoT', icon: Globe },
];

export const AboutSection: React.FC<AboutSectionProps> = () => {
  return (
    <section id="about" className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            About OhmVeda Technologies
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            {COMPANY_INFO.positioningTitle}
          </p>
        </motion.div>

        {/* Narrative Box */}
        <div className="mt-12 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6"
          >
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {COMPANY_INFO.aboutUsPositioning}
            </p>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {COMPANY_INFO.aboutUsMission}
            </p>
          </motion.div>
        </div>

      </div>

      {/* OUR TECH STACK SECTION (Directly below About) */}
      <div className="mt-20 pt-10 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Tech Stack
          </h3>
          <p className="text-slate-500 text-sm font-normal">
            Battle-tested technologies we use to build robust solutions
          </p>
        </div>

        {/* MARQUEE CONTAINER WITH FADE OVERLAYS */}
        <div className="relative w-full overflow-hidden space-y-4 py-2">
          
          {/* Left/Right Subtle Fade Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

          {/* ROW 1: RIGHT TO LEFT (Leftwards scroll) */}
          <div className="flex overflow-hidden">
            <div className="animate-marquee-left flex items-center gap-3">
              {[...row1Techs, ...row1Techs, ...row1Techs].map((tech, index) => {
                const IconComponent = tech.icon;
                return (
                  <div
                    key={`r1-${index}`}
                    className="px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-2xs hover:border-blue-500 hover:text-blue-600 transition-all shrink-0 cursor-default"
                  >
                    <IconComponent className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROW 2: LEFT TO RIGHT (Rightwards scroll) */}
          <div className="flex overflow-hidden">
            <div className="animate-marquee-right flex items-center gap-3">
              {[...row2Techs, ...row2Techs, ...row2Techs].map((tech, index) => {
                const IconComponent = tech.icon;
                return (
                  <div
                    key={`r2-${index}`}
                    className="px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-2xs hover:border-blue-500 hover:text-blue-600 transition-all shrink-0 cursor-default"
                  >
                    <IconComponent className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};
