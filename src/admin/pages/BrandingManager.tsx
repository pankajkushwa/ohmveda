import React, { useState } from 'react';
import { 
  Image, Upload, Save, RefreshCw, CheckCircle2, Mail, Phone, MapPin, Building
} from 'lucide-react';
import { OhmVedaLogo } from '../../components/OhmVedaLogo';
import { 
  addAdminLog, getStoredCustomLogo, saveStoredCustomLogo,
  getStoredCompanyContact, saveStoredCompanyContact, DEFAULT_COMPANY_CONTACT
} from '../../services/dataStorage';
import { CompanyContactInfo } from '../../types';

interface BrandingManagerProps {
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
}

export const BrandingManager: React.FC<BrandingManagerProps> = ({ showToast }) => {
  // Logo Customizer State
  const [currentSavedLogo, setCurrentSavedLogo] = useState<string | null>(getStoredCustomLogo());
  const [logoInputUrl, setLogoInputUrl] = useState<string>(getStoredCustomLogo() || '');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(getStoredCustomLogo());
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  // Company Contact Info State
  const [contactForm, setContactForm] = useState<CompanyContactInfo>(getStoredCompanyContact());

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

            <div className="flex-1 bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
              <div className="text-[10px] text-slate-500 mb-4 uppercase tracking-widest font-mono">Header Navbar Mockup</div>
              <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between w-full max-w-sm">
                <OhmVedaLogo />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] text-slate-400 font-bold">Online</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-4 text-center">
                {currentSavedLogo ? (
                  <span className="text-emerald-400 font-semibold">Custom brand logo active across website header & footer.</span>
                ) : (
                  <span className="text-slate-400">Using default OhmVeda brand vector logo.</span>
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
    </div>
  );
};

