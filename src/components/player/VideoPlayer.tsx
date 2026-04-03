"use client";

import React, { useRef, useEffect } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { Stream, VideoPerformanceSettings } from '@/types';
import { useHealthStore } from '@/lib/streams/StreamHealthMonitor';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Camera,
  Circle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  AlertTriangle,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  stream: Stream;
  settings: VideoPerformanceSettings;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, settings }) => {
  const {
    videoRef,
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    toggleMute,
    changeVolume,
    takeScreenshot,
    startRecording,
    stopRecording,
    isRecording,
  } = useVideoPlayer({ stream, settings });

  const getEmbedUrl = () => {
    if (stream.type === 'youtube') {
      const vid = stream.url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
      return `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1`;
    }
    if (stream.type === 'twitch') {
      const channel = stream.url.split('/').pop();
      return `https://player.twitch.tv/?channel=${channel}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&autoplay=true&muted=true`;
    }
    return stream.url;
  };

  const isEmbed = ['youtube', 'twitch', 'iframe'].includes(stream.type);

  const health = useHealthStore((state) => state.streamHealth[stream.id]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.id === stream.id) {
        if (detail.action === 'screenshot') takeScreenshot();
        if (detail.action === 'record') {
          if (isRecording) stopRecording();
          else startRecording();
        }
        if (detail.action === 'fullscreen') toggleFullscreen();
      }
    };
    window.addEventListener('player-action', handleAction);
    return () => window.removeEventListener('player-action', handleAction);
  }, [stream.id, takeScreenshot, isRecording, startRecording, stopRecording]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const getSignalIcon = () => {
    if (!health || health.status === 'offline') return <AlertTriangle className="text-red-500 w-4 h-4" />;
    if (health.status === 'reconnecting') return <SignalLow className="text-yellow-500 w-4 h-4 animate-pulse" />;

    if (health.bufferLength > 5) return <SignalHigh className="text-green-500 w-4 h-4" />;
    if (health.bufferLength > 2) return <SignalMedium className="text-yellow-500 w-4 h-4" />;
    return <SignalLow className="text-red-500 w-4 h-4" />;
  };

  return (
    <div
      ref={containerRef}
      className="group relative w-full h-full bg-black overflow-hidden rounded-lg border border-white/10 hover:border-cyan-500/50 transition-colors"
    >
      {isEmbed ? (
        <iframe
          src={getEmbedUrl()}
          className="w-full h-full border-none"
          allow="autoplay; fullscreen"
        />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          muted={isMuted}
        />
      )}

      {/* Overlay: Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
              health?.status === 'live' ? "bg-green-500 text-white" :
              health?.status === 'reconnecting' ? "bg-yellow-500 text-black" :
              "bg-red-500 text-white"
            )}>
              <Circle className={cn("w-2 h-2 fill-current", health?.status === 'live' && "animate-pulse")} />
              {health?.status || 'OFFLINE'}
            </span>
          {settings.showLabels && (
            <span className="text-white text-xs font-medium drop-shadow-md">{stream.name}</span>
          )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/70">
            <span>{health?.currentResolution || '0p'}</span>
            <span>•</span>
            <span>{health?.currentBitrate ? `${Math.round(health.currentBitrate)} kbps` : '0 kbps'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          {getSignalIcon()}
        </div>
      </div>

      {/* Overlay: Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-4 h-4 fill-current" /> : <Play className="h-4 h-4 fill-current" />}
          </Button>

          <div className="flex items-center gap-2 group/volume">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeX className="h-4 h-4" /> : <Volume2 className="h-4 h-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-0 group-hover/volume:w-20 transition-all accent-cyan-500 h-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 text-white hover:bg-white/20", isRecording && "text-red-500")}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Video className={cn("h-4 h-4", isRecording && "animate-pulse")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={takeScreenshot}>
            <Camera className="h-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleFullscreen}>
            <Maximize className="h-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-12 left-3 flex items-center gap-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full" />
          REC
        </div>
      )}

      {/* Buffer/Loading Spinner */}
      {health?.status === 'reconnecting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-white text-xs font-medium">Reconnecting...</span>
          </div>
        </div>
      )}
    </div>
  );
};
