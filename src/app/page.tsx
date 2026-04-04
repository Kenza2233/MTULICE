"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { StreamGrid } from "@/components/grid/StreamGrid";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor";
import { cn } from "@/lib/utils";

export default function Home() {
  const { channels, sidebarOpen, interfaceSettings } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useKeyboardShortcuts();
  useNetworkMonitor();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn(
      "flex-1 overflow-hidden transition-all",
      interfaceSettings.animations ? "duration-300" : "duration-0",
      sidebarOpen ? 'md:ml-72' : 'ml-0'
    )}>
      <div className="h-full w-full">
        <StreamGrid />
      </div>
    </div>
  );
}
