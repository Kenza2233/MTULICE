"use client";

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BackgroundConfig } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export const BackgroundRenderer: React.FC = () => {
  const { backgroundLayers, streams } = useAppStore();
  const streamCount = streams.length;

  // Performance Safeguard: Don't render animated backgrounds if > 8 streams
  const isPerformanceMode = streamCount > 8;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0f]">
      <AnimatePresence>
        {backgroundLayers.map((layer, index) => (
          <BackgroundLayer
            key={layer.id}
            layer={layer}
            index={index}
            isPerformanceMode={isPerformanceMode}
          />
        ))}
      </AnimatePresence>

      {/* Global Effects Layer */}
      <div className="absolute inset-0 pointer-events-none bg-noise opacity-[0.03]" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
    </div>
  );
};

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

interface LayerProps {
  layer: BackgroundConfig;
  index: number;
  isPerformanceMode: boolean;
}

const BackgroundLayer: React.FC<LayerProps> = ({ layer, index, isPerformanceMode }) => {
  const { isVisible, opacity, blendMode } = layer.layerSettings;
  if (!isVisible) return null;

  const style: React.CSSProperties = {
    zIndex: index,
    opacity,
    mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
  };

  const renderContent = () => {
    const { type, properties } = layer;

    switch (type) {
      case 'solid':
        return <div className="absolute inset-0" style={{ backgroundColor: properties.color }} />;

      case 'gradient':
        const stops = properties.gradientStops?.map(s => `${s.color} ${s.position}%`).join(', ');
        const gradient = properties.gradientType === 'linear'
          ? `linear-gradient(${properties.gradientAngle}deg, ${stops})`
          : `radial-gradient(circle, ${stops})`;

        return (
          <div
            className={properties.animatedGradient && !isPerformanceMode ? "absolute inset-0 animate-gradient-slow" : "absolute inset-0"}
            style={{ background: gradient, backgroundSize: '200% 200%' }}
          />
        );

      case 'image':
        return (
          <div
            className="absolute inset-0 bg-no-repeat"
            style={{
              backgroundImage: `url(${properties.url})`,
              backgroundSize: properties.fitMode || 'cover',
              backgroundPosition: `${properties.position?.x}% ${properties.position?.y}%`,
              filter: `blur(${properties.blur}px) brightness(${properties.brightness}%) contrast(${properties.contrast}%) saturate(${properties.saturation}%) ${properties.grayscale ? 'grayscale(100%)' : ''} ${properties.sepia ? 'sepia(100%)' : ''}`,
              transform: `scale(${properties.zoom ? properties.zoom / 100 : 1})`,
            }}
          />
        );

      case 'video':
        if (isPerformanceMode) {
          // If in performance mode, show a static frame or placeholder
          return <div className="absolute inset-0 bg-black/20" />;
        }
        return (
          <video
            autoPlay
            loop
            muted={properties.mute !== false}
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: `blur(${properties.blur}px) brightness(${properties.brightness}%)`,
            }}
          >
            <source src={properties.url} type="video/mp4" />
          </video>
        );

      case 'live':
        if (isPerformanceMode) return null;
        return <LiveCanvas type={properties.url || 'particles'} fpsLimit={properties.fpsLimit || 60} />;

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0"
      style={style}
    >
      {renderContent()}
    </motion.div>
  );
};

const LiveCanvas: React.FC<{ type: string, fpsLimit: number }> = ({ type, fpsLimit }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Init particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(0, 212, 255, ${Math.random() * 0.3})`
      });
    }

    let lastTime = 0;
    const interval = 1000 / fpsLimit;

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      if (deltaTime > interval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });

        lastTime = time - (deltaTime % interval);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, fpsLimit]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
};
