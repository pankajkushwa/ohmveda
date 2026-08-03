import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowRight, CheckCircle2, Copy, Check, Send, Cpu, Code2, ShoppingBag, ExternalLink, Mail, Loader2 } from 'lucide-react';
import { ProjectInquiry, CartItem } from '../types';
import { COMPANY_INFO } from '../data/companyData';
import { saveStoredLeadInquiry } from '../services/dataStorage';
import { sendInquiryNotificationEmail, getGmailComposeUrl, getMailtoUrl } from '../services/emailService';

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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setIsSendingEmail(false);
      setEmailStatusMsg(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        projectCategory: (initialCategory as any) || 'connected_product',
        budgetRange: '₹50,000 - ₹1,50,000',
        timeline: '1 Month',
        description: '',
        selectedModules: initialModules || [],
      });
    }
  }, [isOpen, initialCategory, initialModules]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSendingEmail(true);

    // 1. Save lead inquiry to persistent storage for admin panel inbox
    saveStoredLeadInquiry({
      source: 'project_modal',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      subject: `Project Proposal: ${formData.projectCategory.replace('_', ' ').toUpperCase()}`,
      projectCategory: formData.projectCategory,
      budgetRange: formData.budgetRange,
      timeline: formData.timeline,
      description: formData.description || 'Custom project consultation request.',
      selectedModules: formData.selectedModules || [],
    });

    if (cart && cart.length > 0 && onOrderPlaced) {
      onOrderPlaced(cart);
    }

    setSubmitted(true);

    // 2. Dispatch automated email in background
    const emailRes = await sendInquiryNotificationEmail({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      subject: `Project Brief Proposal from ${formData.name}`,
      projectCategory: formData.projectCategory,
      budgetRange: formData.budgetRange,
      timeline: formData.timeline,
      description: formData.description || 'Custom project consultation request.',
      selectedModules: formData.selectedModules || [],
      source: 'Project Proposal Modal',
    });

    setIsSendingEmail(false);
    setEmailStatusMsg(emailRes.message);
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
          <div className="text-center space-y-6 py-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Proposal Submitted!</h3>
              <p className="text-sm font-semibold text-emerald-700 max-w-md mx-auto bg-emerald-50 py-2.5 px-4 rounded-xl border border-emerald-200/80">
                Proposal submitted! Our team will contact you soon.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto pt-1">
                Thank you, <span className="text-slate-900 font-bold">{formData.name}</span>. Your project brief has been registered in our pipeline and dispatched directly to engineering.
              </p>
            </div>

            {/* Email Dispatch Status Banner */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center text-xs flex items-center justify-center gap-2 text-emerald-800 font-bold">
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Sending email...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Email sent</span>
                </>
              )}
            </div>

            {/* Main Action Button */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Back to Website
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
