"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Plus,
  Link,
  Type,
  Tag,
  Monitor,
  ChevronDown,
  Youtube,
  Twitch,
  Music2,
  Zap,
  Facebook,
  History,
  Clipboard,
  AlertCircle,
  Star,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { PlatformType } from "@/types";
import { cn } from "@/lib/utils";
import { YouTubeSearchOverlay } from "../youtube/YouTubeSearchOverlay";

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube Live', icon: <Youtube className="w-4 h-4" /> },
  { id: 'twitch', name: 'Twitch', icon: <Twitch className="w-4 h-4" /> },
  { id: 'tiktok', name: 'TikTok Live', icon: <Music2 className="w-4 h-4" /> },
  { id: 'kick', name: 'Kick', icon: <Zap className="w-4 h-4" /> },
  { id: 'facebook', name: 'Facebook Live', icon: <Facebook className="w-4 h-4" /> },
  { id: 'rumble', name: 'Rumble', icon: <Monitor className="w-4 h-4" /> },
  { id: 'trovo', name: 'Trovo', icon: <Monitor className="w-4 h-4" /> },
  { id: 'dlive', name: 'DLive', icon: <Monitor className="w-4 h-4" /> },
  { id: 'custom', name: 'Custom / Other', icon: <Link className="w-4 h-4" /> },
] as const;

export const AddStreamModal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const { addChannel, recentUrls, interfaceSettings } = useAppStore();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [platform, setPlatform] = useState<PlatformType>('custom');
  const [priority, setPriority] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [isYTSearchOpen, setIsYTSearchOpen] = useState(false);

  const accentColor = interfaceSettings.accentColor;

  // Auto-detection logic
  useEffect(() => {
    if (!url) return;

    if (url.includes('.m3u8') || url.includes('.mpd')) {
      setError("Native stream protocols (.m3u8, .mpd) are not supported. Please use a web embed link.");
      return;
    }
    setError(null);

    if (url.includes('youtube.com') || url.includes('youtu.be')) setPlatform('youtube');
    else if (url.includes('twitch.tv')) setPlatform('twitch');
    else if (url.includes('tiktok.com')) setPlatform('tiktok');
    else if (url.includes('kick.com')) setPlatform('kick');
    else if (url.includes('facebook.com')) setPlatform('facebook');
    else if (url.includes('rumble.com')) setPlatform('rumble');
    else if (url.includes('trovo.live')) setPlatform('trovo');
    else if (url.includes('dlive.tv')) setPlatform('dlive');
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error || !url || !name) return;

    addChannel({
      name,
      channelUrl: url,
      platform,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      priority,
      autoAddWhenLive: true,
    });

    // Reset
    setUrl("");
    setName("");
    setTags("");
    setPlatform('custom');
    setPriority(3);
    onOpenChange(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to paste from clipboard', err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in" />
        <Dialog.Content className="fixed top-0 left-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-screen h-screen md:w-full md:max-w-xl bg-[#12121a] md:border md:border-white/10 md:rounded-2xl p-0 shadow-2xl z-[101] overflow-hidden animate-in md:zoom-in-95 slide-in-from-bottom md:slide-in-from-none duration-200">

          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/20">
            <Dialog.Title className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-3">
              <div
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: accentColor, boxShadow: `0 8px 24px ${accentColor}33` }}
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>
              ADD LIVE STREAM
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white/40 hover:text-white">
                <X className="h-6 w-6 md:h-4 md:w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[500px] overflow-y-auto custom-scrollbar">
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 border-r border-white/5 overflow-y-auto">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsYTSearchOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  <Search className="w-3 h-3" />
                  Search YouTube
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Monitor className="w-3 h-3" style={{ color: accentColor }} /> Platform
                </label>
                <div className="flex md:hidden overflow-x-auto gap-2 pb-2 custom-scrollbar no-scrollbar">
                  {PLATFORMS.map((p) => {
                    const isActive = platform === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p.id as PlatformType)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-bold whitespace-nowrap transition-all",
                          isActive ? "border-current bg-current/10" : "border-white/10 text-white/40"
                        )}
                        style={isActive ? { color: accentColor, borderColor: accentColor } : {}}
                      >
                        {p.icon}
                        {p.name}
                      </button>
                    );
                  })}
                </div>
                <div className="hidden md:relative md:block">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as PlatformType)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white appearance-none focus:outline-none focus:border-white/20 transition-all"
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Link className="w-3 h-3" style={{ color: accentColor }} /> Live Stream Link
                </label>
                <div className="relative group">
                  <input
                    required
                    placeholder="Paste YouTube, Twitch, or other live link..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={cn(
                      "w-full bg-white/5 border rounded-xl px-4 py-4 md:py-3 text-base md:text-xs text-white placeholder:text-white/20 focus:outline-none transition-all h-[52px] md:h-auto",
                      error ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                    )}
                    style={!error && url ? { borderColor: `${accentColor}40` } : {}}
                  />
                  <Button
                    type="button"
                    onClick={handlePaste}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 md:h-8 md:w-8 bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Clipboard className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  </Button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold bg-red-400/5 p-2 rounded-lg border border-red-400/10">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                  </div>
                )}
                {url && !error && (
                   <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-full w-fit border border-white/5">
                      {PLATFORMS.find(p => p.id === platform)?.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{PLATFORMS.find(p => p.id === platform)?.name}</span>
                   </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Type className="w-3 h-3" style={{ color: accentColor }} /> Stream Name
                  </label>
                  <input
                    required
                    placeholder="Enter stream name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 md:py-3 text-base md:text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all h-[52px] md:h-auto"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Tag className="w-3 h-3" style={{ color: accentColor }} /> Tags (Optional)
                  </label>
                  <input
                    placeholder="e.g. Gaming, News..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 md:py-3 text-base md:text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all h-[52px] md:h-auto"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Zap className="w-3 h-3" style={{ color: accentColor }} /> Priority
                </label>
                <div className="flex items-center gap-3 py-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPriority(s)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 md:w-6 md:h-6 transition-colors",
                          s <= priority ? "fill-current" : "text-white/10"
                        )}
                        style={s <= priority ? { color: accentColor } : {}}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-black text-white/40 uppercase tracking-widest">{priority}/5</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!!error || !url || !name}
                className="w-full disabled:opacity-50 text-black font-black h-[52px] rounded-xl gap-2 shadow-lg mt-4 transition-all"
                style={{ backgroundColor: accentColor, color: 'black', boxShadow: `0 8px 24px ${accentColor}33` }}
              >
                <Plus className="w-5 h-5" />
                ADD STREAM
              </Button>

              {/* Mobile Recents list integrated in main scroll on mobile */}
              <div className="md:hidden pt-8 pb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 mb-4">
                  <History className="w-3 h-3" /> Recent URLs
                </h3>
                <div className="space-y-2">
                   {recentUrls.map((recentUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setUrl(recentUrl)}
                      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                    >
                      <span className="text-xs text-white/60 truncate font-mono flex-1">{recentUrl}</span>
                      <ChevronDown className="w-4 h-4 text-white/20 -rotate-90" />
                    </button>
                   ))}
                </div>
              </div>
            </form>

            {/* Right Column: Recents (Desktop Only) */}
            <div className="hidden md:flex w-52 p-6 bg-white/[0.02] flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 mb-4">
                <History className="w-3 h-3" /> Recent URLs
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {recentUrls.map((recentUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setUrl(recentUrl)}
                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                    style={{ borderColor: url === recentUrl ? `${accentColor}40` : undefined }}
                  >
                    <p className="text-[10px] text-white/40 truncate font-mono group-hover:text-white" style={url === recentUrl ? { color: accentColor } : {}}>{recentUrl}</p>
                  </button>
                ))}
                {recentUrls.length === 0 && (
                  <p className="text-[10px] text-white/10 italic text-center py-8">No recent history</p>
                )}
              </div>
            </div>
          </div>
          {isYTSearchOpen && <YouTubeSearchOverlay onClose={() => setIsYTSearchOpen(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
