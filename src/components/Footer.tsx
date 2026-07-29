import React, { useState, useEffect } from 'react';
import { 
  Cpu, Mail, ArrowUp, Code2, Wifi, Zap, Linkedin, Github, Youtube, Twitter, 
  Instagram, Facebook, MessageCircle, MessageSquare, Send, Globe, ExternalLink 
} from 'lucide-react';
import { COMPANY_INFO } from '../data/companyData';
import { OhmVedaLogo } from './OhmVedaLogo';
import { getStoredCompanyContact, getStoredSocialLinks } from '../services/dataStorage';
import { SocialLink } from '../types';

interface FooterProps {
  onOpenInquiry: () => void;
  onNavigate: (page: 'home' | 'products' | 'store' | 'careers', sectionId?: string) => void;
}

const renderSocialIcon = (iconName?: string, platform?: string) => {
  const p = (platform || '').toLowerCase();
  const name = (iconName || '').toLowerCase();

  if (p.includes('linkedin') || name === 'linkedin') return <Linkedin className="w-4 h-4" />;
  if (p.includes('github') || name === 'github') return <Github className="w-4 h-4" />;
  if (p.includes('youtube') || name === 'youtube') return <Youtube className="w-4 h-4" />;
  if (p.includes('twitter') || p.includes('x') || name === 'twitter') return <Twitter className="w-4 h-4" />;
  if (p.includes('instagram') || name === 'instagram') return <Instagram className="w-4 h-4" />;
  if (p.includes('facebook') || name === 'facebook') return <Facebook className="w-4 h-4" />;
  if (p.includes('whatsapp') || name === 'messagecircle') return <MessageCircle className="w-4 h-4" />;
  if (p.includes('discord') || name === 'messagesquare') return <MessageSquare className="w-4 h-4" />;
  if (p.includes('telegram') || name === 'send') return <Send className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
};

export const Footer: React.FC<FooterProps> = ({ onOpenInquiry, onNavigate }) => {
  const [contactEmail, setContactEmail] = useState<string>(() => getStoredCompanyContact().email);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => 
    getStoredSocialLinks().filter((l) => l.enabled && l.url.trim())
  );

  useEffect(() => {
    const handleUpdate = () => {
      setContactEmail(getStoredCompanyContact().email);
    };
    const handleSocialUpdate = () => {
      setSocialLinks(getStoredSocialLinks().filter((l) => l.enabled && l.url.trim()));
    };

    window.addEventListener('ohmveda_contact_info_updated', handleUpdate);
    window.addEventListener('ohmveda_social_links_updated', handleSocialUpdate);

    return () => {
      window.removeEventListener('ohmveda_contact_info_updated', handleUpdate);
      window.removeEventListener('ohmveda_social_links_updated', handleSocialUpdate);
    };
  }, []);

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
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-800 hover:text-blue-600 transition-colors p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 w-full"
            >
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{contactEmail}</span>
            </a>

            {/* Connect Social Links in Connect section if present */}
            {socialLinks.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-2">Follow Us</span>
                <div className="flex flex-wrap items-center gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={`connect-${social.id}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white transition-all duration-200 border border-slate-200 hover:border-blue-600 hover:shadow-xs"
                    >
                      {renderSocialIcon(social.iconName, social.platform)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onOpenInquiry}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md cursor-pointer mt-2"
            >
              Start Your Project
            </button>
          </div>

        </div>

        {/* Bottom Bar with Social Media */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-medium">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p>© {new Date().getFullYear()} OhmVeda. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <p className="text-slate-500 text-[11px] font-mono">
              {COMPANY_INFO.alternativeTaglines[0]}
            </p>
          </div>
          
          {/* Bottom Bar Social Media Badges */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">Socials:</span>
              {socialLinks.map((social) => (
                <a
                  key={`bottom-${social.id}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${social.platform} - ${social.url}`}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white transition-all duration-150 flex items-center justify-center"
                >
                  {renderSocialIcon(social.iconName, social.platform)}
                </a>
              ))}
            </div>
          )}

          <button
            onClick={scrollToTop}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>

      </div>
    </footer>
  );
};

