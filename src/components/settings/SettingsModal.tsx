"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import {
  X,
  Settings as SettingsIcon,
  Monitor,
  Zap,
  Volume2,
  Globe,
  Palette,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { BACKGROUND_PRESETS } from "@/lib/background/presets";

const TAB_TITLES: Record<string, string> = {
  display: "DISPLAY SETTINGS",
  video: "UI & GRID SETTINGS",
  audio: "AUDIO SETTINGS",
  network: "SYSTEM SETTINGS",
  background: "BACKGROUND SETTINGS",
};

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    displaySettings,
    setDisplaySettings,
    videoSettings,
    setVideoSettings,
    audioSettings,
    setAudioSettings,
    resetSettings,
    randomizeBackground,
    setBackgroundLayers,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState("display");

  const handleOpenChange = (open: boolean) => setSettingsOpen(open);

  return (
    <Dialog.Root open={isSettingsOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[85vh] bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl z-[101] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">

          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex w-full h-full flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-[240px] md:min-w-[200px] border-r border-white/5 bg-black/40 p-0 relative flex flex-col shrink-0">
              <div className="flex items-center gap-3 p-6 border-b border-white/5 bg-black/20">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-black" />
                </div>
                <h2 className="text-sm font-black tracking-widest uppercase text-white/80">Settings</h2>
              </div>

              <Tabs.List className="flex flex-col gap-0 py-2">
                <TabButton value="display" icon={<Monitor className="w-4 h-4" />} label="Display" />
                <TabButton value="video" icon={<Zap className="w-4 h-4" />} label="UI & Grid" />
                <TabButton value="audio" icon={<Volume2 className="w-4 h-4" />} label="Audio" />
                <TabButton value="network" icon={<Globe className="w-4 h-4" />} label="System" />
                <TabButton value="background" icon={<Palette className="w-4 h-4" />} label="Background" />
              </Tabs.List>

              <div className="mt-auto p-6 flex justify-center border-t border-white/5">
                <p className="text-[11px] font-medium text-[#555] tracking-widest">v1.0.0-production</p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] relative">
              <div className="h-[72px] border-b border-white/5 flex items-center justify-between px-6 bg-black/10">
                <h3 className="text-[16px] font-semibold uppercase tracking-wide text-white">
                  {TAB_TITLES[activeTab]}
                </h3>

                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-150 active:bg-white/15 z-50">
                    <X className="h-[18px] w-[18px]" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-settings">
                <Tabs.Content value="display" className="space-y-0 animate-in slide-in-from-right-2 duration-300 outline-none">
                  <SettingGroup label="GRID LAYOUT">
                    <div className="grid grid-cols-2 gap-2">
                      <LayoutButton
                        layout="auto"
                        active={displaySettings.gridLayout === 'auto'}
                        onClick={() => setDisplaySettings({ gridLayout: 'auto' })}
                        icon={<AutoGridIcon />}
                        label="AUTO"
                      />
                      <LayoutButton
                        layout="4x3"
                        active={displaySettings.gridLayout === '4x3'}
                        onClick={() => setDisplaySettings({ gridLayout: '4x3' })}
                        icon={<GridIcon cols={4} rows={3} />}
                        label="4X3"
                      />
                      <LayoutButton
                        layout="3x2"
                        active={displaySettings.gridLayout === '3x2'}
                        onClick={() => setDisplaySettings({ gridLayout: '3x2' })}
                        icon={<GridIcon cols={3} rows={2} />}
                        label="3X2"
                      />
                      <LayoutButton
                        layout="2x2"
                        active={displaySettings.gridLayout === '2x2'}
                        onClick={() => setDisplaySettings({ gridLayout: '2x2' })}
                        icon={<GridIcon cols={2} rows={2} />}
                        label="2X2"
                      />
                    </div>
                  </SettingGroup>

                  <SectionDivider />

                  <div className="space-y-0">
                    <SettingToggle
                      label="SHOW STREAM LABELS"
                      description="Display stream names and metadata overlay on each cell"
                      checked={displaySettings.showLabels}
                      onCheckedChange={(val) => {
                        setDisplaySettings({ showLabels: val });
                        setVideoSettings({ showLabels: val });
                      }}
                    />
                    <SettingToggle
                      label="SHOW GLOBAL CLOCK"
                      description="Display the current local time in the top application bar"
                      checked={displaySettings.showClock}
                      onCheckedChange={(val) => setDisplaySettings({ showClock: val })}
                    />
                  </div>

                  <SectionDivider />

                  <SettingGroup label="OVERLAY TRANSPARENCY">
                    <div className="space-y-6 py-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-white/60 uppercase tracking-tight">TRANSPARENCY</span>
                        <span className="text-sm font-mono text-white">{Math.round(displaySettings.overlayOpacity * 100)}%</span>
                      </div>
                      <div className="relative pt-1 pb-6">
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-[#333] rounded-full" />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-1 bg-cyan-500 rounded-full"
                          style={{ width: `${displaySettings.overlayOpacity * 100}%` }}
                        />
                        <input
                          type="range" min="0" max="1" step="0.01"
                          value={displaySettings.overlayOpacity}
                          onChange={(e) => setDisplaySettings({ overlayOpacity: parseFloat(e.target.value) })}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10 h-8 top-[-12px]"
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full shadow-[0_0_8px_rgba(0,255,255,0.4)] pointer-events-none transition-transform duration-150 hover:scale-110"
                          style={{ left: `calc(${displaySettings.overlayOpacity * 100}% - 8px)` }}
                        />

                        <div className="absolute bottom-0 w-full flex justify-between px-0.5">
                          {[0, 25, 50, 75, 100].map(p => (
                            <div key={p} className="flex flex-col items-center">
                              <div className="w-[1px] h-1 bg-white/20 mb-1" />
                              <span className="text-[10px] text-white/30">{p}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="video" className="space-y-0 animate-in slide-in-from-right-2 duration-300 outline-none">
                  <SettingGroup label="ANIMATION & MOTION">
                    <div className="space-y-0">
                       <SettingToggle
                        label="ANIMATED TRANSITIONS"
                        description="Smooth motion interpolation when rearranging the video grid"
                        checked={displaySettings.animatedTransitions}
                        onCheckedChange={(val) => setDisplaySettings({ animatedTransitions: val })}
                      />
                      <SettingToggle
                        label="UI GLASSMORPHISM"
                        description="Apply frosted glass blur effect to all UI overlays and panels"
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </SettingGroup>

                  <SectionDivider />

                  <SettingGroup label="GRID CONSTRAINTS">
                    <div className="py-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h5 className="text-sm font-medium text-white">MAX SIMULTANEOUS STREAMS</h5>
                          <p className="text-xs text-white/40">Higher values increase CPU/GPU usage significantly</p>
                        </div>
                        <input
                          type="number"
                          min="1" max="12"
                          value={videoSettings.maxStreams}
                          onChange={(e) => setVideoSettings({ maxStreams: parseInt(e.target.value) })}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="audio" className="space-y-0 animate-in slide-in-from-right-2 duration-300 outline-none">
                   <SettingGroup label="MASTER GAIN">
                    <div className="space-y-6 py-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-white/60 uppercase tracking-tight">MASTER VOLUME</span>
                        <span className="text-sm font-mono text-white">{Math.round(audioSettings.masterVolume * 100)}%</span>
                      </div>
                      <div className="relative h-1 bg-[#333] rounded-full">
                        <div
                          className="absolute h-full bg-cyan-500 rounded-full"
                          style={{ width: `${audioSettings.masterVolume * 100}%` }}
                        />
                        <input
                          type="range" min="0" max="1" step="0.01"
                          value={audioSettings.masterVolume}
                          onChange={(e) => setAudioSettings({ masterVolume: parseFloat(e.target.value) })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer accent-cyan-500"
                        />
                      </div>
                    </div>
                  </SettingGroup>

                  <SectionDivider />

                  <div className="space-y-0">
                    <SettingToggle
                      label="AUDIO DUCKING"
                      description="Automatically lower volume of other streams when one is focused"
                      checked={audioSettings.audioDucking}
                      onCheckedChange={(val) => setAudioSettings({ audioDucking: val })}
                    />
                    <SettingToggle
                      label="GLOBAL MUTE"
                      description="Toggle audio playback for all stream sources simultaneously"
                      checked={false}
                      onCheckedChange={() => {}}
                    />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="network" className="space-y-6 animate-in slide-in-from-right-2 duration-300 outline-none">
                  <div className="pt-8 flex flex-col gap-3">
                    <Button
                      variant="outline"
                      onClick={resetSettings}
                      className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 h-12 rounded-xl font-bold text-[11px] uppercase tracking-wider"
                    >
                      Reset All Settings to Default
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="w-full border-white/10 text-white/40 hover:bg-white/5 h-12 rounded-xl font-bold text-[11px] uppercase tracking-wider"
                    >
                      Factory Reset & Clear Local Storage
                    </Button>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="background" className="space-y-0 animate-in slide-in-from-right-2 duration-300 outline-none">
                   <div className="p-5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Palette className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-0.5">Active Theme</h4>
                        <p className="text-sm text-cyan-500 font-bold uppercase tracking-wide">Deep Space Midnight</p>
                      </div>
                    </div>
                  </div>

                  <SettingGroup label="QUICK PRESETS">
                    <div className="grid grid-cols-3 gap-3 py-2">
                      {Object.keys(BACKGROUND_PRESETS).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setBackgroundLayers(BACKGROUND_PRESETS[preset])}
                          className="h-20 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/50 flex items-end p-3 transition-all group/preset relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0" />
                          <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white/60 group-hover/preset:text-cyan-500">{preset}</span>
                        </button>
                      ))}
                    </div>
                  </SettingGroup>

                  <div className="pt-8">
                    <Button
                      onClick={randomizeBackground}
                      className="w-full bg-white text-black font-black h-12 rounded-xl text-[11px] uppercase tracking-wider shadow-xl shadow-white/5 transition-transform active:scale-95"
                    >
                      RANDOMIZE BACKGROUND ENGINE
                    </Button>
                  </div>
                </Tabs.Content>
              </div>
            </div>
          </Tabs.Root>

        </Dialog.Content>
      </Dialog.Portal>
      <style jsx global>{`
        .custom-scrollbar-settings::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </Dialog.Root>
  );
};

const TabButton: React.FC<{ value: string; icon: React.ReactNode; label: string }> = ({ value, icon, label }) => (
  <Tabs.Trigger
    value={value}
    className="group flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#888] transition-all duration-150 relative border-l-[3px] border-transparent hover:bg-white/[0.04] hover:text-[#aaa] data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/[0.06] data-[state=active]:text-white data-[state=active]:hover:bg-cyan-500/[0.08]"
  >
    <span className="shrink-0 group-data-[state=active]:text-white">{icon}</span>
    {label}
  </Tabs.Trigger>
);

const SettingGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-4 pt-6 first:pt-2">
    <h4 className="text-[12px] font-medium uppercase tracking-[0.5px] text-[#888] mb-4">{label}</h4>
    {children}
  </div>
);

const SectionDivider: React.FC = () => (
  <div className="h-px w-full bg-white/[0.06] my-2" />
);

const SettingToggle: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void
}> = ({ label, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between gap-4 py-4 min-h-[72px]">
    <div className="space-y-0.5 min-w-0 flex-1">
      <h5 className="text-sm font-medium text-white">{label}</h5>
      <p className="text-xs text-[#888] leading-relaxed line-clamp-2 md:line-clamp-none">{description}</p>
    </div>
    <div className="flex items-center h-11 px-1 shrink-0">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  </div>
);

const LayoutButton: React.FC<{
  layout: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-2 min-h-[72px] rounded-lg border transition-all duration-200 cursor-pointer hover:scale-[1.02]",
      active
        ? "bg-cyan-500/[0.08] border-cyan-500 text-cyan-500"
        : "bg-transparent border-[#333] text-[#888] hover:border-[#555] hover:bg-white/[0.03]"
    )}
  >
    <div className={cn("transition-colors", active ? "text-cyan-500" : "text-[#888]")}>
      {icon}
    </div>
    <span className="text-[13px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

const GridIcon: React.FC<{ cols: number; rows: number }> = ({ cols, rows }) => (
  <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {Array.from({ length: cols * rows }).map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 bg-current rounded-[1px]" />
    ))}
  </div>
);

const AutoGridIcon: React.FC = () => (
  <div className="grid grid-cols-2 gap-0.5 relative w-4 h-4">
    <div className="w-1.5 h-3 bg-current rounded-[1px] row-span-2" />
    <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
    <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
  </div>
);
