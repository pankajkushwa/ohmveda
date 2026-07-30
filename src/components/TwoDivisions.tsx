import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Code2, Check, ArrowRight, ShieldCheck, Zap, Layers, ChevronRight, Info, Search } from 'lucide-react';
import { ELECTRONICS_DIVISION_ITEMS, SOFTWARE_DIVISION_ITEMS } from '../data/companyData';
import { DivisionItem } from '../types';

interface TwoDivisionsProps {
  onOpenInquiry: (category?: string) => void;
}

export const TwoDivisions: React.FC<TwoDivisionsProps> = ({ onOpenInquiry }) => {
  const [activeItem, setActiveItem] = useState<DivisionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredElectronics = ELECTRONICS_DIVISION_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSoftware = SOFTWARE_DIVISION_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section id="divisions" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-blue-50 border border-blue-100 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Complete Engineering Spectrum</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            One Technology Partner. Complete Product Development.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Eliminate communication gaps between separate electronics design houses and software agencies. OhmVeda Technologies houses both divisions under one unified engineering framework.
          </p>
        </motion.div>

        {/* Quick Search */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 max-w-md mx-auto"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter capabilities (e.g., PCB, Android, Firmware, SaaS)..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Two Major Divisions Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* DIVISION 1: ELECTRONICS & EMBEDDED ENGINEERING */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden"
          >
            <div>
              {/* Division Header matching Design HTML */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
                <div className="w-10 h-[2px] bg-blue-600"></div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-600">
                  Electronics & Embedded Division
                </h3>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredElectronics.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {item.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">11 Core Capabilities</span>
              <button
                onClick={() => onOpenInquiry('electronics_embedded')}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Inquire Electronics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* DIVISION 2: SOFTWARE & IT SOLUTIONS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden"
          >
            <div>
              {/* Division Header matching Design HTML */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
                <div className="w-10 h-[2px] bg-emerald-500"></div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-600">
                  Software & IT Solutions Division
                </h3>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredSoftware.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {item.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">12 Core Capabilities</span>
              <button
                onClick={() => onOpenInquiry('standalone_software')}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Inquire Software</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* Modal Detail Viewer when clicking an Item */}
        {activeItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg font-bold ${
                    activeItem.category === 'electronics' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {activeItem.category === 'electronics' ? <Cpu className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      {activeItem.category === 'electronics' ? 'Electronics Division' : 'Software Division'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{activeItem.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveItem(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeItem.description}
              </p>

              {activeItem.details && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Key Technical Scope:</h4>
                  <ul className="space-y-1.5">
                    {activeItem.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const cat = activeItem.category === 'electronics' ? 'electronics_embedded' : 'standalone_software';
                    setActiveItem(null);
                    onOpenInquiry(cat);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md"
                >
                  Inquire For This Capability
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
