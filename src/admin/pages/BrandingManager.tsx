import React, { useState } from 'react';
import { 
  Image, Upload, Save, RefreshCw, CheckCircle2, Mail, Phone, MapPin, Building,
  Share2, Globe, Linkedin, Github, Youtube, Twitter, Instagram, Facebook, 
  MessageCircle, MessageSquare, Send, Plus, Trash2, ExternalLink, Sliders
} from 'lucide-react';
import { OhmVedaLogo } from '../../components/OhmVedaLogo';
import { 
  addAdminLog, getStoredCustomLogo, saveStoredCustomLogo,
  getStoredCompanyContact, saveStoredCompanyContact, DEFAULT_COMPANY_CONTACT,
  getStoredSocialLinks, saveStoredSocialLinks, DEFAULT_SOCIAL_LINKS
} from '../../services/dataStorage';
import { CompanyContactInfo, SocialLink } from '../../types';

interface BrandingManagerProps {
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
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

export const BrandingManager: React.FC<BrandingManagerProps> = ({ showToast }) => {
  // Logo Customizer State
  const [currentSavedLogo, setCurrentSavedLogo] = useState<string | null>(getStoredCustomLogo());
  const [logoInputUrl, setLogoInputUrl] = useState<string>(getStoredCustomLogo() || '');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(getStoredCustomLogo());
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  // Company Contact Info State
  const [contactForm, setContactForm] = useState<CompanyContactInfo>(getStoredCompanyContact());

  // Social Media Links State
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(getStoredSocialLinks());
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [newCustom, setNewCustom] = useState<{ platform: string; url: string; iconName: string }>({
    platform: '',
    url: '',
    iconName: 'Globe',
  });

  const handleApplyLogoUrl = (urlToApply: string) => {
    if (!urlToApply.trim()) {
      handleResetLogo();
      return;
    }
    setCurrentSavedLogo(urlToApply);
    saveStoredCustomLogo(urlToApply);
    addAdminLog({
      action: 'UPDATE',
      target: 'BRANDING',
      title: 'Updated Company Logo',
      details: `New logo configured.`,
    });
    showToast('Company logo updated successfully!', 'success');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image file size must be under 2MB.', 'error');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      setLogoPreviewUrl(base64Url);
      setLogoInputUrl(base64Url);
      handleApplyLogoUrl(base64Url);
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      showToast('Failed to read logo image file.', 'error');
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCurrentSavedLogo(null);
    setLogoInputUrl('');
    setLogoPreviewUrl(null);
    saveStoredCustomLogo(null);
    addAdminLog({
      action: 'UPDATE',
      target: 'BRANDING',
      title: 'Reset Company Logo to Default',
      details: 'Restored OhmVeda original logo vector.',
    });
    showToast('Logo restored to default OhmVeda brand logo.', 'info');
  };

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactForm.email.trim()) {
      showToast('Please enter a valid company contact email.', 'error');
      return;
    }
    if (!contactForm.phone.trim()) {
      showToast('Please enter a valid phone number.', 'error');
      return;
    }

    saveStoredCompanyContact(contactForm);
    addAdminLog({
      action: 'UPDATE',
      target: 'BRANDING',
      title: 'Updated Company Contact & Address Details',
      details: `Email: ${contactForm.email}, Phone: ${contactForm.phone}, Office: ${contactForm.companyName}`,
    });
    showToast('Company contact details updated and saved successfully!', 'success');
  };

  const handleResetContactInfo = () => {
    setContactForm(DEFAULT_COMPANY_CONTACT);
    saveStoredCompanyContact(DEFAULT_COMPANY_CONTACT);
    addAdminLog({
      action: 'UPDATE',
      target: 'BRANDING',
      title: 'Reset Contact Details to Default',
      details: 'Restored default OhmVeda contact information.',
    });
    showToast('Company contact details restored to defaults.', 'info');
  };

  // Social Media Link Actions
  const handleToggleSocialLink = (id: string) => {
    setSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleUrlChangeSocialLink = (id: string, url: string) => {
    setSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url } : item))
    );
  };

  const handleDeleteSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((item) => item.id !== id));
    showToast('Social platform channel removed.', 'info');
  };

  const handleSaveSocialLinks = () => {
    saveStoredSocialLinks(socialLinks);
    addAdminLog({
      action: 'UPDATE',
      target: 'BRANDING',
      title: 'Updated Social Media Links',
      details: `Active platforms: ${socialLinks.filter((s) => s.enabled).map((s) => s.platform).join(', ') || 'None'}`,
    });
    showToast('Social media handles and bottom bar links updated!', 'success');
  };

  const handleResetSocialLinks = () => {
    setSocialLinks(DEFAULT_SOCIAL_LINKS);
    saveStoredSocialLinks(DEFAULT_SOCIAL_LINKS);
    addAdminLog({
      action: 'UPDATE',
      target: 'BRANDING',
      title: 'Reset Social Links to Default',
      details: 'Restored default OhmVeda social media profiles.',
    });
    showToast('Social media links restored to default settings.', 'info');
  };

  const handleAddCustomSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustom.platform.trim()) {
      showToast('Please enter platform name (e.g. Medium, TikTok, Substack).', 'error');
      return;
    }
    if (!newCustom.url.trim()) {
      showToast('Please enter a valid URL.', 'error');
      return;
    }

    let formattedUrl = newCustom.url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newItem: SocialLink = {
      id: `custom-${Date.now()}`,
      platform: newCustom.platform.trim(),
      url: formattedUrl,
      enabled: true,
      iconName: newCustom.iconName || 'Globe',
      isCustom: true,
    };

    const updated = [...socialLinks, newItem];
    setSocialLinks(updated);
    saveStoredSocialLinks(updated);
    setNewCustom({ platform: '', url: '', iconName: 'Globe' });
    setShowAddCustomModal(false);
    showToast(`Added custom platform "${newItem.platform}" successfully!`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: LOGO & BRAND IDENTITY */}
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-indigo-600" />
            <span>Brand Identity & Logo Customizer</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize company logo rendered in header navigation, footer, and admin portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customization Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Upload or Set Logo URL</h2>

            {/* Direct File Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Option 1: Upload Image File</label>
              <label className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  {isUploadingLogo ? 'Uploading Image...' : 'Click to select logo image'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">PNG, SVG, JPG or WebP (Max 2MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image URL Input */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700">Option 2: Image Web Link (URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoInputUrl}
                  onChange={(e) => {
                    setLogoInputUrl(e.target.value);
                    setLogoPreviewUrl(e.target.value);
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleApplyLogoUrl(logoInputUrl)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetLogo}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Default OhmVeda Logo</span>
              </button>
            </div>
          </div>

          {/* Live Logo Preview Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Live Header Preview</span>
            </h2>

            <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center min-h-[220px]">
              <div className="text-[10px] text-slate-500 mb-4 uppercase tracking-widest font-mono">Header Navbar Mockup</div>
              <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between w-full max-w-sm">
                <OhmVedaLogo variant="light" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] text-slate-600 font-bold">Online</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-4 text-center">
                {currentSavedLogo ? (
                  <span className="text-emerald-600 font-semibold">Custom brand logo active across website header & footer.</span>
                ) : (
                  <span className="text-slate-500">Using default OhmVeda brand vector logo.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: COMPANY CONTACT INFORMATION & ADDRESS EDITOR */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>Company Contact Information & Office Address</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit email ID, primary/secondary phone numbers, and engineering office address rendered across the website
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetContactInfo}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* EDIT FORM */}
          <form onSubmit={handleSaveContactInfo} className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Edit Details</h3>
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Contact Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="ohmvedatechnologies@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Displayed in contact cards, footer link, and project inquiry targets.</p>
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Phone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secondary Phone / Landline (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={contactForm.phoneSecondary || ''}
                    onChange={(e) => setContactForm({ ...contactForm, phoneSecondary: e.target.value })}
                    placeholder="+91 (80) 4123-8900"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Company / Office Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.companyName}
                  onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                  placeholder="OhmVeda Technologies Private Limited"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Office Badge / Section Label
                </label>
                <input
                  type="text"
                  value={contactForm.addressTitle}
                  onChange={(e) => setContactForm({ ...contactForm, addressTitle: e.target.value })}
                  placeholder="Engineering Office & R&D Lab"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Address Lines */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Address Line 1 (Building / Street / Area) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={contactForm.addressLine1}
                    onChange={(e) => setContactForm({ ...contactForm, addressLine1: e.target.value })}
                    placeholder="Tech Innovation Hub, Block B, Electronic City Phase 1,"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Address Line 2 (City, State, Pincode, Country)
                </label>
                <input
                  type="text"
                  value={contactForm.addressLine2}
                  onChange={(e) => setContactForm({ ...contactForm, addressLine2: e.target.value })}
                  placeholder="Bengaluru, Karnataka 560100, India"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Contact & Address Settings</span>
              </button>
            </div>
          </form>

          {/* LIVE WEBSITE PREVIEW */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">Website Live Preview</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-semibold">Contact Cards</span>
              </div>

              {/* Email Card Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Email Address</span>
                </div>
                <div className="text-xs font-bold text-white font-mono break-all">
                  {contactForm.email || 'email@example.com'}
                </div>
              </div>

              {/* Phone Card Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Direct Phone & WhatsApp</span>
                </div>
                <div className="text-xs font-bold text-white font-mono">
                  {contactForm.phone || '+91 ...'}
                  {contactForm.phoneSecondary ? ` / ${contactForm.phoneSecondary}` : ''}
                </div>
              </div>

              {/* Address Card Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {contactForm.addressTitle || 'Engineering Office & R&D Lab'}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">
                  {contactForm.companyName || 'OhmVeda Technologies'}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {contactForm.addressLine1 || 'Address line 1'}
                  {contactForm.addressLine2 && <><br />{contactForm.addressLine2}</>}
                </p>
              </div>

              <p className="text-[10px] text-slate-500 text-center font-mono">
                Changes saved here sync in real-time to Cloud Firestore and update all visitor browsers.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: SOCIAL MEDIA LINKS & BOTTOM BAR CONTROL */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              <span>Social Media Links & Bottom Bar Control</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control the social media channels rendered in the website bottom bar and footer. Toggle visibility, edit URLs, or add custom platforms.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddCustomModal(true)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Add Custom Channel</span>
            </button>
            <button
              type="button"
              onClick={handleResetSocialLinks}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Social Media Link Configurator List */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase font-mono">Configured Social Platforms ({socialLinks.length})</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                {socialLinks.filter((s) => s.enabled && s.url.trim()).length} Active on Website
              </span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {socialLinks.map((social) => {
                const isEnabled = social.enabled;
                return (
                  <div
                    key={social.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isEnabled
                        ? 'bg-slate-50/80 border-slate-200 hover:border-blue-300'
                        : 'bg-slate-100/50 border-slate-200/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            isEnabled
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {renderSocialIcon(social.iconName, social.platform)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{social.platform}</h4>
                            {social.isCustom && (
                              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold font-mono rounded border border-indigo-200">
                                CUSTOM
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Status: {isEnabled ? 'Enabled (Visible in Bottom Bar)' : 'Disabled (Hidden)'}
                          </span>
                        </div>
                      </div>

                      {/* Enable / Disable Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSocialLink(social.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                            isEnabled
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                              : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                          <span>{isEnabled ? 'ACTIVE' : 'DISABLED'}</span>
                        </button>

                        {social.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSocialLink(social.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete channel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* URL Input */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="url"
                          value={social.url}
                          onChange={(e) => handleUrlChangeSocialLink(social.id, e.target.value)}
                          placeholder={`Enter ${social.platform} URL (e.g. https://...)`}
                          disabled={!isEnabled}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                      {social.url && (
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition-colors border border-slate-200"
                          title="Test Link in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save All Social Links Button */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSocialLinks}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Social Media Links & Sync Website</span>
              </button>
            </div>
          </div>

          {/* Website Bottom Bar Live Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-4 shadow-xl sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bottom Bar Live Preview</span>
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                  Real-Time UI
                </span>
              </div>

              {/* Preview Box - Footer Bottom Bar Mockup */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Footer Bottom Bar Display:
                </p>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>© {new Date().getFullYear()} OhmVeda Technologies. All rights reserved.</span>
                  </div>
                </div>

                {/* Footer Connect Card Preview */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    Footer Connect Block Preview:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {socialLinks
                      .filter((s) => s.enabled && s.url.trim())
                      .slice(0, 6)
                      .map((s) => (
                        <div
                          key={`connect-prev-${s.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5 font-bold"
                        >
                          {renderSocialIcon(s.iconName, s.platform)}
                          <span>{s.platform}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-200 space-y-1">
                <span className="font-bold text-blue-400 block font-mono uppercase text-[10px]">✨ Admin Pro Tip</span>
                <p className="leading-relaxed">
                  When you save changes here, all visitors across the website will see the social icons instantly in the footer bottom bar without needing to refresh the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD CUSTOM SOCIAL PLATFORM MODAL */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Add Custom Social Channel</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomSocialLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                  Platform / Channel Name *
                </label>
                <input
                  type="text"
                  value={newCustom.platform}
                  onChange={(e) => setNewCustom({ ...newCustom, platform: e.target.value })}
                  placeholder="e.g. Medium, TikTok, Substack, Dribbble, Behance, Custom Portal"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                  Profile / Channel URL *
                </label>
                <input
                  type="text"
                  value={newCustom.url}
                  onChange={(e) => setNewCustom({ ...newCustom, url: e.target.value })}
                  placeholder="e.g. https://medium.com/@ohmveda"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                  Select Icon Style
                </label>
                <select
                  value={newCustom.iconName}
                  onChange={(e) => setNewCustom({ ...newCustom, iconName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Globe">Globe / Website (Default)</option>
                  <option value="Linkedin">LinkedIn</option>
                  <option value="Github">GitHub</option>
                  <option value="Youtube">YouTube</option>
                  <option value="Twitter">Twitter / X</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="MessageCircle">WhatsApp / Chat</option>
                  <option value="MessageSquare">Discord / Forum</option>
                  <option value="Send">Telegram / Channel</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Add & Save Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

