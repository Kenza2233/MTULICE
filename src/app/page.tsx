"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { StreamGrid } from "@/components/grid/StreamGrid";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddStreamModal } from "@/components/sidebar/AddStreamModal";
import { cn } from "@/lib/utils";

export default function Home() {
  const { channels, sidebarOpen, interfaceSettings } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const accentColor = interfaceSettings.accentColor;

  return (
    <div className={cn(
      "flex-1 overflow-hidden transition-all",
      interfaceSettings.animations ? "duration-300" : "duration-0",
      sidebarOpen ? 'ml-72' : 'ml-0'
    )}>
      <div className={cn(
        "h-full w-full flex items-center justify-center",
        interfaceSettings.compactMode ? "p-1" : "p-4"
      )}>
        {channels.length > 0 ? (
          <StreamGrid />
        ) : (
          <div className="flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div
                className="w-32 h-32 bg-white/5 border border-dashed rounded-3xl flex items-center justify-center animate-pulse"
                style={{ borderColor: `${accentColor}40` }}
              >
                <Plus className="w-10 h-10" style={{ color: accentColor, opacity: 0.4 }} />
              </div>
              <div className="absolute -inset-4 blur-3xl -z-10 rounded-full" style={{ backgroundColor: `${accentColor}10` }} />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">No Streams Active</h2>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                Your command center is ready. Add live streams from YouTube, Twitch, Kick, or TikTok to begin your multi-view experience.
              </p>
            </div>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="font-black h-14 px-10 rounded-2xl gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: accentColor, color: 'black', boxShadow: `0 10px 40px ${accentColor}40` }}
            >
              <Plus className="w-6 h-6" />
              ADD YOUR FIRST STREAM
            </Button>
          </div>
        )}
      </div>

      <AddStreamModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
