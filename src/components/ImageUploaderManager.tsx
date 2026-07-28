import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Trash2, Plus, Star, Layers, Sparkles } from 'lucide-react';
import { processMultipleImageFiles } from '../utils/imageUtils';
import { ImageCarousel } from './ImageCarousel';

interface ImageUploaderManagerProps {
  images?: string[];
  image?: string; // Fallback single image URL
  onChange: (images: string[], primaryImage: string) => void;
  accentColor?: 'blue' | 'indigo' | 'emerald';
  label?: string;
}

export const ImageUploaderManager: React.FC<ImageUploaderManagerProps> = ({
  images = [],
  image = '',
  onChange,
  accentColor = 'blue',
  label = 'Product Media & Images',
}) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url'); // Default to URL input mode

  // Normalize current images list
  const currentImagesList: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (images && Array.isArray(images)) {
      images.forEach((img) => {
        if (img && typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    if (image && typeof image === 'string' && image.trim() && !list.includes(image.trim())) {
      list.unshift(image.trim());
    }
    return list;
  }, [images, image]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const newBase64Images = await processMultipleImageFiles(files);
      const combined = [...currentImagesList, ...newBase64Images];
      const primary = combined[0] || '';
      onChange(combined, primary);
    } catch (err) {
      console.error('Error uploading image files:', err);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleAddUrls = () => {
    if (!urlInput.trim()) return;

    // Split by newlines, commas, or spaces if multiple URLs are pasted
    const rawTokens = urlInput.split(/[\n,\s]+/);
    const validUrls: string[] = [];

    rawTokens.forEach((tok) => {
      const cleaned = tok.trim();
      if (cleaned) {
        if (!currentImagesList.includes(cleaned) && !validUrls.includes(cleaned)) {
          validUrls.push(cleaned);
        }
      }
    });

    if (validUrls.length > 0) {
      const combined = [...currentImagesList, ...validUrls];
      const primary = combined[0] || '';
      onChange(combined, primary);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = currentImagesList.filter((_, idx) => idx !== indexToRemove);
    const primary = updated[0] || '';
    onChange(updated, primary);
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    const targetImg = currentImagesList[indexToPrimary];
    const remaining = currentImagesList.filter((_, idx) => idx !== indexToPrimary);
    const updated = [targetImg, ...remaining];
    onChange(updated, targetImg);
  };

  const isIndigo = accentColor === 'indigo';
  const isEmerald = accentColor === 'emerald';

  const themeBtnBg = isIndigo 
    ? 'bg-indigo-600 hover:bg-indigo-700' 
    : isEmerald 
    ? 'bg-emerald-600 hover:bg-emerald-700' 
    : 'bg-blue-600 hover:bg-blue-700';

  const themeBorder = isIndigo 
    ? 'border-indigo-200 ring-indigo-500/20' 
    : isEmerald 
    ? 'border-emerald-200 ring-emerald-500/20' 
    : 'border-blue-200 ring-blue-500/20';

  const themeText = isIndigo ? 'text-indigo-600' : isEmerald ? 'text-emerald-600' : 'text-blue-600';

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-bold text-slate-800 uppercase tracking-wider font-mono text-[10px] flex items-center gap-1.5">
            <Layers className={`w-3.5 h-3.5 ${themeText}`} />
            <span>{label}</span>
          </label>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Add single or multiple image URLs or upload local images. Multiple images will auto-scroll every 3 seconds right-to-left.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
          {currentImagesList.length} {currentImagesList.length === 1 ? 'Image' : 'Images'}
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            inputMode === 'url'
              ? `${themeBtnBg} text-white shadow-xs`
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Image Web Link (URL)</span>
        </button>

        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            inputMode === 'upload'
              ? `${themeBtnBg} text-white shadow-xs`
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File(s)</span>
        </button>
      </div>

      {/* Input Options */}
      {inputMode === 'url' ? (
        <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
          <label className="block text-[11px] font-bold text-slate-700">
            Paste Image URL(s) <span className="text-[10px] text-slate-400 font-normal">(Single URL or multiple URLs separated by newlines/commas)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              rows={2}
              placeholder="https://images.unsplash.com/photo-1518770660439-4636190af475&#10;https://images.unsplash.com/photo-1581092160607-ee22621dd758"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500 focus:bg-white resize-y"
            />
            <button
              type="button"
              onClick={handleAddUrls}
              disabled={!urlInput.trim()}
              className={`px-4 py-2 rounded-xl ${themeBtnBg} text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 self-end sm:self-auto h-10`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Image URL(s)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <label className={`w-full py-4 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-slate-50 hover:bg-white`}>
            <Upload className={`w-6 h-6 ${themeText}`} />
            <span className="text-xs font-bold text-slate-700">
              {isProcessing ? 'Processing image files...' : 'Click or Drag & Drop local image files'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Supports PNG, JPG, WebP, SVG (Select single or multiple)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isProcessing}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Thumbnails Grid */}
      {currentImagesList.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {currentImagesList.map((imgUrl, index) => (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden border bg-white shadow-2xs flex flex-col ${
                  index === 0 ? `${themeBorder} ring-2` : 'border-slate-200'
                }`}
              >
                <div className="relative h-24 bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />

                  {/* Primary Badge */}
                  {index === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center gap-0.5 shadow-xs z-10">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Primary Cover</span>
                    </span>
                  )}

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 z-20">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold cursor-pointer hover:bg-emerald-700 transition-colors"
                        title="Set as primary cover image"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 rounded bg-rose-600 text-white cursor-pointer hover:bg-rose-700 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-1.5 bg-white text-[10px] font-mono text-slate-500 truncate text-center border-t border-slate-100">
                  Image #{index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Live Preview of Auto-Scroll Carousel */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Live Carousel Preview</span>
              </span>
              {currentImagesList.length > 1 && (
                <span className="text-[10px] font-mono text-emerald-600 font-bold">
                  Active (3s Right-to-Left Auto Scroll)
                </span>
              )}
            </div>
            <div className="max-w-md mx-auto">
              <ImageCarousel
                images={currentImagesList}
                className="w-full h-44 rounded-xl shadow-xs"
                objectFit="cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
