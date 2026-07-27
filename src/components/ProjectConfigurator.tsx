import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Cpu, Code2, Wifi, Smartphone, Server, Layers, Calculator, Zap, ShieldCheck } from 'lucide-react';
import { CONFIGURATOR_OPTIONS } from '../data/companyData';

interface ProjectConfiguratorProps {
  onOpenInquiryWithConfig: (selectedIds: string[], projectType: string) => void;
}

export const ProjectConfigurator: React.FC<ProjectConfiguratorProps> = ({ onOpenInquiryWithConfig }) => {
  const [projectType, setProjectType] = useState<'standalone_app' | 'iot_product'>('iot_product');
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'pcb_design',
    'firmware',
    'ble_wifi',
    'web_dashboard',
    'android_app',
    'cloud_backend',
  ]);

  const toggleModule = (id: string) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter((m) => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  // Calculate estimated timeline days
  const totalDays = selectedModules.reduce((acc, curr) => {
    const opt = CONFIGURATOR_OPTIONS.find((o) => o.id === curr);
    return acc + (opt ? opt.timeDays : 0);
  }, projectType === 'iot_product' ? 30 : 18);

  return (
    <section id="configurator" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-blue-50 border border-blue-100 text-[11px] text-blue-700 font-bold uppercase tracking-[0.18em]">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Solution Blueprinting</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Configure Your Custom Architecture
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Select your technology requirements below to generate an instant architecture blueprint and estimated development timeline.
          </p>
        </div>

        {/* Project Type Switcher */}
        <div className="mt-10 max-w-xl mx-auto grid grid-cols-2 gap-4">
          <div
            onClick={() => {
              setProjectType('iot_product');
              if (!selectedModules.includes('pcb_design')) {
                setSelectedModules(['pcb_design', 'firmware', 'ble_wifi', 'web_dashboard', 'android_app', 'cloud_backend']);
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center ${
              projectType === 'iot_product'
                ? 'bg-white border-2 border-blue-600 shadow-md text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs font-bold text-slate-900">Complete Connected IoT Product</span>
            <span className="text-[10px] text-slate-500 mt-1 font-medium">Hardware PCB + Firmware + Cloud + Mobile App</span>
          </div>

          <div
            onClick={() => {
              setProjectType('standalone_app');
              setSelectedModules(['web_dashboard', 'android_app', 'cloud_backend']);
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center ${
              projectType === 'standalone_app'
                ? 'bg-white border-2 border-blue-600 shadow-md text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs font-bold text-slate-900">Standalone Software Project</span>
            <span className="text-[10px] text-slate-500 mt-1 font-medium">Web Application, Android App & REST Backend</span>
          </div>
        </div>

        {/* Module Picker Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Module Options List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center justify-between tracking-wider">
              <span>Select Required Engineering Modules:</span>
              <span className="text-blue-600 font-bold">{selectedModules.length} Selected</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONFIGURATOR_OPTIONS.filter((opt) => opt.category !== 'type').map((option) => {
                const isSelected = selectedModules.includes(option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => toggleModule(option.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-2 border-blue-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white font-bold text-xs' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && '✓'}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{option.name}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{option.description}</p>
                      <span className="text-[10px] font-bold text-blue-600 mt-2 block">
                        Est. Timeline: +{option.timeDays} Days
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Architecture Summary Box */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-200">
                <span className="text-[10px] font-bold font-mono text-blue-600 uppercase">Configured Architecture</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {projectType === 'iot_product' ? 'Connected Hardware Product Architecture' : 'Standalone Software Application'}
                </h3>
              </div>

              {/* Selected Modules Summary */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500 block tracking-wider">Included Layers:</span>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedModules.map((mId) => {
                    const opt = CONFIGURATOR_OPTIONS.find((o) => o.id === mId);
                    if (!opt) return null;
                    return (
                      <div key={mId} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                        <span className="text-slate-800 font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{opt.name}</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">+{opt.timeDays}d</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Indicator */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Estimated Development & Integration Timeline</span>
                <div className="text-2xl font-extrabold text-blue-600 font-mono">
                  ~ {totalDays} Business Days
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Includes engineering review, hardware/software development, and end-to-end testing.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <button
                onClick={() => onOpenInquiryWithConfig(selectedModules, projectType)}
                className="w-full py-4 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white text-white" />
                <span>Submit Blueprint For Custom Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
