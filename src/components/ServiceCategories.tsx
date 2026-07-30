import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Code2, Wifi, Microscope, Check, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/companyData';
import { ServiceCategory } from '../types';

interface ServiceCategoriesProps {
  onOpenInquiry: (category?: string) => void;
}

export const ServiceCategories: React.FC<ServiceCategoriesProps> = ({ onOpenInquiry }) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(SERVICE_CATEGORIES[0]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'Code2': return <Code2 className="w-6 h-6" />;
      case 'Wifi': return <Wifi className="w-6 h-6" />;
      case 'Microscope': return <Microscope className="w-6 h-6" />;
      default: return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <section id="services" className="py-20 bg-white text-slate-900 border-b border-slate-200">
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
            Our Services
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Organized into four specialized disciplines to cater to both standalone digital applications and full hardware-embedded IoT solutions.
          </p>
        </motion.div>

        {/* 4 Category Selector Tabs matching footer bar design style */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat, index) => {
            const isSelected = selectedCategory.id === cat.id;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat)}
                className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-white border-2 border-blue-600 shadow-md text-slate-900'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-extrabold font-mono ${
                      isSelected ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {cat.code}
                    </span>
                    <div className={`p-2.5 rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-700 group-hover:bg-slate-300/80'
                    }`}>
                      {getCategoryIcon(cat.iconName)}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                    {isSelected ? 'Active View' : 'Explore Details'}
                  </span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${
                    isSelected ? 'translate-x-1 text-blue-600' : 'text-slate-400 group-hover:translate-x-0.5'
                  }`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Category In-Depth Overview Panel */}
        <div className="mt-10 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Info Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold font-mono text-blue-600">
                    {selectedCategory.code}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedCategory.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-blue-700 font-bold">
                  "{selectedCategory.tagline}"
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedCategory.description}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Category Highlights:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCategory.highlightFeatures.map((feature, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-semibold flex items-center gap-2 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquiry(selectedCategory.id)}
                    className="w-full py-3.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Request Proposal for Category {selectedCategory.code}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Right Deliverables & Tech Stack */}
              <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-slate-200 lg:pl-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Key Deliverables & Services</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedCategory.deliverables.map((del, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 flex items-start gap-2.5 shadow-2xs">
                        <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                          ✓
                        </span>
                        <span className="text-xs text-slate-800 font-medium leading-snug">{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">
                    Technology Stack & Tools
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.techStack.map((tech, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-bold shadow-2xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

