import React, { useState } from 'react';
import { 
  Image, Upload, Save, RefreshCw, CheckCircle2
} from 'lucide-react';
import { OhmVedaLogo } from '../../components/OhmVedaLogo';
import { 
  addAdminLog, getStoredCustomLogo, saveStoredCustomLogo 
} from '../../services/dataStorage';

interface BrandingManagerProps {
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
}

export const BrandingManager: React.FC<BrandingManagerProps> = ({ showToast }) => {
  const [currentSavedLogo, setCurrentSavedLogo] = useState<string | null>(getStoredCustomLogo());
  const [logoInputUrl, setLogoInputUrl] = useState<string>(getStoredCustomLogo() || '');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(getStoredCustomLogo());
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1"
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
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-2 transition-colors"
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
  );
};
