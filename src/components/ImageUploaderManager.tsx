import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Trash2, Plus, Star, Layers, Sparkles } from 'lucide-react';
import { processMultipleImageFiles } from '../utils/imageUtils';
import { ImageCarousel } from './ImageCarousel';

interface ImageUploaderManagerProps {
  images?: string[];
  image?: string; // Fallback single image URL
  onChange: (images: string[], primaryImage: string) => void;
  accentColor?: 'blue' | 'indigo';
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
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

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
      // Reset input value
      e.target.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const newUrl = urlInput.trim();
    if (currentImagesList.includes(newUrl)) {
      setUrlInput('');
      return;
    }
    const combined = [...currentImagesList, newUrl];
    const primary = combined[0] || '';
    onChange(combined, primary);
    setUrlInput('');
    setShowUrlInput(false);
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
  const themeBtnBg = isIndigo ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700';
  const themeBorder = isIndigo ? 'border-indigo-200' : 'border-blue-200';
  const themeText = isIndigo ? 'text-indigo-600' : 'text-blue-600';

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-bold text-slate-800 uppercase tracking-wider font-mono text-[10px] flex items-center gap-1.5">
            <Layers className={`w-3.5 h-3.5 ${themeText}`} />
            <span>{label}</span>
          </label>
          <p className="text-[11px] text-slate-500 font-medium">
            Upload single or multiple images from your device. If multiple images are added, they will automatically scroll every 3 seconds from right to left on the website.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
          {currentImagesList.length} {currentImagesList.length === 1 ? 'Image' : 'Images'}
        </span>
      </div>

      {/* Upload Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <label className={`px-4 py-2.5 rounded-xl ${themeBtnBg} text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs`}>
          <Upload className="w-4 h-4" />
          <span>{isProcessing ? 'Processing Images...' : 'Upload Local Images (Single / Multiple)'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={isProcessing}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Add via URL</span>
        </button>
      </div>

      {/* URL Input Box */}
      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1 animate-in fade-in">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-600"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className={`px-3 py-2 rounded-xl ${themeBtnBg} text-white font-bold text-xs flex items-center gap-1 cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      )}

      {/* Thumbnails List */}
      {currentImagesList.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {currentImagesList.map((imgUrl, index) => (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden border bg-white shadow-2xs flex flex-col ${
                  index === 0 ? `${themeBorder} ring-2 ring-blue-500/20` : 'border-slate-200'
                }`}
              >
                <div className="relative h-24 bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />

                  {/* Primary Badge */}
                  {index === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center gap-0.5 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Primary</span>
                    </span>
                  )}

                  {/* Action overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="p-1 rounded bg-emerald-600 text-white text-[10px] font-bold cursor-pointer hover:bg-emerald-700"
                        title="Set as primary cover image"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 rounded bg-rose-600 text-white cursor-pointer hover:bg-rose-700"
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
          {currentImagesList.length > 0 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700 uppercase font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Live Carousel Preview (Auto-scrolls every 3 sec right to left)</span>
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
          )}
        </div>
      )}
    </div>
  );
};
