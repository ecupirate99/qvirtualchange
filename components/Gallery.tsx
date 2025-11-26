import React from 'react';
import { X, Download, Trash2, Calendar, Share2 } from 'lucide-react';
import { GalleryItem } from '../types';
import { downloadImage, shareImage } from '../utils';
import Button from './Button';

interface GalleryProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  onDelete: (id: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ isOpen, onClose, items, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 dark:text-white">Your Collection</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Saved virtual try-ons from this session</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 min-h-[300px] md:min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Calendar size={32} className="opacity-50" />
              </div>
              <p>No looks saved yet. Create your first try-on!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {items.map((item) => (
                <div key={item.id} className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-accent-500/50 dark:hover:border-accent-500/50 transition-all duration-300">
                  <div className="aspect-[3/4] relative overflow-hidden bg-gray-200 dark:bg-black/40">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#80808012_25%,transparent_25%,transparent_75%,#80808012_75%,#80808012),linear-gradient(45deg,#80808012_25%,transparent_25%,transparent_75%,#80808012_75%,#80808012)] bg-[size:20px_20px] bg-[position:0_0,10px_10px]" />
                    <img 
                      src={item.resultImage} 
                      alt="Try-on Result" 
                      className="relative z-10 w-full h-full object-contain transition-transform duration-700"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                       <button
                        onClick={() => shareImage(item.resultImage, 'My Style', 'Look at this virtual try-on!')}
                        className="p-3 bg-white text-gray-900 hover:bg-gray-100 rounded-full transition-all shadow-lg"
                        title="Share"
                      >
                        <Share2 size={20} />
                      </button>
                      <Button
                        variant="primary"
                        onClick={() => downloadImage(item.resultImage, `lumina-${item.timestamp}.png`)}
                        className="!p-3 !rounded-full shadow-lg"
                        title="Save"
                      >
                        <Download size={20} />
                      </Button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-all shadow-lg"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
