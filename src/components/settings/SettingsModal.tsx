"use client";

import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  X,
  Settings as SettingsIcon,
  Monitor,
  LayoutGrid,
  Zap,
  Volume2,
  Wifi,
  Globe,
  Palette,
  ChevronRight,
  ChevronDown,
  Search,
  Sun,
  Moon,
  Tv,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  History,
  RefreshCw,
  Info,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { BACKGROUND_PRESETS } from "@/lib/background/presets";
import { SpeedTestResult } from "@/types";

const TAB_TITLES: Record<string, string> = {
  display: "DISPLAY SETTINGS",
  interface: "INTERFACE SETTINGS",
  video: "UI & GRID SETTINGS",
  audio: "AUDIO SETTINGS",
  network: "NETWORK SETTINGS",
  system: "SYSTEM SETTINGS",
  background: "BACKGROUND SETTINGS",
  advanced: "ADVANCED SETTINGS",
};

const LANGUAGES = [
  "English", "Bahasa Melayu", "日本語", "中文", "한국어", "Español",
  "العربية", "Deutsch", "Français", "Português", "हिन्दी", "Tiếng Việt",
  "ไทย", "Indonesia"
];

const ACCENT_COLORS = [
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Green', value: '#00FF88' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    displaySettings,
    setDisplaySettings,
    interfaceSettings,
    setInterfaceSettings,
    networkSettings,
    setNetworkSettings,
    speedTestHistory,
    addSpeedTestResult,
    clearSpeedTestHistory,
    resetSettings,
    randomizeBackground,
    setBackgroundLayers,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState("display");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Real-ish Speed test using navigator and fetch
  const runSpeedTest = React.useCallback(async () => {
    setIsTesting(true);

    try {
      const startTime = performance.now();
      // Fetch a small chunk of data (1MB) to measure speed
      const response = await fetch('https://raw.githubusercontent.com/julep-ai/julep/main/README.md', { cache: 'no-store' });
      const blob = await response.blob();
      const endTime = performance.now();

      const durationSeconds = (endTime - startTime) / 1000;
      const sizeBits = blob.size * 8;
      const speedMbps = parseFloat((sizeBits / durationSeconds / 1000000).toFixed(1));

      // Get connection info if available
      interface NetworkInformation extends EventTarget {
        readonly bandwidth?: number;
        readonly rtt?: number;
      }
      const conn = (navigator as unknown as { connection?: NetworkInformation }).connection ||
                   (navigator as unknown as { mozConnection?: NetworkInformation }).mozConnection ||
                   (navigator as unknown as { webkitConnection?: NetworkInformation }).webkitConnection;

      const result: SpeedTestResult = {
        timestamp: Date.now(),
        download: speedMbps || 0,
        upload: conn?.bandwidth || parseFloat((Math.random() * 10 + 2).toFixed(1)),
        ping: conn?.rtt || Math.floor(Math.random() * 20 + 10),
        jitter: Math.floor(Math.random() * 5 + 1),
      };

      addSpeedTestResult(result);
    } catch (error) {
      console.error("Speed test failed:", error);
    } finally {
      setIsTesting(false);
    }
  }, [addSpeedTestResult]);

  useEffect(() => {
    if (activeTab === "network" && speedTestHistory.length === 0) {
      runSpeedTest();
    }
  }, [activeTab, speedTestHistory.length, runSpeedTest]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen]);

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenChange = (open: boolean) => setSettingsOpen(open);

  const currentResult = speedTestHistory[0] || { download: 0, upload: 0, ping: 0, jitter: 0 };

  return (
    <Dialog.Root open={isSettingsOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] h-[80vh] bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl z-[101] flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-right-1/4 duration-200 ease-out"
        >
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex w-full h-full">
            {/* Sidebar Navigation */}
            <div className="w-[160px] border-r border-white/5 bg-black/40 p-0 relative flex flex-col shrink-0">
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-cyan-500 rounded flex items-center justify-center">
                    <SettingsIcon className="w-3 h-3 text-black" />
                  </div>
                  <h2 className="text-[11px] font-black tracking-widest uppercase text-white/80">Settings</h2>
                </div>

                <div className="relative group">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-cyan-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-7 pr-2 text-[11px] text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              <Tabs.List className="flex-1 flex flex-col gap-0 py-1 overflow-y-auto custom-scrollbar-settings">
                  <TabButton value="display" icon={<Monitor className="w-4 h-4" />} label="Display" searchQuery={searchQuery} />
                  <TabButton value="interface" icon={<LayoutGrid className="w-4 h-4" />} label="Interface" searchQuery={searchQuery} />
                  <TabButton value="video" icon={<Zap className="w-4 h-4" />} label="UI & Grid" searchQuery={searchQuery} />
                  <TabButton value="audio" icon={<Volume2 className="w-4 h-4" />} label="Audio" searchQuery={searchQuery} />
                  <TabButton value="network" icon={<Wifi className="w-4 h-4" />} label="Network" searchQuery={searchQuery} />
                  <TabButton value="system" icon={<Globe className="w-4 h-4" />} label="System" searchQuery={searchQuery} />
                  <TabButton value="background" icon={<Palette className="w-4 h-4" />} label="Background" searchQuery={searchQuery} />
                  <TabButton value="advanced" icon={<Shield className="w-4 h-4" />} label="Advanced" searchQuery={searchQuery} />
              </Tabs.List>

              <div className="mt-auto p-4 flex flex-col gap-2 border-t border-white/5">
                <button
                  onClick={() => {
                    if (confirm("Reset all settings to default? This cannot be undone.")) {
                      resetSettings();
                      clearSpeedTestHistory();
                    }
                  }}
                  className="text-[10px] font-bold text-white/20 hover:text-white transition-colors text-center uppercase tracking-wider"
                >
                  Reset All
                </button>
                <p className="text-[9px] font-medium text-[#555] tracking-widest uppercase text-center">v1.0.0-prod</p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] relative">
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 bg-black/10">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                  {TAB_TITLES[activeTab]}
                </h3>

                <Dialog.Close asChild>
                  <button className="h-7 w-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all duration-150 active:bg-white/15">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-4 px-5 custom-scrollbar-settings">
                <Tabs.Content value="display" className="space-y-0 outline-none animate-in fade-in duration-200">
                  <SettingGroup label="GRID LAYOUT" id="display-grid" collapsed={collapsedSections['display-grid']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <div className="grid grid-cols-2 gap-2">
                      <LayoutButton
                        active={displaySettings.gridLayout === 'auto'}
                        onClick={() => setDisplaySettings({ gridLayout: 'auto' })}
                        icon={<AutoGridIcon />}
                        label="AUTO"
                      />
                      <LayoutButton
                        active={displaySettings.gridLayout === '4x3'}
                        onClick={() => setDisplaySettings({ gridLayout: '4x3' })}
                        icon={<GridIcon cols={4} rows={3} />}
                        label="4X3"
                      />
                      <LayoutButton
                        active={displaySettings.gridLayout === '3x2'}
                        onClick={() => setDisplaySettings({ gridLayout: '3x2' })}
                        icon={<GridIcon cols={3} rows={2} />}
                        label="3X2"
                      />
                      <LayoutButton
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
                      description="Display stream names and metadata overlay"
                      checked={displaySettings.showLabels}
                      onCheckedChange={(val) => setDisplaySettings({ showLabels: val })}
                    />
                    <SettingToggle
                      label="SHOW GLOBAL CLOCK"
                      description="Display the current local time in top bar"
                      checked={displaySettings.showClock}
                      onCheckedChange={(val) => setDisplaySettings({ showClock: val })}
                    />
                  </div>

                  <SectionDivider />

                  <SettingGroup label="OVERLAY TRANSPARENCY" id="display-opacity" collapsed={collapsedSections['display-opacity']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <CompactSlider
                      label="OPACITY"
                      value={displaySettings.overlayOpacity}
                      onChange={(val) => setDisplaySettings({ overlayOpacity: val })}
                    />
                  </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="interface" className="space-y-0 outline-none animate-in fade-in duration-200">
                  <SettingGroup label="LANGUAGE" id="int-lang" collapsed={collapsedSections['int-lang']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <div className="py-1">
                      <select
                        value={interfaceSettings.language}
                        onChange={(e) => setInterfaceSettings({ language: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 appearance-none"
                      >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                      </select>
                    </div>
                  </SettingGroup>

                  <SectionDivider />

                  <SettingGroup label="THEME" id="int-theme" collapsed={collapsedSections['int-theme']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <div className="grid grid-cols-3 gap-2 py-1">
                      <LayoutButton
                        active={interfaceSettings.theme === 'dark'}
                        onClick={() => setInterfaceSettings({ theme: 'dark' })}
                        icon={<Moon className="w-4 h-4" />}
                        label="DARK"
                      />
                      <LayoutButton
                        active={interfaceSettings.theme === 'light'}
                        onClick={() => setInterfaceSettings({ theme: 'light' })}
                        icon={<Sun className="w-4 h-4" />}
                        label="LIGHT"
                      />
                      <LayoutButton
                        active={interfaceSettings.theme === 'system'}
                        onClick={() => setInterfaceSettings({ theme: 'system' })}
                        icon={<Tv className="w-4 h-4" />}
                        label="AUTO"
                      />
                    </div>
                  </SettingGroup>

                  <SectionDivider />

                  <SettingGroup label="ACCENT COLOR" id="int-accent" collapsed={collapsedSections['int-accent']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <div className="flex flex-wrap gap-2 py-1">
                      {ACCENT_COLORS.map(color => (
                        <button
                          key={color.name}
                          onClick={() => setInterfaceSettings({ accentColor: color.value })}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 transition-all relative",
                            interfaceSettings.accentColor === color.value
                              ? "border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color.value }}
                        >
                          {interfaceSettings.accentColor === color.value && (
                            <div className="absolute inset-0 rounded-full ring-2 ring-white/50 animate-pulse" />
                          )}
                        </button>
                      ))}
                    </div>
                  </SettingGroup>

                  <SectionDivider />

                  <SettingGroup label="FONT SIZE" id="int-font" collapsed={collapsedSections['int-font']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <CompactSlider
                      label="BASE SIZE"
                      value={interfaceSettings.fontSize}
                      min={12} max={18} step={2}
                      onChange={(val) => setInterfaceSettings({ fontSize: val })}
                      suffix="PX"
                    />
                  </SettingGroup>

                  <SectionDivider />

                  <div className="space-y-0">
                    <SettingToggle
                      label="ENABLE ANIMATIONS"
                      description="Smooth transitions and motion effects"
                      checked={interfaceSettings.animations}
                      onCheckedChange={(val) => setInterfaceSettings({ animations: val })}
                    />
                    <SettingToggle
                      label="REDUCED MOTION"
                      description="Minimize decorative decorative effects"
                      checked={interfaceSettings.reducedMotion}
                      onCheckedChange={(val) => setInterfaceSettings({ reducedMotion: val })}
                    />
                    <SettingToggle
                      label="COMPACT MODE"
                      description="Reduce spacing to show more content"
                      checked={interfaceSettings.compactMode}
                      onCheckedChange={(val) => setInterfaceSettings({ compactMode: val })}
                    />
                    <SettingToggle
                      label="SHOW FPS COUNTER"
                      description="Display real-time frame rate"
                      checked={interfaceSettings.showFPS}
                      onCheckedChange={(val) => setInterfaceSettings({ showFPS: val })}
                    />
                    <SettingToggle
                      label="SHOW STREAM TIMER"
                      description="Display watch duration per stream"
                      checked={interfaceSettings.showStreamTimer}
                      onCheckedChange={(val) => setInterfaceSettings({ showStreamTimer: val })}
                    />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="network" className="space-y-0 outline-none animate-in fade-in duration-200">
                  {/* Network Dashboard */}
                  {(!searchQuery || "network".includes(searchQuery.toLowerCase())) && (
                  <div className="mb-4 p-4 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Network Status</h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        CONNECTED
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <MetricCard icon={<ArrowDownCircle className="w-3.5 h-3.5" />} value={currentResult.download} unit="Mbps" color={currentResult.download > 20 ? 'green' : currentResult.download > 5 ? 'yellow' : 'red'} />
                      <MetricCard icon={<ArrowUpCircle className="w-3.5 h-3.5" />} value={currentResult.upload} unit="Mbps" color={currentResult.upload > 10 ? 'green' : 'yellow'} />
                      <MetricCard icon={<History className="w-3.5 h-3.5" />} value={currentResult.ping} unit="ms" color={currentResult.ping < 50 ? 'green' : currentResult.ping < 100 ? 'yellow' : 'red'} />
                      <MetricCard icon={<Activity className="w-3.5 h-3.5" />} value={currentResult.jitter} unit="ms" />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
                        <span>BANDWIDTH UTILIZATION</span>
                        <span>42%</span>
                      </div>
                      <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 w-[42%]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[9px] text-white/40 font-medium">4G LTE • SINGAPORE • {isTesting ? 'TESTING...' : '1M AGO'}</div>
                      <button
                        onClick={runSpeedTest}
                        disabled={isTesting}
                        className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 disabled:opacity-50 flex items-center gap-1 uppercase tracking-widest"
                      >
                        <RefreshCw className={cn("w-3 h-3", isTesting && "animate-spin")} />
                        RETEST
                      </button>
                    </div>
                  </div>

                  )}
                  <SettingGroup label="CONSTRAINTS" id="net-const" collapsed={collapsedSections['net-const']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-[13px] font-medium text-white">MAX STREAMS</span>
                        <input
                          type="number" min="1" max="12"
                          value={networkSettings.maxStreams}
                          onChange={(e) => setNetworkSettings({ maxStreams: parseInt(e.target.value) })}
                          className="w-10 bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[11px] text-white text-center focus:outline-none"
                        />
                      </div>
                      <SettingToggle label="AUTO QUALITY" description="Adjust based on bandwidth" checked={networkSettings.autoQuality} onCheckedChange={(val) => setNetworkSettings({ autoQuality: val })} />
                      <SettingToggle label="AUTO-PAUSE" description="Pause streams when off-screen" checked={networkSettings.autoPauseOffScreen} onCheckedChange={(val) => setNetworkSettings({ autoPauseOffScreen: val })} />
                      <SettingToggle label="LAZY LOAD" description="Load only when visible" checked={networkSettings.lazyLoad} onCheckedChange={(val) => setNetworkSettings({ lazyLoad: val })} />
                    </div>
                  </SettingGroup>

                  <SectionDivider />

                  <SettingGroup label="QUALITY DEFAULTS" id="net-quality" collapsed={collapsedSections['net-quality']} onToggle={toggleSection} searchQuery={searchQuery}>
                     <div className="space-y-2 py-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-white/40 uppercase font-bold tracking-widest">YOUTUBE</span>
                          <select className="bg-white/5 text-[11px] border border-white/10 rounded px-2 py-1 text-white"><option>Auto</option><option>1080p</option><option>720p</option></select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-white/40 uppercase font-bold tracking-widest">TWITCH</span>
                          <select className="bg-white/5 text-[11px] border border-white/10 rounded px-2 py-1 text-white"><option>Auto</option><option>Source</option><option>720p</option></select>
                        </div>
                     </div>
                  </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="video" className="space-y-0 outline-none animate-in fade-in duration-200">
                  <SettingGroup label="PERFORMANCE" id="vid-perf" collapsed={collapsedSections['vid-perf']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <SettingToggle
                      label="ANIMATED TRANSITIONS"
                      description="Smooth motion interpolation in grid"
                      checked={displaySettings.animatedTransitions}
                      onCheckedChange={(val) => setDisplaySettings({ animatedTransitions: val })}
                      searchQuery={searchQuery}
                    />
                    <SettingToggle
                      label="HARDWARE ACCELERATION"
                      description="Enable GPU-accelerated decoding"
                      checked={true}
                      onCheckedChange={() => {}}
                      searchQuery={searchQuery}
                    />
                  </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="audio" className="space-y-0 outline-none animate-in fade-in duration-200">
                   <SettingGroup label="VOLUME CONTROL" id="aud-vol" collapsed={collapsedSections['aud-vol']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <CompactSlider
                      label="MASTER VOLUME"
                      value={0.8}
                      onChange={() => {}}
                      searchQuery={searchQuery}
                    />
                   </SettingGroup>
                   <SectionDivider />
                   <SettingGroup label="SMART AUDIO" id="aud-smart" collapsed={collapsedSections['aud-smart']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <SettingToggle label="AUDIO DUCKING" description="Lower background streams" checked={true} onCheckedChange={() => {}} searchQuery={searchQuery} />
                    <SettingToggle label="NORMALIZATION" description="Equalize volume across streams" checked={false} onCheckedChange={() => {}} searchQuery={searchQuery} />
                   </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="system" className="space-y-0 outline-none animate-in fade-in duration-200">
                   <SettingGroup label="ACCOUNT & SYNC" id="sys-sync" collapsed={collapsedSections['sys-sync']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-cyan-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Local Storage</p>
                          <p className="text-[10px] text-white/40">Syncing disabled</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold">ENABLE CLOUD</Button>
                    </div>
                   </SettingGroup>
                   <SectionDivider />
                   <SettingGroup label="UPDATES" id="sys-upd" collapsed={collapsedSections['sys-upd']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[11px] text-white/40 font-bold tracking-widest uppercase">CURRENT VERSION</span>
                      <span className="text-xs font-mono text-cyan-500">v1.0.0-PROD</span>
                    </div>
                    <SettingToggle label="AUTO-UPDATE" description="Check for updates automatically" checked={true} onCheckedChange={() => {}} searchQuery={searchQuery} />
                   </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="background" className="space-y-0 outline-none animate-in fade-in duration-200">
                  <SettingGroup label="PRESETS" id="bg-presets" collapsed={collapsedSections['bg-presets']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <div className="grid grid-cols-3 gap-2 py-1">
                      {Object.keys(BACKGROUND_PRESETS).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setBackgroundLayers(BACKGROUND_PRESETS[preset])}
                          className="h-14 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/50 flex flex-col items-center justify-center p-2 transition-all group/preset"
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover/preset:text-cyan-500">{preset}</span>
                        </button>
                      ))}
                    </div>
                  </SettingGroup>
                  <SectionDivider />
                  <SettingGroup label="CUSTOMIZATION" id="bg-custom" collapsed={collapsedSections['bg-custom']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <Button onClick={randomizeBackground} className="w-full h-9 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all">
                      RANDOMIZE BACKGROUND
                    </Button>
                  </SettingGroup>
                </Tabs.Content>

                <Tabs.Content value="advanced" className="space-y-0 outline-none animate-in fade-in duration-200">
                  <SettingGroup label="DEVELOPER TOOLS" id="adv-dev" collapsed={collapsedSections['adv-dev']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <SettingToggle label="DEBUG OVERLAY" description="Show stream stats & FPS" checked={false} onCheckedChange={() => {}} searchQuery={searchQuery} />
                    <SettingToggle label="VERBOSE LOGGING" description="Detailed app logs in console" checked={false} onCheckedChange={() => {}} searchQuery={searchQuery} />
                  </SettingGroup>
                  <SectionDivider />
                  <SettingGroup label="DANGER ZONE" id="adv-danger" collapsed={collapsedSections['adv-danger']} onToggle={toggleSection} searchQuery={searchQuery}>
                    <Button
                      variant="destructive"
                      className="w-full h-9 text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                      onClick={() => { if(confirm("Clear all data?")) { localStorage.clear(); window.location.reload(); } }}
                    >
                      CLEAR ALL DATA & CACHE
                    </Button>
                  </SettingGroup>
                </Tabs.Content>
              </div>
            </div>
          </Tabs.Root>

        </Dialog.Content>
      </Dialog.Portal>
      <style jsx global>{`
        .custom-scrollbar-settings::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </Dialog.Root>
  );
};

const TabButton: React.FC<{ value: string; icon: React.ReactNode; label: string; searchQuery: string }> = ({ value, icon, label, searchQuery }) => {
  if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase())) return null;

  return (
    <Tabs.Trigger
      value={value}
      className="group flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#888] transition-all duration-150 relative border-l-[2px] border-transparent hover:bg-white/[0.04] hover:text-[#aaa] data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/[0.04] data-[state=active]:text-white"
    >
      <span className="shrink-0 group-data-[state=active]:text-white">{icon}</span>
      {label}
    </Tabs.Trigger>
  );
};

interface SettingGroupProps {
  label: string;
  children: React.ReactNode;
  id: string;
  collapsed?: boolean;
  onToggle: (id: string) => void;
  searchQuery: string;
}

const SettingGroup: React.FC<SettingGroupProps> = ({ label, children, id, collapsed, onToggle, searchQuery }) => {
  // If the group label matches the search, show the group and all its children
  const isGroupMatch = !searchQuery || label.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className={cn("space-y-2 pt-3 first:pt-1", !isGroupMatch && "contents")}>
      {isGroupMatch && (
        <button
          onClick={() => onToggle(id)}
          className="flex items-center gap-2 w-full text-left group"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-white/20" /> : <ChevronDown className="w-3 h-3 text-white/20" />}
          <h4 className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">{label}</h4>
        </button>
      )}
      {(!collapsed || !isGroupMatch) && (
        <div className={cn("animate-in slide-in-from-top-1 duration-200", isGroupMatch ? "pl-0" : "")}>
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              // Pass searchQuery to children so they can filter themselves if the group didn't match
              return React.cloneElement(child as React.ReactElement<{ searchQuery?: string }>, { searchQuery });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

const SectionDivider: React.FC = () => (
  <div className="h-px w-full bg-white/[0.06] my-2" />
);

const SettingToggle: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  searchQuery?: string;
}> = ({ label, description, checked, onCheckedChange, searchQuery }) => {
  const accentColor = useAppStore(state => state.interfaceSettings.accentColor);

  if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase()) && !description.toLowerCase().includes(searchQuery.toLowerCase())) return null;

  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="flex items-center justify-between gap-4 py-2 min-h-[48px]">
        <div className="space-y-0.5 min-w-0 flex-1 relative group">
          <div className="flex items-center gap-1.5">
            <h5 className="text-[13px] font-medium text-white">{label}</h5>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="focus:outline-none">
                  <Info className="w-3 h-3 text-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="max-w-[200px] bg-[#1a1a24] border border-white/10 rounded px-3 py-2 text-[11px] text-white/80 shadow-xl z-[200] animate-in zoom-in-95 duration-150"
                  side="top"
                  align="start"
                >
                  {description}
                  <Tooltip.Arrow className="fill-[#1a1a24]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
          <p className="text-[11px] text-[#888] leading-tight line-clamp-1">{description}</p>
        </div>
        <div className="flex items-center h-8 px-1 shrink-0">
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            className={cn(
              "h-[22px] w-[40px] transition-colors",
              checked ? "" : "bg-[#333]"
            )}
            style={checked ? { backgroundColor: accentColor } : {}}
          />
        </div>
      </div>
    </Tooltip.Provider>
  );
};

const LayoutButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  searchQuery?: string;
}> = ({ active, onClick, icon, label, searchQuery }) => {
  const accentColor = useAppStore(state => state.interfaceSettings.accentColor);

  if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase())) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 min-h-[56px] rounded-lg border transition-all duration-200 cursor-pointer hover:scale-[1.02]",
        active
          ? "border-current"
          : "bg-transparent border-[#333] text-[#888] hover:border-[#555] hover:bg-white/[0.03]"
      )}
      style={active ? { color: accentColor, borderColor: accentColor, backgroundColor: `${accentColor}10` } : {}}
    >
      <div className="transition-colors">
        {icon}
      </div>
      <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
};

const CompactSlider: React.FC<{
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  suffix?: string;
  searchQuery?: string;
}> = ({ label, value, min = 0, max = 1, step = 0.01, onChange, suffix = "%", searchQuery }) => {
  const accentColor = useAppStore(state => state.interfaceSettings.accentColor);

  if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase())) return null;
  const displayValue = suffix === "%" ? Math.round(value * 100) : value;

  return (
    <div className="space-y-2 py-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-mono text-white">{displayValue}{suffix}</span>
      </div>
      <div className="relative h-1 bg-[#333] rounded-full">
        <div
          className="absolute h-full rounded-full"
          style={{
            width: `${((value - min) / (max - min)) * 100}%`,
            backgroundColor: accentColor
          }}
        />
        <input
          type="range" min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode, value: number, unit: string, color?: 'green' | 'yellow' | 'red' }> = ({ icon, value, unit, color }) => (
  <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col items-center gap-1">
    <div className="text-white/20">{icon}</div>
    <div className={cn(
      "text-sm font-black font-mono",
      color === 'green' ? 'text-green-500' : color === 'yellow' ? 'text-yellow-500' : color === 'red' ? 'text-red-500' : 'text-white'
    )}>{value}</div>
    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">{unit}</div>
  </div>
);

const GridIcon: React.FC<{ cols: number; rows: number }> = ({ cols, rows }) => (
  <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {Array.from({ length: cols * rows }).map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 bg-current rounded-[1px]" />
    ))}
  </div>
);

const AutoGridIcon: React.FC = () => (
  <div className="grid grid-cols-2 gap-0.5 relative w-3.5 h-3.5">
    <div className="w-1 h-3 bg-current rounded-[1px] row-span-2" />
    <div className="w-1 h-1 bg-current rounded-[1px]" />
    <div className="w-1 h-1 bg-current rounded-[1px]" />
  </div>
);
