"use client";

import React, { useEffect, useState } from 'react';
import { useBandwidthStore, GlobalBandwidthManager } from '@/lib/bandwidth/GlobalBandwidthManager';
import { Activity, LayoutGrid, Settings, Maximize2, Menu, Share2, PlusCircle, Monitor, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { metrics } = useBandwidthStore();
  const { streams, sidebarOpen, setSidebarOpen, setSettingsOpen, displaySettings } = useAppStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    GlobalBandwidthManager.getInstance();
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getBandwidthColor = () => {
    if (metrics.totalDownloadSpeed > 10) return 'text-green-500';
    if (metrics.totalDownloadSpeed > 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const activeStreamsCount = streams.length;

  return (
    <header className="h-14 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md flex items-center justify-between px-4 z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <LayoutGrid className="text-black h-5 w-5" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">MULTILIVE</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10 mx-2" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <Activity className={cn("h-3.5 w-3.5", getBandwidthColor())} />
            <span className="text-xs font-mono text-white/80">
              {metrics.totalDownloadSpeed.toFixed(2)} Mbps
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <Monitor className="h-3.5 w-3.5 text-cyan-500" />
            <span className="text-xs font-mono text-white/80">
              {metrics.latency.toFixed(0)} ms
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/40">
            <PlusCircle className="h-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{activeStreamsCount} / 12 STREAMS</span>
          </div>
        </div>

        {displaySettings.showClock && (
          <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <Clock className="w-3.5 h-3.5 text-white/30" />
            <span className="text-xs font-mono text-white/60">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5">
          <Share2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5" onClick={() => {
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
        }}>
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
