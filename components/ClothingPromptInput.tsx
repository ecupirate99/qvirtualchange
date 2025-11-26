import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import Button from './Button';
import { generateClothingFromPrompt } from '../services/gemini';
import { FileData } from '../types';

interface ClothingPromptInputProps {
  onImageGenerated: (file: FileData) => void;
  onCancel?: () => void;
}

const ClothingPromptInput: React.FC<ClothingPromptInputProps> = ({ onImageGenerated, onCancel }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const fileData = await generateClothingFromPrompt(prompt);
      onImageGenerated(fileData);
    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please try a different description.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 h-full flex flex-col shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-accent-500 w-5 h-5" />
          Describe to Wear
        </h3>
        {onCancel && (
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X size={20}/>
            </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        <div className="flex-1">
          <label htmlFor="prompt" className="sr-only">Clothing Description</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g. A vintage denim jacket with patches, or a red silk evening gown..."
            className="w-full h-full min-h-[120px] p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400"
            disabled={isGenerating}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button 
          type="submit" 
          isLoading={isGenerating}
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Designing...' : 'Generate Clothing'}
        </Button>
      </form>
    </div>
  );
};

export default ClothingPromptInput;