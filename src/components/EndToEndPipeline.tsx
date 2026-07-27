import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Network, Cpu, Terminal, Wifi, Server, Monitor, Smartphone, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { PIPELINE_STAGES } from '../data/companyData';
import { PipelineStage } from '../types';

interface EndToEndPipelineProps {
  onOpenInquiry: (category?: string) => void;
}

export const EndToEndPipeline: React.FC<EndToEndPipelineProps> = ({ onOpenInquiry }) => {
  const [selectedStage, setSelectedStage] = useState<PipelineStage>(PIPELINE_STAGES[0]);

  const getStageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Lightbulb': return <Lightbulb className="w-5 h-5" />;
      case 'Network': return <Network className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'Wifi': return <Wifi className="w-5 h-5" />;
      case 'Server': return <Server className="w-5 h-5" />;
      case 'Monitor': return <Monitor className="w-5 h-5" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <section id="process" className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            End-To-End Technology Solutions
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            From initial sketch to full-scale hardware deployment and app store releases, OhmVeda Technologies connects all 9 stages under one roof. No vendor fragmentation, no integration friction.
          </p>
        </motion.div>

        {/* Pipeline Diagram Sequence */}
        <div className="mt-12 overflow-x-auto pb-4">
          <div className="flex items-center justify-between min-w-[900px] gap-2 px-2">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isSelected = selectedStage.id === stage.id;
              return (
                <React.Fragment key={stage.id}>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedStage(stage)}
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all duration-200 text-center relative group cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-105 z-10'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-transform ${
                      isSelected
                        ? 'bg-white text-blue-600 font-bold scale-105'
                        : 'bg-slate-900 text-blue-400 group-hover:scale-105'
                    }`}>
                      {getStageIcon(stage.icon)}
                    </div>
                    
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      0{stage.step}
                    </span>
                    
                    <span className={`text-[11px] font-bold mt-0.5 leading-tight ${
                      isSelected ? 'text-white' : 'text-slate-200'
                    }`}>
                      {stage.title}
                    </span>

                    <span className={`text-[9px] mt-1 font-mono uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-blue-700 text-white'
                        : stage.hardwareOrSoftware === 'hardware'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                        : stage.hardwareOrSoftware === 'software'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {stage.hardwareOrSoftware}
                    </span>
                  </motion.button>

                  {idx < PIPELINE_STAGES.length - 1 && (
                    <div className="flex items-center justify-center text-slate-700 shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500/70" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Interactive Detail Card */}
        <div className="mt-6 bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Stage Summary */}
              <div className="lg:col-span-1 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                    {getStageIcon(selectedStage.icon)}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-blue-400 font-bold uppercase">
                      Stage 0{selectedStage.step} of 09
                    </span>
                    <h3 className="text-xl font-bold text-white">{selectedStage.title}</h3>
                  </div>
                </div>

                <p className="text-xs font-semibold text-emerald-400">
                  {selectedStage.subtitle}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedStage.description}
                </p>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquiry('connected_product')}
                    className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Start at Stage 0{selectedStage.step}</span>
                  </motion.button>
                </div>
              </div>

              {/* Middle Key Deliverable Outputs */}
              <div className="lg:col-span-1 space-y-3">
                <h4 className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Stage Engineering Deliverables</span>
                </h4>
                <div className="space-y-2">
                  {selectedStage.keyOutputs.map((output, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-xs text-slate-200 font-medium">{output}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Tools & Stack */}
              <div className="lg:col-span-1 space-y-3">
                <h4 className="text-xs font-mono uppercase text-indigo-400 font-semibold tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Technologies & Tools Employed</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStage.toolsAndTech.map((tool, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="text-white font-semibold block">Why One Technology Partner Matters:</span>
                  <p>
                    Building hardware with Vendor X and software with Vendor Y causes delay and finger-pointing when firmware protocol bugs arise. At OhmVeda Technologies, hardware engineers sit next to cloud and mobile developers to resolve issues instantly.
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

