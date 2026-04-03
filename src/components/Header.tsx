"use client";

import React, { useEffect, useState } from 'react';
import { LayoutGrid, Settings, Maximize2, Menu, Share2, PlusCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { channels, sidebarOpen, setSidebarOpen, setSettingsOpen, displaySettings } = useAppStore();
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return (
    <header className="h-14 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md flex items-center justify-between px-4 z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center gap-4 opacity-0">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg" />
      </div>
    </header>
  );

  const activeCount = channels.length;

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
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <LayoutGrid className="text-black h-5 w-5" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">Multilive</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10 mx-2" />
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <PlusCircle className="h-3.5 w-3.5 text-cyan-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{activeCount} / 12 STREAMS ACTIVE</span>
          </div>
        </div>

        {displaySettings.showClock && time && (
          <div className="ml-2 hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
            <Clock className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5">
          <Share2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
        <div className="h-4 w-[1px] bg-white/10 mx-1.5" />
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5" onClick={() => {
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
        }}>
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
