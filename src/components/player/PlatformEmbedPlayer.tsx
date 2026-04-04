"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Channel } from '@/types';
import { Loader2, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface YouTubeEmbedPlayerProps {
  channel: Channel;
}

export const PlatformEmbedPlayer: React.FC<YouTubeEmbedPlayerProps> = ({ channel }) => {
  const { networkSettings } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'loading' | 'connecting' | 'still-connecting' | 'error' | 'ready'>('loading');
  const [isInView, setIsInView] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [errorTimer, setErrorTimer] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Extract YouTube ID
  const getVideoId = (url: string) => {
    const match = url.match(/(?:v=|\/|live\/)([0-9A-Za-z_-]{11})/);
    return match?.[1] || '';
  };

  const videoId = getVideoId(channel.channelUrl);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isInView) {
      // Off-screen: clear src to about:blank to save resources if off-screen for a bit
      const timer = setTimeout(() => {
        setVideoUrl('about:blank');
        setIsLoading(true);
        setStatus('loading');
      }, 30000);
      return () => clearTimeout(timer);
    } else {
      // In-view: restore src
      const baseUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
      const params = new URLSearchParams({
        autoplay: '1',
        mute: '0',
        controls: '1',
        modestbranding: '1',
        rel: '0',
        playsinline: '1',
        enablejsapi: '1',
        iv_load_policy: '3',
        cc_load_policy: '0',
        annotations: '0'
      });
      setVideoUrl(`${baseUrl}?${params.toString()}`);
      startTimeRef.current = Date.now();
      startStatusTimers();
    }
  }, [isInView, videoId]);

  const startStatusTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setStatus('loading');

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;

      if (elapsed >= 15) {
        setStatus('error');
        clearInterval(timerRef.current!);
      } else if (elapsed >= 10) {
        setStatus('still-connecting');
      } else if (elapsed >= 5) {
        setStatus('connecting');
      }
    }, 1000);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setStatus('ready');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleRefresh = () => {
    const currentUrl = videoUrl;
    setVideoUrl('about:blank');
    setTimeout(() => {
      setVideoUrl(currentUrl);
      startTimeRef.current = Date.now();
      startStatusTimers();
    }, 100);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group overflow-hidden rounded-lg aspect-video">
      {status !== 'ready' && videoUrl !== 'about:blank' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0a0a0f] text-white">
          {status === 'error' ? (
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="space-y-1">
                <p className="font-bold text-lg">Unable to connect</p>
                <p className="text-white/40 text-sm">This live stream may be unavailable or restricted.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <a
                  href={channel.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-sm font-bold transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in YouTube
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse rounded-full" />
              </div>
              <div className="mt-6 flex flex-col items-center gap-1">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                  {status === 'loading' && 'Initialising...'}
                  {status === 'connecting' && 'Connecting...'}
                  {status === 'still-connecting' && 'Still connecting...'}
                </span>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">YouTube Live Node</span>
              </div>
            </>
          )}
        </div>
      )}

      {videoUrl !== 'about:blank' && (
        <iframe
          src={videoUrl}
          className={cn(
            "w-full h-full border-none transition-opacity duration-700",
            status === 'ready' ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          title={channel.name}
        />
      )}

      {videoUrl === 'about:blank' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f] text-white/20">
          <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin opacity-20" />
          </div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest">Off-screen standby</p>
        </div>
      )}
    </div>
  );
};
