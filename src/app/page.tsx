"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { StreamGrid } from "@/components/grid/StreamGrid";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const { streams, addStream, sidebarOpen } = useAppStore();
  useKeyboardShortcuts();

  // Add initial test streams if empty
  useEffect(() => {
    if (streams.length === 0) {
      addStream({
        name: "Test Stream 1",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        tags: ["Sports", "News"],
        priority: "high",
        type: "hls",
      });
      addStream({
        name: "Test Stream 2",
        url: "https://test-streams.mux.dev/pts_6sec_1min/playlist.m3u8",
        tags: ["Gaming"],
        priority: "medium",
        type: "hls",
      });
    }
  }, [streams.length, addStream]);

  return (
    <div className={`flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
      <div className="h-full w-full flex items-center justify-center p-4">
        {streams.length > 0 ? (
          <StreamGrid />
        ) : (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <Plus className="w-8 h-8 text-white/20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">NO STREAMS ACTIVE</h2>
              <p className="text-white/40 text-sm max-w-xs">Add your first stream from the sidebar to start your multi-view experience.</p>
            </div>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold h-12 px-8 gap-2">
              <Plus className="h-5 w-5" />
              ADD YOUR FIRST STREAM
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
