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
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Image className="w-5 h-5 text-indigo-400" />
          <span>Brand Identity & Logo Customizer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize company logo rendered in the header navigation, footer, and admin portal across all devices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customization Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Upload or Set Logo URL</h2>

          {/* Direct File Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Option 1: Upload Image File</label>
            <label className="flex flex-col items-center justify-center p-6 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" />
              <span className="text-xs font-semibold text-slate-300">
                {isUploadingLogo ? 'Uploading Image...' : 'Click to select logo image'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">PNG, SVG, JPG or WebP (Max 2MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileUpload}
                disabled={isUploadingLogo}
                className="hidden"
              />
            </label>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="shrink mx-4 text-[10px] font-bold text-slate-500 uppercase">OR</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Logo URL Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Option 2: Logo Image Web URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={logoInputUrl}
                onChange={(e) => {
                  setLogoInputUrl(e.target.value);
                  setLogoPreviewUrl(e.target.value || null);
                }}
                placeholder="https://example.com/my-logo.png"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleApplyLogoUrl(logoInputUrl)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetLogo}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restore Default OhmVeda Logo</span>
            </button>
          </div>
        </div>

        {/* Live Logo Preview Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-2">Navbar Header Live Preview</h2>
            <p className="text-xs text-slate-400 mb-4">
              Preview how your company logo appears on the website navigation header
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <OhmVedaLogo customLogoUrl={logoPreviewUrl || currentSavedLogo} size="md" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Header Match</span>
              </span>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">Logo Preservation Guarantee:</p>
            <p>
              Your custom logo is protected and explicitly preserved during cloud sync or factory data resets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
