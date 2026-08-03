import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, Building, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { getStoredCompanyContact, saveStoredLeadInquiry } from '../services/dataStorage';
import { CompanyContactInfo } from '../types';
import { sendInquiryNotificationEmail } from '../services/emailService';

interface ContactSectionProps {
  onOpenInquiry: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenInquiry }) => {
  const [contactInfo, setContactInfo] = useState<CompanyContactInfo>(getStoredCompanyContact());

  useEffect(() => {
    const handleUpdate = () => {
      setContactInfo(getStoredCompanyContact());
    };
    window.addEventListener('ohmveda_contact_info_updated', handleUpdate);
    return () => window.removeEventListener('ohmveda_contact_info_updated', handleUpdate);
  }, []);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.email || !formState.name) return;
    
    setIsSending(true);

    saveStoredLeadInquiry({
      source: 'contact_form',
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      subject: formState.subject,
      description: formState.message || `Inquiry topic: ${formState.subject}`,
    });

    sendInquiryNotificationEmail({
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      subject: formState.subject || 'Website Direct Message',
      description: formState.message || `Inquiry topic: ${formState.subject}`,
      source: 'Website Contact Section',
    }).catch((err) => console.error('Contact email dispatch error:', err));

    setIsSending(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    }, 6000);
  };

  return (
    <section id="contact" className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Get in Touch With Our Engineers
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Have a project in mind, need technical assistance, or looking for component procurement? Reach out to us directly.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Info & Address Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-4"
          >
            
            {/* Primary Email Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-3 hover:border-blue-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Email Address</span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  <a href={`mailto:${contactInfo.email}`} className="hover:text-blue-400 transition-colors">
                    {contactInfo.email}
                  </a>
                </h4>
                <p className="text-xs text-slate-400 mt-1">For project proposals, RFQs, technical support, and component inquiries.</p>
              </div>
            </div>

            {/* Phone & Direct Desk */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-3 hover:border-blue-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Direct Phone & WhatsApp</span>
                <h4 className="text-base font-bold text-white mt-0.5 font-mono">
                  {contactInfo.phone}
                  {contactInfo.phoneSecondary ? ` / ${contactInfo.phoneSecondary}` : ''}
                </h4>
              </div>
            </div>

            {/* Address & Corporate Office */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-3 hover:border-blue-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">{contactInfo.addressTitle || 'Engineering Office & R&D Lab'}</span>
                <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                  {contactInfo.companyName}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {contactInfo.addressLine1}
                  {contactInfo.addressLine2 && <><br />{contactInfo.addressLine2}</>}
                </p>
              </div>
            </div>

          </motion.div>


          {/* Right: Quick Direct Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-md"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Send Us a Direct Message</h3>
                <p className="text-xs text-slate-400">Fill out this quick form and our team will get back to you within 24 hours.</p>
              </div>
              <Building className="w-6 h-6 text-blue-400" />
            </div>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-center space-y-3"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-black text-white">Proposal submitted!</h4>
                <p className="text-sm font-semibold text-emerald-300 bg-emerald-900/40 py-2 px-4 rounded-lg inline-block border border-emerald-600/30">
                  Our team will contact you soon.
                </p>
                <p className="text-xs text-slate-300 pt-2">
                  Thank you for reaching out to OhmVeda Technologies. Your message has been sent directly to our engineering team.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      placeholder="+91 / +1..."
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Inquiry Topic</label>
                    <select
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="General Inquiry">General Technical Inquiry</option>
                      <option value="Hardware Development">Hardware & Embedded PCB</option>
                      <option value="Software & Mobile App">Web / Mobile / Cloud App</option>
                      <option value="IoT Automation">IoT & Automation Project</option>
                      <option value="Component Purchase">Component Bulk Order</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Briefly describe your requirements or inquiry..."
                    className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={onOpenInquiry}
                    className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Or request a full formal proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>We value your privacy. Your contact details will never be shared with third parties.</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

