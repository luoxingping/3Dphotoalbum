
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Photo, LayoutType } from './types';
import PhotoCard from './components/PhotoCard';
import * as geminiService from './services/geminiService';
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, Info, Camera, Layout, Zap, Heart, Play, Pause } from 'lucide-react';

const generateWeddingPhotos = (count: number): Photo[] => {
  const titles = [
    "Eternal Vow", "First Dance", "Golden Memories", "Sacred Union", "Whispered Love",
    "Morning Glow", "The Celebration", "Floral Grace", "Hand in Hand", "Promise of Forever",
    "Starlit Reception", "Champagne Toast", "The Grand Exit", "Quiet Moments", "Soul Mates",
    "Lace & Grace", "Tuxedo Elegance", "Bridal Radiant", "The Ring Exchange", "Sunset Kiss"
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    url: `https://picsum.photos/id/${(i * 3) % 1000 + 10}/800/1200`,
    title: `${titles[i % titles.length]} #${Math.floor(i / titles.length) + 1}`,
  }));
};

const INITIAL_PHOTOS = generateWeddingPhotos(100);
const LAYOUTS: LayoutType[] = ['carousel', 'wall', 'stack', 'helix', 'tunnel', 'sphere', 'galaxy', 'book'];

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [layout, setLayout] = useState<LayoutType>('carousel');
  const [galleryMood, setGalleryMood] = useState("A century of moments, woven into a single timeline of love.");
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isEmphasized, setIsEmphasized] = useState(false);
  
  const rotationTimerRef = useRef<number | null>(null);
  const cycleCountRef = useRef(0);
  const emphasisTimeoutRef = useRef<number | null>(null);

  const triggerEmphasis = useCallback(() => {
    // Phase 1: Small delay to let initial layout transition settle
    setTimeout(() => {
      setIsEmphasized(true);
      
      // Phase 2: Stay in the giant 'Hero' zoom for 2.5 seconds for better viewing
      emphasisTimeoutRef.current = window.setTimeout(() => {
        setIsEmphasized(false);
      }, 2500);
    }, 1200);
  }, []);

  const nextPhoto = useCallback(() => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % photos.length;
      cycleCountRef.current++;
      
      // Every 10 photos, automatically transition to a new spatial layout
      if (cycleCountRef.current % 10 === 0) {
        const nextLayoutIdx = (LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length;
        setLayout(LAYOUTS[nextLayoutIdx]);
      }
      return next;
    });
    triggerEmphasis();
  }, [photos.length, layout, triggerEmphasis]);

  const prevPhoto = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setIsRotating(false);
    triggerEmphasis();
  }, [photos.length, triggerEmphasis]);

  // Handle auto-rotation orchestration with emphasis cycles
  useEffect(() => {
    if (isRotating) {
      // Total cycle loop time: Transition + Emphasis Hold + Return/Rest
      rotationTimerRef.current = window.setInterval(nextPhoto, 6500);
      triggerEmphasis();
    } else if (rotationTimerRef.current) {
      clearInterval(rotationTimerRef.current);
    }
    return () => {
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
      if (emphasisTimeoutRef.current) clearTimeout(emphasisTimeoutRef.current);
    };
  }, [isRotating, nextPhoto, triggerEmphasis]);

  const toggleLayout = () => {
    const currentIndex = LAYOUTS.indexOf(layout);
    setLayout(LAYOUTS[(currentIndex + 1) % LAYOUTS.length]);
    setIsRotating(false);
  };

  const handleAIMoodBoost = async () => {
    setLoading(true);
    try {
      const currentPhoto = photos[activeIndex];
      const analysis = await geminiService.analyzePhotoMood(currentPhoto.title);
      
      const newPhotos = [...photos];
      newPhotos[activeIndex] = { ...currentPhoto, mood: analysis.mood, description: analysis.caption };
      setPhotos(newPhotos);

      const themeText = await geminiService.generateGalleryMood(analysis.mood);
      setGalleryMood(themeText);
    } catch (error) {
      console.error("AI Memory pulse error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = photos[activeIndex];

  const handleManualSelect = (idx: number) => {
    if (idx === activeIndex && isEmphasized) {
      setIsEmphasized(false);
    } else {
      setActiveIndex(idx);
      setIsRotating(false);
      triggerEmphasis();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050507] text-white selection:bg-rose-500">
      {/* Dynamic Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-[1000px] h-[1000px] bg-rose-900/10 rounded-full blur-[220px] transition-all duration-2000 ${isEmphasized ? 'scale-150 opacity-60 translate-x-[-10%] translate-y-[-10%]' : 'animate-pulse'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[180px] transition-all duration-2000 ${isEmphasized ? 'scale-150 opacity-60 translate-x-[10%] translate-y-[10%]' : 'animate-pulse'}`} />
        <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] transition-opacity duration-1000 ${isEmphasized ? 'opacity-25' : 'opacity-10'}`} />
      </div>

      {/* Header UI - Fully hidden during emphasis */}
      <header className={`absolute top-0 left-0 w-full p-6 md:p-12 z-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition-all duration-1000 ${isEmphasized ? 'opacity-0 translate-y-[-20px] pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-rose-600 to-amber-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-[-0.05em] uppercase italic leading-none flex items-center gap-2">
              Wedding <span className="text-rose-400">Prism</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-0.5 w-6 bg-rose-500/50"></div>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-black">Memory Engine Pro v4.2</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 backdrop-blur-3xl bg-white/5 p-2 rounded-2xl border border-white/10">
          <button 
            onClick={toggleLayout}
            className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-white/10 transition-all group"
          >
            <Layout className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{layout}</span>
          </button>
          
          <div className="w-px h-6 bg-white/10" />

          <button 
            onClick={handleAIMoodBoost}
            disabled={loading}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all
              ${loading ? 'bg-neutral-800 text-neutral-500' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]'}
            `}
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'animate-pulse'}`} />
            {loading ? 'ANALYZING...' : 'AI INSIGHT'}
          </button>

          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-3 hover:bg-white/10 rounded-xl transition-all"
          >
            <Info className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </header>

      {/* Primary 3D Stage */}
      <main className="relative w-full h-full flex items-center justify-center perspective-stage z-10">
        <div 
          className="relative w-full h-full preserve-3d transition-transform duration-[2000ms] cubic-bezier(0.15, 1, 0.3, 1)"
          style={{ 
            transform: `translateZ(${isEmphasized ? '-1800px' : (layout === 'tunnel' ? '0px' : '-400px')})`
          }}
        >
          {photos.map((photo, idx) => (
            <PhotoCard 
              key={photo.id}
              photo={photo}
              index={idx}
              total={photos.length}
              activeIndex={activeIndex}
              layout={layout}
              isEmphasized={isEmphasized}
              onClick={() => handleManualSelect(idx)}
            />
          ))}
        </div>
      </main>

      {/* Footer UI - Fully hidden during emphasis */}
      <footer className={`absolute bottom-0 left-0 w-full p-8 md:p-12 z-50 pointer-events-none transition-all duration-1000 ${isEmphasized ? 'translate-y-full opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'}`}>
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          
          {/* Active Image Info Panel */}
          <div className="max-w-xl pointer-events-auto group">
            <div className="flex items-center gap-4 mb-5">
               <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-rose-300 border border-rose-500/20">
                  Memory {activeIndex + 1} / {photos.length}
               </div>
               <div className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4 italic leading-tight uppercase">
              {currentPhoto.description || currentPhoto.title}
            </h2>
            <p className="text-rose-100/40 text-sm md:text-base leading-relaxed font-serif max-w-md italic border-l-2 border-rose-500/50 pl-6">
               "{galleryMood}"
            </p>
          </div>

          {/* Player Controls Panel */}
          <div className="flex flex-col items-end gap-6 pointer-events-auto">
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-3xl p-4 rounded-[2rem] border border-white/5 shadow-2xl">
              <button 
                onClick={() => setIsRotating(!isRotating)}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all border
                  ${isRotating ? 'bg-rose-600 border-rose-400 text-white animate-glow' : 'bg-white/5 border-white/10 text-neutral-400'}
                `}
              >
                {isRotating ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              
              <div className="w-px h-10 bg-white/10" />

              <div className="flex gap-2">
                <button 
                  onClick={prevPhoto}
                  className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all group"
                >
                  <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={nextPhoto}
                  className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all group"
                >
                  <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Hero Info - Subtle and minimal during emphasis, no clickable elements */}
      <div className={`fixed inset-x-0 bottom-0 flex justify-center pointer-events-none z-[60] transition-all duration-[1500ms] ${isEmphasized ? 'opacity-100 translate-y-[-40px]' : 'opacity-0 translate-y-10'}`}>
         <div className="px-8 py-3 bg-black/20 backdrop-blur-md border border-white/5 rounded-full">
            <p className="text-white/40 font-black italic tracking-[0.4em] text-xs uppercase">
               {currentPhoto.title}
            </p>
         </div>
      </div>

      {/* Documentation Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8">
           <div className="max-w-4xl w-full relative">
              <h2 className="text-7xl font-black mb-12 italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20">
                Spatial<br/>Archive
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-neutral-400 text-lg leading-relaxed font-light">
                <div className="space-y-6">
                  <p>
                    <strong className="text-rose-400 font-bold">Wedding Prism</strong> is a high-fidelity cinematic archive. It transforms digital photography into a living volumetric experience using hardware-accelerated CSS transforms.
                  </p>
                  <p>
                    Utilizing <strong className="text-white">Gemini 3 Flash</strong>, the environment dynamically reconfigures itself based on semantic mood analysis, creating a bridge between memory and machine.
                  </p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4">
                  <h4 className="text-rose-400 font-black text-xs tracking-widest uppercase">Engine Specifications</h4>
                  <ul className="text-sm space-y-3 opacity-80">
                    <li className="flex justify-between"><span>Core Assets:</span> <span className="text-white">100 Photographic Objects</span></li>
                    <li className="flex justify-between"><span>Spatial Modes:</span> <span className="text-white">8 Visual Dimensions</span></li>
                    <li className="flex justify-between"><span>Hero Pulse:</span> <span className="text-white">Active Zoom Tracking</span></li>
                    <li className="flex justify-between"><span>AI Integration:</span> <span className="text-white">Real-time Semantic Loop</span></li>
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => setShowInfo(false)}
                className="mt-16 px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-rose-50 transition-all uppercase tracking-[0.2em] text-xs shadow-xl shadow-white/10"
              >
                Return to Gallery
              </button>
           </div>
        </div>
      )}

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(225,29,72,0.4); }
          50% { box-shadow: 0 0 40px rgba(225,29,72,0.8); }
        }
        .animate-glow {
          animation: glow 2s infinite;
        }
        .perspective-stage {
          perspective: 2500px;
          perspective-origin: 50% 50%;
        }
      `}</style>
    </div>
  );
};

export default App;
