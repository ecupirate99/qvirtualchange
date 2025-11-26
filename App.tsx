import React, { useState, useEffect } from 'react';
import { Sparkles, Shirt, User, Images, Menu, X } from 'lucide-react';
import UploadZone from './components/UploadZone';
import Button from './components/Button';
import ComparisonSlider from './components/ComparisonSlider';
import Gallery from './components/Gallery';
import StyleSuggestions from './components/StyleSuggestions';
import HeroGraphic from './components/HeroGraphic';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ThemeToggle from './components/ThemeToggle';
import { FileData, AppState, GalleryItem, StyleSuggestion } from './types';
import { generateTryOn, getStyleSuggestions, generateClothingPreview } from './services/gemini';

type View = 'HOME' | 'PRIVACY' | 'TERMS';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [personImage, setPersonImage] = useState<FileData | null>(null);
  const [clothingImage, setClothingImage] = useState<FileData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Suggestions State
  const [suggestions, setSuggestions] = useState<StyleSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [generatingClothing, setGeneratingClothing] = useState(false);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    } else {
      setTheme('light'); // Default to light if no pref and no system dark mode
    }
  }, []);

  // Apply Theme Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load Gallery from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lumina_gallery');
      if (saved) {
        setGalleryItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load gallery from storage", e);
    }
  }, []);

  const saveToGallery = (resultUrl: string, personPreview: string) => {
    const newItem: GalleryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      resultImage: resultUrl,
      originalImagePreview: personPreview
    };

    setGalleryItems(prev => {
      // Keep only last 6 items to avoid LocalStorage quota limits with Base64 strings
      const updated = [newItem, ...prev].slice(0, 6);
      try {
        localStorage.setItem('lumina_gallery', JSON.stringify(updated));
      } catch (e) {
        console.error("Storage quota exceeded", e);
        // Fallback: don't save to LS if full, but update state
      }
      return updated;
    });
  };

  const removeFromGallery = (id: string) => {
    setGalleryItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('lumina_gallery', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFetchSuggestions = async () => {
    if (!personImage) return;
    setLoadingSuggestions(true);
    try {
        const results = await getStyleSuggestions(personImage);
        setSuggestions(results);
    } catch (e) {
        console.error("Failed to get suggestions", e);
    } finally {
        setLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: StyleSuggestion) => {
    setGeneratingClothing(true);
    try {
        const clothingFile = await generateClothingPreview(suggestion);
        setClothingImage(clothingFile);
    } catch (e) {
        setError("Could not generate virtual clothing asset.");
    } finally {
        setGeneratingClothing(false);
    }
  };

  const handleGenerate = async () => {
    if (!personImage || !clothingImage) return;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const resultUrl = await generateTryOn(personImage, clothingImage);
      setGeneratedImage(resultUrl);
      setAppState(AppState.SUCCESS);
      
      // Auto-save to gallery
      saveToGallery(resultUrl, personImage.previewUrl);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate the try-on image. Please try again later or check your API key.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setGeneratedImage(null);
    setPersonImage(null);
    setClothingImage(null);
    setSuggestions([]);
    setError(null);
    setCurrentView('HOME');
  };

  const renderContent = () => {
    if (currentView === 'PRIVACY') return <PrivacyPolicy />;
    if (currentView === 'TERMS') return <TermsOfService />;

    // HOME View Logic
    if (appState === AppState.SUCCESS && generatedImage && personImage) {
      return (
        <ComparisonSlider 
          beforeImage={personImage.previewUrl}
          afterImage={generatedImage}
          onReset={handleReset}
        />
      );
    }

    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center animate-in fade-in duration-500">
        
        {/* Left Side: Header & Info */}
        <div className="w-full lg:w-1/3 space-y-6 lg:space-y-8 lg:sticky lg:top-32">
          <div className="space-y-4 text-center lg:text-left">
            
            {/* Animated Graphic (Centered on mobile) */}
            <div className="flex justify-center lg:justify-start">
               <HeroGraphic />
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-gray-500 dark:bg-clip-text">
              Wear it <br className="hidden md:block"/> before you <br className="hidden md:block"/> buy it.
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto lg:mx-0">
              Experience the future of fashion with Quintin's AI-powered virtual dressing room. Upload a photo, pick a style, and see the transformation instantly.
            </p>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#09090b] bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i + 50}/100`} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p>Trusted by 2k+ fashion enthusiasts</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-200 text-sm animate-in fade-in slide-in-from-bottom-2">
              <p className="font-bold mb-1">Error</p>
              {error}
            </div>
          )}
        </div>

        {/* Right Side: Inputs */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400">
                  <User size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Step 1</span>
              </div>
              <UploadZone 
                id="person-upload"
                label="Upload Person"
                fileData={personImage}
                onFileSelect={(file) => {
                  setPersonImage(file);
                  if(file) setSuggestions([]);
                }}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400">
                  <Shirt size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Step 2</span>
              </div>
              <UploadZone 
                id="cloth-upload"
                label="Upload Clothing"
                fileData={clothingImage}
                onFileSelect={setClothingImage}
              />
            </div>
          </div>

          {/* AI Style Advisor Section */}
          <div className="relative">
              <StyleSuggestions 
                  hasPerson={!!personImage}
                  suggestions={suggestions}
                  isLoading={loadingSuggestions}
                  isGeneratingItem={generatingClothing}
                  onRefresh={handleFetchSuggestions}
                  onSelect={handleSelectSuggestion}
              />
          </div>

          <div className="pt-4 flex flex-col items-center">
             <div className="w-full relative group">
                {/* Decorative elements around button (Dark mode only) */}
                <div className="hidden dark:block absolute -inset-1 bg-gradient-to-r from-accent-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                
                <Button 
                  onClick={handleGenerate}
                  isLoading={appState === AppState.GENERATING}
                  disabled={!personImage || !clothingImage}
                  className="w-full h-16 text-lg shadow-xl"
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  {appState === AppState.GENERATING ? 'Weaving pixels...' : 'Visualize Style'}
                </Button>
             </div>
             <p className="mt-4 text-xs text-center text-gray-500">
                Powered by Google Gemini 2.5 Flash • High Fidelity Output
             </p>
          </div>
          
          {/* Visualizer scanning animation overlay if generating */}
          {appState === AppState.GENERATING && (
             <div className="fixed inset-0 z-[60] bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-2xl overflow-hidden border border-accent-500/30 shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                    {/* Background Image Ghosting */}
                    {personImage && (
                        <img 
                          src={personImage.previewUrl} 
                          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" 
                          alt="processing" 
                        />
                    )}
                    {/* Scanning Line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-accent-500 shadow-[0_0_20px_#0ea5e9] animate-scan z-10"></div>
                    
                    {/* Overlay Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:20px_20px] z-0"></div>
                </div>
                <h2 className="mt-8 text-2xl font-display font-bold text-gray-900 dark:text-white animate-pulse">Designing your look...</h2>
                <p className="text-accent-600 dark:text-accent-400 mt-2">AI is analyzing fit and fabric physics</p>
             </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-gray-100 font-sans selection:bg-accent-500/30 transition-colors duration-500">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-black/20 backdrop-blur-lg fixed top-0 w-full z-50 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('HOME')}>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center shadow-lg shadow-accent-500/20">
              <Sparkles className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-display font-bold text-lg md:text-xl lg:text-2xl tracking-tight text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-none">
              Quintin's<span className="hidden sm:inline"> VDR</span><span className="sm:hidden"> VDR</span>
            </span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button 
              onClick={() => setIsGalleryOpen(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group"
            >
              <Images size={18} className="group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors"/>
              <span>Gallery</span>
              {galleryItems.length > 0 && (
                <span className="bg-accent-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {galleryItems.length}
                </span>
              )}
            </button>
            
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-800"></div>
            
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 space-y-4 animate-in slide-in-from-top-4">
             <button 
                onClick={() => { setIsGalleryOpen(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
             >
                <div className="flex items-center gap-3">
                  <Images size={20} className="text-accent-600 dark:text-accent-400"/>
                  <span>Gallery</span>
                </div>
                {galleryItems.length > 0 && (
                  <span className="bg-accent-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {galleryItems.length}
                  </span>
                )}
             </button>
             <div className="flex justify-around pt-2 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => {setCurrentView('PRIVACY'); setMobileMenuOpen(false);}} className="text-sm text-gray-500">Privacy</button>
                <button onClick={() => {setCurrentView('TERMS'); setMobileMenuOpen(false);}} className="text-sm text-gray-500">Terms</button>
             </div>
          </div>
        )}
      </nav>

      <Gallery 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        items={galleryItems}
        onDelete={removeFromGallery}
      />

      {/* Main Content */}
      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/40 py-8 md:py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Quintin's Virtual Dressing Room. All rights reserved.</p>
          <div className="flex gap-6">
             <button onClick={() => setCurrentView('PRIVACY')} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors text-sm">Privacy</button>
             <button onClick={() => setCurrentView('TERMS')} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors text-sm">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;