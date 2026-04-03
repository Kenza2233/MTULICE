"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import {
  X,
  Settings,
  Monitor,
  Zap,
  Volume2,
  Globe,
  Palette,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

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
    networkSettings,
    setNetworkSettings
  } = useAppStore();

  const handleOpenChange = (open: boolean) => setSettingsOpen(open);

  return (
    <Dialog.Root open={isSettingsOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[85vh] bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl z-[101] flex overflow-hidden animate-in zoom-in-95 duration-200">

          <Tabs.Root defaultValue="display" className="flex w-full">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-white/5 bg-black/40 p-4 space-y-2">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-black" />
                </div>
                <h2 className="text-sm font-black tracking-widest uppercase text-white/80">Settings</h2>
              </div>

              <Tabs.List className="flex flex-col gap-1">
                <TabButton value="display" icon={<Monitor className="w-4 h-4" />} label="Display" />
                <TabButton value="video" icon={<Zap className="w-4 h-4" />} label="Video & Perf" />
                <TabButton value="audio" icon={<Volume2 className="w-4 h-4" />} label="Audio" />
                <TabButton value="network" icon={<Globe className="w-4 h-4" />} label="Network" />
                <TabButton value="background" icon={<Palette className="w-4 h-4" />} label="Background" />
              </Tabs.List>

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Version</p>
                <p className="text-xs font-mono text-cyan-500/50">v1.0.0-production</p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20">
                <Tabs.Content value="display"><h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Display Settings</h3></Tabs.Content>
                <Tabs.Content value="video"><h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Video & Performance</h3></Tabs.Content>
                <Tabs.Content value="audio"><h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Audio Engine</h3></Tabs.Content>
                <Tabs.Content value="network"><h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Network & Advanced</h3></Tabs.Content>
                <Tabs.Content value="background"><h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Background Customization</h3></Tabs.Content>

                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <Tabs.Content value="display" className="space-y-8 animate-in slide-in-from-right-2 duration-300">
                  <SettingGroup label="Grid Layout">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['auto', '4x3', '3x2', '2x2'].map((layout) => (
                        <button
                          key={layout}
                          onClick={() => setDisplaySettings({ gridLayout: layout as import('@/types').GridPreference })}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                            displaySettings.gridLayout === layout
                              ? "bg-cyan-500/10 border-cyan-500 text-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                              : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
                          )}
                        >
                          <LayoutGrid className="w-6 h-6" />
                          <span className="text-[10px] font-black uppercase">{layout}</span>
                        </button>
                      ))}
                    </div>
                  </SettingGroup>

                  <div className="grid grid-cols-2 gap-8">
                    <SettingToggle
                      label="Show Stream Labels"
                      description="Display stream names and metadata"
                      checked={displaySettings.showLabels}
                      onCheckedChange={(val) => {
                        setDisplaySettings({ showLabels: val });
                        setVideoSettings({ showLabels: val });
                      }}
                    />
                    <SettingToggle
                      label="Show Global Clock"
                      description="Display current time in top bar"
                      checked={displaySettings.showClock}
                      onCheckedChange={(val) => setDisplaySettings({ showClock: val })}
                    />
                  </div>

                  <SettingGroup label="Overlay Transparency">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">{displaySettings.overlayOpacity * 100}% Opacity</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.1"
                        value={displaySettings.overlayOpacity}
                        onChange={(e) => setDisplaySettings({ overlayOpacity: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-500"
                      />
                    </div>
                  </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="video" className="space-y-8 animate-in slide-in-from-right-2 duration-300">
                  <div className="grid grid-cols-2 gap-8">
                    <SettingGroup label="Default Quality">
                      <select
                        value={videoSettings.defaultQuality}
                        onChange={(e) => setVideoSettings({ defaultQuality: e.target.value as import('@/types').VideoPerformanceSettings['defaultQuality'] })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                      >
                        <option value="auto">Auto (Recommended)</option>
                        <option value="highest">Highest (1080p+)</option>
                        <option value="medium">Balanced (720p)</option>
                        <option value="lowest">Economy (480p)</option>
                        <option value="data-saver">Data Saver (360p)</option>
                      </select>
                    </SettingGroup>
                    <SettingGroup label="Max Resolution">
                      <select
                        value={videoSettings.maxResolution}
                        onChange={(e) => setVideoSettings({ maxResolution: e.target.value as import('@/types').VideoPerformanceSettings['maxResolution'] })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                      >
                        <option value="1080p">1080p Full HD</option>
                        <option value="720p">720p HD</option>
                        <option value="480p">480p SD</option>
                        <option value="4K">4K Ultra HD (Experimental)</option>
                      </select>
                    </SettingGroup>
                  </div>

                  <SettingGroup label="Buffer Configuration">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">Live Buffer: {videoSettings.bufferSize} Seconds</span>
                        <span className="text-[10px] text-cyan-500 font-bold uppercase">Low Latency</span>
                      </div>
                      <input
                        type="range" min="1" max="10" step="1"
                        value={videoSettings.bufferSize}
                        onChange={(e) => setVideoSettings({ bufferSize: parseInt(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-500"
                      />
                      <p className="text-[10px] text-white/20">Lower buffer reduces latency but may cause stutter on weak connections.</p>
                    </div>
                  </SettingGroup>

                  <div className="grid grid-cols-2 gap-8">
                    <SettingToggle
                      label="Hardware Acceleration"
                      description="Offload video decoding to GPU"
                      checked={videoSettings.hardwareAcceleration}
                      onCheckedChange={(val) => setVideoSettings({ hardwareAcceleration: val })}
                    />
                    <SettingToggle
                      label="Worker-based Decoding"
                      description="Use WebWorkers to prevent UI lag"
                      checked={videoSettings.useWebWorker}
                      onCheckedChange={(val) => setVideoSettings({ useWebWorker: val })}
                    />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="audio" className="space-y-8 animate-in slide-in-from-right-2 duration-300">
                   <SettingGroup label="Master Volume">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">{Math.round(audioSettings.masterVolume * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.01"
                        value={audioSettings.masterVolume}
                        onChange={(e) => setAudioSettings({ masterVolume: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-500"
                      />
                    </div>
                  </SettingGroup>

                  <div className="grid grid-cols-2 gap-8">
                    <SettingToggle
                      label="Audio Ducking"
                      description="Lower other streams when one is focused"
                      checked={audioSettings.audioDucking}
                      onCheckedChange={(val) => setAudioSettings({ audioDucking: val })}
                    />
                    <SettingToggle
                      label="Volume Normalization"
                      description="Keep all streams at similar loudness"
                      checked={audioSettings.normalization}
                      onCheckedChange={(val) => setAudioSettings({ normalization: val })}
                    />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="network" className="space-y-8 animate-in slide-in-from-right-2 duration-300">
                  <SettingGroup label="Bandwidth Limit Override">
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        placeholder="Mbps (0 for unlimited)"
                        value={networkSettings.bandwidthLimit || ''}
                        onChange={(e) => setNetworkSettings({ bandwidthLimit: parseInt(e.target.value) || 0 })}
                        className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                      />
                      <span className="text-xs text-white/30">Caps total app bandwidth usage</span>
                    </div>
                  </SettingGroup>

                   <div className="grid grid-cols-2 gap-8">
                    <SettingGroup label="Connection Timeout">
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={networkSettings.connectionTimeout}
                          onChange={(e) => setNetworkSettings({ connectionTimeout: parseInt(e.target.value) })}
                          className="w-20 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                        />
                        <span className="text-xs text-white/30">Seconds</span>
                      </div>
                    </SettingGroup>
                    <SettingGroup label="Reconnect Delay">
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={networkSettings.reconnectDelay}
                          onChange={(e) => setNetworkSettings({ reconnectDelay: parseInt(e.target.value) })}
                          className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                        />
                        <span className="text-xs text-white/30">Milliseconds</span>
                      </div>
                    </SettingGroup>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-4">
                    <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 h-10 px-6 font-bold text-[10px] uppercase">
                      Clear App Cache
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white/60 hover:bg-white/5 h-10 px-6 font-bold text-[10px] uppercase">
                      Export Diagnostic Log
                    </Button>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="background" className="space-y-8 animate-in slide-in-from-right-2 duration-300">
                   <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Palette className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-tight">Active Background Layer</h4>
                        <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Base Deep Dark</p>
                      </div>
                    </div>
                    <Button className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase h-9 px-4 rounded-lg">
                      Edit Properties
                    </Button>
                  </div>

                  <SettingGroup label="Quick Presets">
                    <div className="grid grid-cols-3 gap-3">
                      {['Midnight', 'Cyberpunk', 'Cosmic', 'Gaming Neon', 'Cinema', 'Minimal'].map((preset) => (
                        <button
                          key={preset}
                          className="h-20 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 flex items-end p-3 transition-all"
                        >
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{preset}</span>
                        </button>
                      ))}
                    </div>
                  </SettingGroup>

                  <div className="flex gap-4">
                    <Button className="flex-1 bg-white text-black font-black h-12 rounded-xl text-xs">
                      RANDOMIZE BACKGROUND
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/10 text-white font-black h-12 rounded-xl text-xs">
                      COMPARE (BEFORE/AFTER)
                    </Button>
                  </div>
                </Tabs.Content>
              </div>
            </div>
          </Tabs.Root>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const TabButton: React.FC<{ value: string; icon: React.ReactNode; label: string }> = ({ value, icon, label }) => (
  <Tabs.Trigger
    value={value}
    className="group flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white/30 transition-all data-[state=active]:bg-cyan-500 data-[state=active]:text-black hover:text-white"
  >
    <span className="group-data-[state=active]:text-black">{icon}</span>
    {label}
  </Tabs.Trigger>
);

const SettingGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-l-2 border-cyan-500/50 pl-3">{label}</h4>
    {children}
  </div>
);

const SettingToggle: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void
}> = ({ label, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
    <div className="space-y-1">
      <h5 className="text-xs font-bold text-white/80 uppercase tracking-tight">{label}</h5>
      <p className="text-[10px] text-white/30 leading-relaxed">{description}</p>
    </div>
    <button
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        checked ? "bg-cyan-500" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  </div>
);
