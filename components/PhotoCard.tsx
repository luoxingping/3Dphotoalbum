
import React, { useMemo } from 'react';
import { Photo, LayoutType } from '../types';

interface PhotoCardProps {
  photo: Photo;
  index: number;
  total: number;
  activeIndex: number;
  layout: LayoutType;
  isEmphasized: boolean;
  onClick: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, index, total, activeIndex, layout, isEmphasized, onClick }) => {
  const isActive = index === activeIndex;

  const transformStyle = useMemo(() => {
    // Phase: High-Impact Hero Zoom
    if (isActive && isEmphasized) {
      return {
        // High zoom to make the photo the absolute focus
        transform: `translateZ(1400px) rotateY(0deg) rotateX(0deg) scale(2.4)`,
        opacity: 1,
        zIndex: 1000,
        filter: 'brightness(1.05) contrast(1.02)',
      };
    }

    // Phase: Standard Gallery View or Background during another's emphasis
    const diff = index - activeIndex;
    const absDiff = Math.abs(diff);
    // If emphasized, hide all other cards completely to avoid distraction
    const globalOpacity = isEmphasized ? (isActive ? 1 : 0) : 1; 
    
    // Helper for Sphere distribution
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;

    let baseTransform = '';
    let opacity = globalOpacity;

    switch (layout) {
      case 'carousel': {
        const angle = diff * (360 / Math.min(total, 15));
        const radius = 800;
        baseTransform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        opacity *= (absDiff > 5 ? 0 : 1);
        break;
      }
      case 'wall': {
        const colSize = 5;
        const row = Math.floor(index / colSize) - Math.floor(activeIndex / colSize);
        const col = (index % colSize) - (activeIndex % colSize);
        baseTransform = `translateX(${col * 330}px) translateY(${row * 430}px) translateZ(${isActive ? 100 : 0}px)`;
        opacity *= Math.max(0.1, 1 - (Math.abs(row) + Math.abs(col)) * 0.2);
        break;
      }
      case 'stack': {
        const z = isActive ? 150 : diff * -50;
        const rotate = diff * 5;
        const y = diff * 15;
        baseTransform = `translateZ(${z}px) rotateZ(${rotate}deg) translateY(${y}px)`;
        opacity *= (isActive ? 1 : Math.max(0, 0.7 - absDiff * 0.1));
        break;
      }
      case 'helix': {
        const angle = diff * 40;
        const y = diff * 120;
        const radius = 500;
        baseTransform = `rotateY(${angle}deg) translateY(${y}px) translateZ(${radius}px)`;
        opacity *= Math.max(0.1, 1 - absDiff * 0.15);
        break;
      }
      case 'tunnel': {
        const z = diff * -400;
        const side = index % 4;
        let tx = 0, ty = 0, rx = 0, ry = 0;
        if (side === 0) { ty = -300; rx = 90; }
        if (side === 1) { tx = 300; ry = -90; }
        if (side === 2) { ty = 300; rx = -90; }
        if (side === 3) { tx = -300; ry = 90; }
        baseTransform = isActive 
          ? `translateZ(200px)` 
          : `translateZ(${z}px) translateX(${tx}px) translateY(${ty}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        opacity *= (isActive ? 1 : Math.max(0, 1 - absDiff * 0.1));
        break;
      }
      case 'sphere': {
        const r = 800;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        baseTransform = `rotateY(${activeIndex * -15}deg) rotateX(${activeIndex * 5}deg) translate3d(${x}px, ${y}px, ${z}px) rotateY(${theta}rad) rotateX(${phi}rad)`;
        opacity *= (isActive ? 1 : 0.4);
        break;
      }
      case 'galaxy': {
        const seed = index * 123.45;
        const rx = Math.sin(seed) * 1200;
        const ry = Math.cos(seed * 0.8) * 800;
        const rz = Math.sin(seed * 1.2) * 1500;
        baseTransform = `translate3d(${rx}px, ${ry}px, ${rz}px) rotateX(${seed % 360}deg)`;
        opacity *= (isActive ? 1 : 0.2);
        break;
      }
      case 'book': {
        const angle = diff * 15;
        const tx = diff * 50;
        baseTransform = `translateX(${tx}px) rotateY(${angle}deg) translateZ(${isActive ? 100 : 0}px)`;
        opacity *= Math.max(0.1, 1 - absDiff * 0.15);
        break;
      }
    }

    return {
      transform: baseTransform,
      opacity: opacity,
      zIndex: isActive ? 100 : 0,
      visibility: opacity <= 0 ? 'hidden' : 'visible'
    };
  }, [index, activeIndex, total, layout, isActive, isEmphasized]);

  return (
    <div
      onClick={onClick}
      className={`absolute top-1/2 left-1/2 -mt-[200px] -ml-[150px] w-[300px] h-[400px] cursor-pointer transition-all duration-[2000ms] cubic-bezier(0.15, 1, 0.3, 1) preserve-3d
        ${isActive ? 'z-50' : 'z-0'}
      `}
      style={transformStyle as any}
    >
      <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border transition-all duration-[1200ms] bg-neutral-900 group
        ${isActive 
          ? `border-rose-400/90 scale-100 ${isEmphasized ? 'shadow-[0_0_150px_rgba(251,113,133,0.4)]' : 'shadow-[0_0_60px_rgba(251,113,133,0.3)]'}` 
          : 'border-white/5 grayscale-[0.3] hover:grayscale-0 hover:border-white/20'}
      `}>
        <img 
          src={photo.url} 
          alt={photo.title}
          className={`w-full h-full object-cover transition-transform duration-[4000ms] ${isActive && isEmphasized ? 'scale-105' : 'scale-110'}`}
        />
        
        {/* Breathing glow for active card */}
        {isActive && !isEmphasized && (
          <div className={`absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none`} />
        )}

      </div>
      
      {/* Floor reflection logic - Hide during emphasis */}
      {['carousel', 'wall', 'stack', 'book'].includes(layout) && !isEmphasized && (
        <div 
          className="absolute -bottom-[410px] left-0 w-full h-full rounded-2xl overflow-hidden opacity-10 pointer-events-none transition-all duration-1000"
          style={{
            transform: 'rotateX(180deg) scaleY(0.7)',
            maskImage: 'linear-gradient(to top, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to top, transparent, black)',
          }}
        >
          <img src={photo.url} alt="reflection" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};

export default PhotoCard;
