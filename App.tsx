
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Photo, LayoutType } from './types';
import PhotoCard from './components/PhotoCard';
import * as geminiService from './services/geminiService';
import { Sparkles, ChevronLeft, ChevronRight, Info, Layout, Heart, Play, Pause, AlertCircle, Music, Volume2, VolumeX } from 'lucide-react';

/**
 * 【自定义配置】
 */
const STAY_DURATION = 8000; // 相片停顿时间（毫秒）

/**
 * 修改音乐背景：将下方的链接替换为您自己的 MP3 音乐直链
 * 推荐使用：婚礼进行曲、钢琴曲或舒缓的抒情歌曲
 */
const BACKGROUND_MUSIC_URL = "https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-242.mp3"; 

const PROVIDED_PHOTO_URLS = [
  "https://s41.ax1x.com/2026/01/29/pZWoXjg.jpg",
  "https://s41.ax1x.com/2026/01/29/pZWoOgS.jpg",
  "https://s41.ax1x.com/2026/01/29/pZWoL38.jpg",
  "https://s41.ax1x.com/2026/01/29/pZWoq9f.jpg",
  "https://s41.ax1x.com/2026/01/29/pZWoH4P.jpg",
  "https://s41.ax1x.com/2026/01/29/pZWo7Nt.jpg",
  "https://s41.ax1x.com/2026/01/29/pZWoTAI.jpg",
  "https://s41.ax1x.com/2026/01/29/pZWoIHA.jpg"
];

const CHINESE_TEXTS = [
  "同心结彩——红绳系同心，今生绾做双丝网，岁岁共春芳。",
  "良辰佳偶——恰逢最好时辰，遇见最好之人，自此朝夕皆良辰。",
  "琴瑟和鸣——心弦相协，奏一世清欢；岁月悠长，歌永如初见。",
  "星河共渡——爱是银河里并肩的舟，从此漫漫辰光，皆向同一处流淌。",
  "岁月沉香——时光会为真挚的爱沉淀香气，愈久愈深，愈酿愈醇。",
  "比翼春山——如鸟双飞，跨越山海；如枝连理，共沐春秋风雨。",
  "暖灯守候——愿你们为彼此点亮一盏归家的灯，黑夜再长，总有温暖相迎。",
  "初心皎洁——初见时心动如月华，愿多年后仍清澈如昔，映照彼此眉间。",
  "画卷长舒——爱是缓缓展开的长卷，每一笔都染着彩霞，写着余生繁华。",
  "甘醴同斟——生活如酒，共酿共饮；苦涩皆淡，甘甜愈浓。",
  "烟火人间——在寻常炊烟里看见浪漫，在琐碎光阴中握紧温柔。",
  "梧桐栖凤——佳缘天成，福泽绵长；家安梧桐，双凤栖鸣。",
  "静水流深——爱不必喧哗，似静水深沉却滋养生命，默默流淌成永恒。",
  "并肩四季——春樱，夏雨，秋叶，冬雪，四季风景皆因并肩而完整。",
  "锦书云寄——若暂别离，思念化雁字；若长相守，日日是锦书。",
  "盟誓三生——前世约，今生续，来世期；三生石上姓名并，红尘不负相思意。",
  "韶光共惜——青春会老，深情不旧；白发携手，犹记红颜笑眸。",
  "舟行同楫——人生江海有时浪，同舟共楫，便无惧风雨兼程。",
  "心苑长春——在彼此心里种一座花园，四季不败，花开不谢。",
  "天地方圆——以家为宇宙，以爱为法则，经营属于自己的圆满人间。",
  "永恒之誓——愿你们的誓言如星璀璨，跨越时间，永驻心间。",
  "初舞韶华——第一支舞旋起一生的韵律，步步皆温柔，帧帧成诗篇。",
  "鎏金记忆——往昔点滴镀上金色的光，未来长路铺满温暖的回忆。",
  "神圣盟约——以爱为名缔结生命的契约，从此风雨共担，晴暖相随。",
  "耳畔轻语——那些低声诉说的爱意，终汇成岁月里最动人的回响。",
  "晨光映爱——朝晖洒满新途，相爱如晨光清澈，日子渐明渐亮。",
  "盛宴欢庆——今日欢笑满堂，祝福盈耳，共庆良缘天成，佳偶同心。",
  "花韵雅姿——仿佛春芳凝于鬓边，爱是优雅绽放的永生花束。",
  "执手同行——掌心相贴的温暖，是往后余生最坚定的陪伴与勇气。",
  "永世之约——此约既定，山海无移；时光尽头，依旧相爱如初。"
];

const generatePhotos = (count: number): Photo[] => {
  return Array.from({ length: count }, (_, i) => {
    const photoIdx = i % PROVIDED_PHOTO_URLS.length;
    const textIdx = i % CHINESE_TEXTS.length;
    const [title, description] = CHINESE_TEXTS[textIdx].split('——');
    
    return {
      id: `${i + 1}`,
      url: PROVIDED_PHOTO_URLS[photoIdx],
      title: title,
      description: description,
    };
  });
};

const INITIAL_PHOTOS = generatePhotos(100); 
const LAYOUTS: LayoutType[] = ['carousel', 'wall', 'stack', 'helix', 'tunnel', 'sphere', 'galaxy', 'book'];

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [layout, setLayout] = useState<LayoutType>('carousel');
  const [galleryMood, setGalleryMood] = useState("两情若是久长时，又岂在朝朝暮暮。");
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isEmphasized, setIsEmphasized] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  const rotationTimerRef = useRef<number | null>(null);
  const emphasisTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        console.warn("由于浏览器安全限制，首次播放可能需要手动点击页面。");
      });
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const triggerEmphasis = useCallback(() => {
    setTimeout(() => {
      setIsEmphasized(true);
      emphasisTimeoutRef.current = window.setTimeout(() => setIsEmphasized(false), 3000);
    }, 1200);
  }, []);

  const nextPhoto = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % photos.length);
    triggerEmphasis();
  }, [photos.length, triggerEmphasis]);

  const prevPhoto = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setIsRotating(false);
    triggerEmphasis();
  }, [photos.length, triggerEmphasis]);

  useEffect(() => {
    if (isRotating) {
      rotationTimerRef.current = window.setInterval(nextPhoto, STAY_DURATION);
      triggerEmphasis();
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
      setGalleryMood(await geminiService.generateGalleryMood(analysis.mood));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050507] text-white">
      <audio ref={audioRef} src={BACKGROUND_MUSIC_URL} loop />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-[1000px] h-[1000px] bg-rose-900/10 rounded-full blur-[220px] transition-all duration-2000 ${isEmphasized ? 'scale-150 opacity-60' : 'animate-pulse'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[180px] transition-all duration-2000 ${isEmphasized ? 'scale-150 opacity-60' : 'animate-pulse'}`} />
      </div>

      <header className={`absolute top-0 left-0 w-full p-8 md:p-12 z-50 flex justify-between items-center transition-all duration-1000 ${isEmphasized ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
            {isMusicPlaying && (
              <div className="absolute inset-0 border-2 border-rose-500/30 rounded-2xl animate-ping" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Wedding <span className="text-rose-400">Prism</span></h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black mt-2">Music & Visual Harmony</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl">
          <button onClick={toggleMusic} className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${isMusicPlaying ? 'bg-rose-500/20 text-rose-400' : 'hover:bg-white/10 text-white/60'}`}>
            {isMusicPlaying ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{isMusicPlaying ? '音乐已开启' : '播放背景音乐'}</span>
          </button>
          
          <button onClick={toggleLayout} className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-white/10 transition-all">
            <Layout className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{layout}</span>
          </button>
          <button onClick={handleAIMoodBoost} disabled={loading} className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? 'ANALYZING...' : 'AI 诗意'}
          </button>
          <button onClick={() => setShowInfo(true)} className="p-3 hover:bg-white/10 rounded-xl transition-all">
            <Info className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </header>

      <main className="relative w-full h-full perspective-stage flex items-center justify-center z-10">
        <div 
          className="relative w-full h-full preserve-3d transition-transform duration-[2000ms] cubic-bezier(0.15, 1, 0.3, 1)"
          style={{ transform: `translateZ(${isEmphasized ? '-1800px' : '-400px'})` }}
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
              onClick={() => { setActiveIndex(idx); setIsRotating(false); triggerEmphasis(); }}
            />
          ))}
        </div>
      </main>

      <footer className={`absolute bottom-0 left-0 w-full p-12 z-50 pointer-events-none transition-all duration-1000 ${isEmphasized ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="max-w-screen-2xl mx-auto flex justify-between items-end">
          <div className="max-w-3xl pointer-events-auto">
            <div className="flex items-center gap-4 mb-4">
               <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-rose-300 border border-rose-500/20">
                  珍藏瞬间 {activeIndex + 1} / {photos.length}
               </div>
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-white mb-4">
              {photos[activeIndex].title}
            </h2>
            <p className="text-rose-100/60 text-xl leading-relaxed font-serif italic border-l-4 border-rose-500/50 pl-6 max-w-2xl">
               {photos[activeIndex].description || galleryMood}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-3xl p-4 rounded-[2rem] border border-white/5 shadow-2xl pointer-events-auto">
            <button onClick={() => setIsRotating(!isRotating)} className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all border ${isRotating ? 'bg-rose-600 border-rose-400 text-white animate-glow' : 'bg-white/5 border-white/10 text-neutral-400'}`}>
              {isRotating ? <Pause /> : <Play />}
            </button>
            <div className="flex gap-2">
              <button onClick={prevPhoto} className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all">
                <ChevronLeft />
              </button>
              <button onClick={() => { nextPhoto(); setIsRotating(false); }} className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all">
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <div className={`fixed inset-x-0 bottom-0 flex justify-center pointer-events-none z-[60] transition-all duration-[1500ms] ${isEmphasized ? 'opacity-100 translate-y-[-40px]' : 'opacity-0 translate-y-10'}`}>
         <div className="px-8 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
            <p className="text-white/60 font-bold italic tracking-[0.4em] text-[12px] uppercase">
               {photos[activeIndex].title}
            </p>
         </div>
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 overflow-y-auto">
           <div className="max-w-4xl w-full py-20">
              <div className="flex items-start gap-4 mb-4">
                 <Heart className="w-8 h-8 text-rose-500" />
                 <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-none text-white">Music<br/>Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-neutral-400 text-lg mt-12">
                <div className="space-y-6">
                  <h3 className="text-white font-bold text-xl">如何更换背景音乐？</h3>
                  <p>1. 在 <code className="bg-white/10 px-2 py-1 rounded text-rose-300">App.tsx</code> 的顶部找到 <code className="text-white">BACKGROUND_MUSIC_URL</code>。</p>
                  <p>2. 准备一个 MP3 文件链接（例如上传至云盘或服务器）。</p>
                  <p>3. 替换该链接并保存。系统将自动加载新音轨。</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4 text-sm">
                  <h4 className="text-rose-400 font-black tracking-widest uppercase">当前状态</h4>
                  <ul className="space-y-3 opacity-80">
                    <li className="flex justify-between"><span>播放状态:</span> <span className="text-white">{isMusicPlaying ? '正在播放' : '已暂停'}</span></li>
                    <li className="flex justify-between"><span>循环模式:</span> <span className="text-white">全列表循环</span></li>
                    <li className="flex justify-between border-t border-white/10 pt-3"><span>音质:</span> <span className="text-rose-500">HI-FI</span></li>
                  </ul>
                </div>
              </div>
              <button onClick={() => setShowInfo(false)} className="mt-16 px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-rose-50 transition-all uppercase tracking-[0.2em] text-xs shadow-xl">返回存档</button>
           </div>
        </div>
      )}

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(225,29,72,0.4); }
          50% { box-shadow: 0 0 40px rgba(225,29,72,0.8); }
        }
        .animate-glow { animation: glow 2s infinite; }
        .perspective-stage { perspective: 2500px; perspective-origin: 50% 50%; }
      `}</style>
    </div>
  );
};

export default App;
