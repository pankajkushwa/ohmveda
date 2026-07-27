import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowRight, CheckCircle2, Copy, Check, Send, Cpu, Code2, ShoppingBag } from 'lucide-react';
import { ProjectInquiry, CartItem } from '../types';
import { COMPANY_INFO } from '../data/companyData';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialModules?: string[];
  initialType?: string;
  cart?: CartItem[];
  onOrderPlaced?: (cart: CartItem[]) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'connected_product',
  initialModules = [],
  initialType = 'iot_product',
  cart = [],
  onOrderPlaced,
}) => {
  const [formData, setFormData] = useState<ProjectInquiry>({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectCategory: (initialCategory as any) || 'connected_product',
    budgetRange: '$5,000 - $15,000',
    timeline: '1 - 2 Months',
    description: '',
    selectedModules: initialModules,
  });

  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setFormData((prev) => ({
        ...prev,
        projectCategory: initialCategory as any,
        selectedModules: initialModules,
      }));
    }
  }, [initialCategory, initialModules]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart && cart.length > 0 && onOrderPlaced) {
      onOrderPlaced(cart);
    }
    setSubmitted(true);
  };

  const generateBriefText = () => {
    return `=============================================
OHMVEDA TECHNOLOGIES - PROJECT INQUIRY BRIEF
=============================================
Client Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'N/A'}
Company: ${formData.company || 'N/A'}

Project Description:
${formData.description || 'No additional details provided.'}

=============================================
Recipient: ${COMPANY_INFO.contactEmail}
Date: ${new Date().toLocaleDateString()}
=============================================`;
  };

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(generateBriefText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold font-mono text-blue-600 uppercase tracking-wider">OhmVeda Engineering Team</span>
                <h3 className="text-xl font-bold text-slate-900">Start Your Project Consultation</h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 or +91..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company or Startup Name"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Requirements & Scope Summary</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product idea, hardware specifications, web/mobile app features, or business goals..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg p-3.5 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 fill-white text-white" />
                  <span>Submit Inquiry Brief</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Project Brief Generated!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you, <span className="text-blue-600 font-bold">{formData.name}</span>. Our engineering team at OhmVeda Technologies has received your project details.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left font-mono text-xs text-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap shadow-2xs">
              {generateBriefText()}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCopyBrief}
                className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 border border-slate-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Brief Details'}</span>
              </button>

              <a
                href={`mailto:${COMPANY_INFO.contactEmail}?subject=Project%20Inquiry%20-%20${encodeURIComponent(formData.name)}&body=${encodeURIComponent(generateBriefText())}`}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Email Directly to Engineering</span>
              </a>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Return to Website
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
