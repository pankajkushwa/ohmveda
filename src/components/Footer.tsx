import React from 'react';
import { Cpu, Mail, ArrowUp, Code2, Wifi, Zap } from 'lucide-react';
import { COMPANY_INFO } from '../data/companyData';
import { OhmVedaLogo } from './OhmVedaLogo';

interface FooterProps {
  onOpenInquiry: () => void;
  onNavigate: (page: 'home' | 'products' | 'store' | 'careers', sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInquiry, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLink = (page: 'home' | 'products' | 'store' | 'careers', sectionId: string = 'hero') => {
    onNavigate(page, sectionId);
  };

  return (
    <footer className="bg-white text-slate-900 border-t border-slate-200 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <OhmVedaLogo variant="light" size="xl" showSubtitle={false} showTagline={false} />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              OhmVeda is a multidisciplinary technology partner delivering innovative solutions across electronics, embedded systems, IoT, web platforms, mobile applications, and custom R&D.
            </p>

            {/* Tagline Highlight */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold font-mono text-blue-600 uppercase block">Official Brand Tagline</span>
              <p className="text-xs font-bold text-slate-800">
                "{COMPANY_INFO.tagline}"
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-blue-600 tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => handleLink('home', 'hero')} className="hover:text-blue-600 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('products', 'products')} className="hover:text-blue-600 transition-colors">
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('home', 'services')} className="hover:text-blue-600 transition-colors">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('store', 'store')} className="hover:text-blue-600 transition-colors">
                  Store
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('careers')} className="hover:text-teal-600 transition-colors text-teal-600 font-semibold">
                  Careers
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('home', 'about')} className="hover:text-blue-600 transition-colors">
                  About OhmVeda
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('home', 'contact')} className="hover:text-blue-600 transition-colors">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Divisions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-blue-600 tracking-wider">Engineering Divisions</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Electronics & Embedded</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Software & IT Solutions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>IoT & Automation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>R&D & Product Engineering</span>
              </li>
            </ul>
          </div>

          {/* Contact & Inquiry */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Connect</h4>
            <p className="text-xs text-slate-600">
              Have a hardware or software project in mind? Reach out to our engineering leads.
            </p>

            <a
              href={`mailto:${COMPANY_INFO.contactEmail}`}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-800 hover:text-blue-600 transition-colors p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 w-full"
            >
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{COMPANY_INFO.contactEmail}</span>
            </a>

            <button
              onClick={onOpenInquiry}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md cursor-pointer"
            >
              Start Your Project
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-medium">
          <p>© {new Date().getFullYear()} OhmVeda. All rights reserved.</p>
          
          <p className="text-slate-500 text-[11px] font-mono text-center">
            {COMPANY_INFO.alternativeTaglines[0]}
          </p>

          <button
            onClick={scrollToTop}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>

      </div>
    </footer>
  );
};
