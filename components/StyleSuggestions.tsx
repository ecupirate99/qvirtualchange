import React from 'react';
import { Wand2, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { StyleSuggestion } from '../types';

interface StyleSuggestionsProps {
  suggestions: StyleSuggestion[];
  isLoading: boolean;
  onSelect: (suggestion: StyleSuggestion) => void;
  isGeneratingItem: boolean;
  onRefresh: () => void;
  hasPerson: boolean;
}

const StyleSuggestions: React.FC<StyleSuggestionsProps> = ({ 
  suggestions, 
  isLoading, 
  onSelect, 
  isGeneratingItem,
  onRefresh,
  hasPerson
}) => {
  if (!hasPerson) return null;

  return (
    <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-1.5 rounded-lg shadow-md">
            <Wand2 size={16} className="text-white" />
          </div>
          <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white">AI Style Advisor</h3>
        </div>
        
        {suggestions.length === 0 && !isLoading ? (
          <button 
            onClick={onRefresh}
            className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent-200 dark:border-accent-500/30 bg-accent-50 dark:bg-accent-500/10 hover:bg-accent-100 dark:hover:bg-accent-500/20"
          >
            <Sparkles size={14} />
            <span>Get Suggestions</span>
          </button>
        ) : (
             <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded"></div>
              <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((item) => (
            <div 
              key={item.id}
              onClick={() => !isGeneratingItem && onSelect(item)}
              className={`
                group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-accent-400 dark:hover:border-accent-500/50 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(14,165,233,0.1)] hover:-translate-y-1
                ${isGeneratingItem ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/30 px-2 py-0.5 rounded border border-accent-100 dark:border-accent-500/20">
                  {item.color}
                </span>
                <ArrowRight size={16} className="text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors -rotate-45 group-hover:rotate-0 transform duration-300" />
              </div>
              
              <h4 className="text-gray-900 dark:text-white font-medium mb-1 group-hover:text-accent-600 dark:group-hover:text-accent-300 transition-colors">{item.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{item.reasoning}</p>
              
              {/* Hover Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 dark:text-gray-500 text-sm">Upload a photo of a person to get AI-powered outfit recommendations.</p>
        </div>
      )}

      {isGeneratingItem && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-[1px] rounded-xl">
           <div className="flex flex-col items-center p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl">
              <Loader2 className="w-6 h-6 text-accent-600 dark:text-accent-400 animate-spin mb-2" />
              <p className="text-sm text-gray-900 dark:text-white font-medium">Creating virtual garment...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default StyleSuggestions;