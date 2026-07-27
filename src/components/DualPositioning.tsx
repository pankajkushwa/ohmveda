import React, { useState } from 'react';
import { Code2, Cpu, CheckCircle2, ArrowRight, Smartphone, Server, Globe, Wifi, Layers, Zap } from 'lucide-react';

interface DualPositioningProps {
  onOpenInquiry: (category?: string) => void;
}

export const DualPositioning: React.FC<DualPositioningProps> = ({ onOpenInquiry }) => {
  const [selectedPath, setSelectedPath] = useState<'both' | 'software' | 'product'>('both');

  return (
    <section id="positioning" className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-xs text-cyan-300 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dual Engineering Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Flexible Engagement: Standalone Digital or Complete Hardware Ecosystems
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Whether you need a modern web application, an Android mobile app, or a full connected physical device with PCB and firmware—OhmVeda Technologies eliminates vendor fragmentation by mastering both domains.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setSelectedPath('both')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedPath === 'both'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Compare Both Tracks
            </button>
            <button
              onClick={() => setSelectedPath('software')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedPath === 'software'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A. Standalone Software
            </button>
            <button
              onClick={() => setSelectedPath('product')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedPath === 'product'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              B. Complete Technology Products
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Track A: Standalone Software Projects */}
          {(selectedPath === 'both' || selectedPath === 'software') && (
            <div className="rounded-2xl bg-slate-950/80 border border-indigo-500/30 p-6 sm:p-8 relative overflow-hidden group hover:border-indigo-500/60 transition-all shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Option A</span>
                    <h3 className="text-xl font-bold text-white">Standalone Software Projects</h3>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Pure Digital
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                Ideal for companies requiring top-tier web apps, mobile apps, SaaS platforms, corporate websites, or custom API backends without physical hardware.
              </p>

              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase text-slate-400 font-mono">Deliverable Scope:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-200">
                    <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Corporate & E-commerce Websites</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-200">
                    <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Custom Web Applications</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-200">
                    <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Android & Mobile Apps</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-200">
                    <Server className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>REST Backend & Databases</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-200">
                    <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Responsive Frontend UI/UX</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-200">
                    <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Cloud SaaS Platforms</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Turnaround: 2 - 4 Weeks</span>
                <button
                  onClick={() => onOpenInquiry('standalone_software')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
                >
                  <span>Build Standalone Software</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Track B: Complete Technology Products */}
          {(selectedPath === 'both' || selectedPath === 'product') && (
            <div className="rounded-2xl bg-slate-950/80 border border-emerald-500/30 p-6 sm:p-8 relative overflow-hidden group hover:border-emerald-500/60 transition-all shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Option B</span>
                    <h3 className="text-xl font-bold text-white">Complete Technology Products</h3>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Hardware + Cloud + App
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                Full hardware-to-cloud product development. We build the physical circuit, flash firmware, configure wireless IoT brokers, and deliver the web and Android apps.
              </p>

              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase text-slate-400 font-mono">Full Ecosystem Stack:</h4>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-800">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">1. Electronics Hardware & PCB Design</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-800">
                      <Code2 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">2. Low-Power Embedded Firmware</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-800">
                      <Wifi className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">3. IoT Connectivity (Wi-Fi, BLE, 4G, LoRa)</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-800">
                      <Server className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">4. Cloud Backend & API Infrastructure</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-800">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">5. Web Dashboard & Android Application</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">End-to-End Delivery</span>
                <button
                  onClick={() => onOpenInquiry('connected_product')}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <span>Build Connected Product</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
