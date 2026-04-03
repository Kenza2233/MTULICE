"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Channel } from '@/types';
import { Loader2, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface PlatformEmbedPlayerProps {
  channel: Channel;
}

export const PlatformEmbedPlayer: React.FC<PlatformEmbedPlayerProps> = ({ channel }) => {
  const { networkSettings } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!networkSettings.lazyLoad && !networkSettings.autoPauseOffScreen) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [networkSettings.lazyLoad, networkSettings.autoPauseOffScreen]);

  useEffect(() => {
    if (!isInView && (networkSettings.lazyLoad || networkSettings.autoPauseOffScreen)) {
      setEmbedUrl('');
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    const getEmbedUrl = () => {
      const url = channel.channelUrl;
      const platform = channel.platform;
      const domain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

      switch (platform) {
        case 'youtube': {
          const vid = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
          return `https://www.youtube.com/embed/${vid}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`;
        }
        case 'twitch': {
          const name = url.split('/').pop()?.split('?')[0];
          return `https://player.twitch.tv/?channel=${name}&parent=${domain}&muted=false`;
        }
        case 'tiktok': {
          const vid = url.match(/\/live\/(\d+)/)?.[1] || url.split('/').pop();
          return `https://www.tiktok.com/embed/v2/${vid}`;
        }
        case 'kick': {
          const name = url.split('/').pop()?.split('?')[0];
          return `https://player.kick.com/${name}?muted=false`;
        }
        case 'facebook': {
          return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true`;
        }
        case 'rumble': {
          const vid = url.match(/\/embed\/([a-zA-Z0-9]+)/)?.[1] || url.split('/').pop();
          return `https://rumble.com/embed/${vid}/`;
        }
        case 'trovo': {
          const name = url.split('/').pop()?.split('?')[0];
          return `https://trovo.live/embed/${name}`;
        }
        case 'dlive': {
          const name = url.split('/').pop()?.split('?')[0];
          return `https://dlive.tv/embed/player?streamer=${name}`;
        }
        default:
          return url;
      }
    };

    setEmbedUrl(getEmbedUrl());
  }, [channel.channelUrl, channel.platform]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group overflow-hidden rounded-lg">
      {isLoading && isInView && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a0f]/40 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      )}

      {!isInView && (networkSettings.lazyLoad || networkSettings.autoPauseOffScreen) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0a0a0f] text-white/20 gap-2">
          <EyeOff className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Paused</span>
        </div>
      )}

      {isInView && (
        <iframe
        ref={iframeRef}
        src={embedUrl}
        className={cn(
          "w-full h-full border-none transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      />
      )}
    </div>
  );
};
