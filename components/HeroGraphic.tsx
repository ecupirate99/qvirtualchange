import React from 'react';
import { Shirt, Sparkles, ScanLine } from 'lucide-react';

const HeroGraphic: React.FC = () => {
  return (
    <div className="relative w-32 h-32 mb-8 group cursor-default">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-accent-500/20 blur-xl rounded-full animate-pulse-slow"></div>

      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-accent-500 border-r-accent-500 animate-[spin_3s_linear_infinite] shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
      
      {/* Inner rotating ring (reverse) */}
      <div className="absolute inset-3 rounded-full border-[2px] border-transparent border-b-purple-500 border-l-purple-500 animate-[spin_2s_linear_infinite_reverse]" />
      
      {/* Central Platform */}
      <div className="absolute inset-6 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden">
         {/* Background Grid inside circle */}
         <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
         
         {/* Icon */}
         <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
             <Shirt size={32} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
         </div>

         {/* Scanning Line Effect */}
         <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-transparent to-accent-500/20 animate-scan pointer-events-none"></div>
      </div>

      {/* Floating Elements */}
      <Sparkles size={20} className="absolute -top-1 -right-1 text-yellow-400 animate-bounce drop-shadow-lg" />
      <div className="absolute bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
      <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse" />
    </div>
  );
};

export default HeroGraphic;