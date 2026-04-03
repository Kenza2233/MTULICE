"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { StreamGrid } from "@/components/grid/StreamGrid";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddStreamModal } from "@/components/sidebar/AddStreamModal";

export default function Home() {
  const { channels, sidebarOpen } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
      <div className="h-full w-full flex items-center justify-center p-4">
        {channels.length > 0 ? (
          <StreamGrid />
        ) : (
          <div className="flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="w-32 h-32 bg-cyan-500/10 border border-dashed border-cyan-500/20 rounded-3xl flex items-center justify-center animate-pulse">
                <Plus className="w-10 h-10 text-cyan-500/40" />
              </div>
              <div className="absolute -inset-4 bg-cyan-500/5 blur-3xl -z-10 rounded-full" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">No Streams Active</h2>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                Your command center is ready. Add live streams from YouTube, Twitch, Kick, or TikTok to begin your multi-view experience.
              </p>
            </div>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-black h-14 px-10 rounded-2xl gap-3 shadow-2xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
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
