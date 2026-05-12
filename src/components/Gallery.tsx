import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import { PhotoItem } from '../types';
import { cn } from '../lib/utils';

interface GalleryProps {
  photos: PhotoItem[];
}

export function Gallery({ photos }: GalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPhoto = photos.find(p => p.id === selectedId);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {photos.map((photo) => (
          <motion.div
            layout
            key={photo.id}
            onClick={() => setSelectedId(photo.id)}
            className="bg-white p-4 rounded-[32px] shadow-sm border border-[#EEECE4] flex flex-col cursor-pointer group hover:shadow-md hover:border-[#E8E4D9] transition-all duration-300 break-inside-avoid"
          >
            <div className="relative flex-1 bg-[#E8E7DF] rounded-[24px] flex items-center justify-center overflow-hidden w-full aspect-auto min-h-[150px]">
              <motion.img
                layoutId={`img-${photo.id}`}
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
               <div className="absolute inset-0 bg-[#4A443F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[24px]" />
            </div>
            <div className="pt-5 pb-1 text-center px-2">
              <p className="font-serif italic text-lg text-[#5A5A40] truncate leading-tight">{photo.title}</p>
              {photo.description && (
                <p className="text-[10px] uppercase tracking-widest opacity-50 truncate mt-1.5">{photo.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedId && selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-12">
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-[#F9F8F4]/95 backdrop-blur-[2px]"
            />
            
            <div className="relative w-full max-w-5xl max-h-full flex flex-col items-center justify-center pointer-events-none z-10 h-full">
              
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-0 right-0 sm:-top-4 sm:-right-4 p-3 text-[#4A443F] hover:text-[#5A5A40] hover:bg-[#E8E7DF] rounded-full transition-all pointer-events-auto z-20"
                aria-label="Tutup"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                layoutId={`img-${selectedPhoto.id}`}
                className="relative bg-white rounded-[32px] sm:rounded-[40px] shadow-sm border border-[#EEECE4] pointer-events-auto flex flex-col w-full h-full sm:h-[85vh]"
              >
                 {/* Image Container */}
                 <div className="flex-1 overflow-hidden p-3 pb-0">
                    <div className="w-full h-full bg-[#E8E7DF] rounded-[24px] sm:rounded-[32px] overflow-hidden flex items-center justify-center relative">
                      <img
                        src={selectedPhoto.url}
                        alt={selectedPhoto.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                 </div>
                 
                 {/* Info Bar */}
                 <div className="bg-white p-6 sm:p-8 flex-shrink-0 animate-in slide-in-from-bottom duration-500 rounded-b-[32px] sm:rounded-b-[40px]">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="flex-1 max-w-3xl text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl text-[#5A5A40] font-serif italic mb-3 leading-tight">{selectedPhoto.title}</h2>
                        {selectedPhoto.description && (
                          <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#4A443F] opacity-60 leading-relaxed md:max-w-2xl">
                            {selectedPhoto.description}
                          </p>
                        )}
                      </div>
                      <a 
                        href={selectedPhoto.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center text-[10px] uppercase tracking-widest font-semibold border border-[#E8E4D9] hover:bg-[#F9F8F4] px-4 py-2.5 rounded-full text-[#5A5A40] transition-colors shrink-0 md:mb-1 w-full md:w-auto mt-4 md:mt-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-2 opacity-50" />
                        Buka Resolusi Penuh
                      </a>
                    </div>
                 </div>
              </motion.div>

            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
