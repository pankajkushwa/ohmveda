import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images?: string[];
  image?: string;
  alt?: string;
  className?: string;
  autoPlayInterval?: number; // default 3000ms
  objectFit?: 'cover' | 'contain' | 'fill';
  fallbackIcon?: React.ReactNode;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  image,
  alt = 'Product image',
  className = 'w-full h-48',
  autoPlayInterval = 3000,
  objectFit = 'cover',
  fallbackIcon,
}) => {
  // Combine images array and single image prop into a unified deduplicated list
  const allImages: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (images && Array.isArray(images)) {
      images.forEach((img) => {
        if (img && typeof img === 'string' && img.trim()) {
          list.push(img.trim());
        }
      });
    }
    if (image && typeof image === 'string' && image.trim() && !list.includes(image.trim())) {
      list.unshift(image.trim());
    }
    return list;
  }, [images, image]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});

  // Reset index if image list changes
  useEffect(() => {
    setCurrentIndex(0);
    setImgErrorMap({});
  }, [allImages]);

  // Auto-play interval: right to left scroll every 3 seconds
  useEffect(() => {
    if (allImages.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [allImages.length, autoPlayInterval, isHovered]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // If no valid images
  if (allImages.length === 0) {
    return (
      <div className={`${className} bg-slate-100 rounded-xl flex flex-col items-center justify-center p-4 text-slate-400 select-none`}>
        {fallbackIcon || <ImageIcon className="w-8 h-8 opacity-40 mb-1" />}
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">No Image</span>
      </div>
    );
  }

  const currentImgUrl = allImages[currentIndex];
  const hasError = imgErrorMap[currentIndex];

  // Right-to-left animation variants for Framer Motion
  const slideVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: '0%', opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  return (
    <div
      className={`relative overflow-hidden group select-none bg-slate-900 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image with Right-to-Left Slide Animation */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {hasError ? (
            <div key={`err-${currentIndex}`} className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
              <span className="text-[10px] font-mono">Image unavailable</span>
            </div>
          ) : (
            <motion.img
              key={currentImgUrl + currentIndex}
              src={currentImgUrl}
              alt={`${alt} - ${currentIndex + 1}`}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              onError={() => setImgErrorMap((prev) => ({ ...prev, [currentIndex]: true }))}
              className={`w-full h-full ${objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Multiple Images Indicator Badge */}
      {allImages.length > 1 && (
        <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold border border-white/20 shadow-xs flex items-center gap-1">
          <span>{currentIndex + 1}</span>
          <span className="opacity-50">/</span>
          <span>{allImages.length}</span>
        </div>
      )}

      {/* Navigation Controls (Visible on hover or mobile) */}
      {allImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-950/60 backdrop-blur-xs">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
