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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { PlatformType } from "@/types";
import { cn } from "@/lib/utils";

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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-[#12121a] border border-white/10 rounded-2xl p-0 shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200">

          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
            <Dialog.Title className="text-xl font-black tracking-tight text-white flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: accentColor, boxShadow: `0 8px 24px ${accentColor}33` }}
              >
                <Plus className="w-6 h-6 text-black" />
              </div>
              ADD LIVE STREAM
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex h-[500px]">
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 border-r border-white/5 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Link className="w-3 h-3" style={{ color: accentColor }} /> Live Stream Link
                </label>
                <div className="relative group">
                  <input
                    required
                    placeholder="Paste channel or video URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={cn(
                      "w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none transition-all",
                      error ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                    )}
                    style={!error && url ? { borderColor: `${accentColor}40` } : {}}
                  />
                  <Button
                    type="button"
                    onClick={handlePaste}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/5 hover:bg-white/10 text-white/40"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold bg-red-400/5 p-2 rounded-lg border border-red-400/10">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Type className="w-3 h-3" style={{ color: accentColor }} /> Stream Name
                  </label>
                  <input
                    required
                    placeholder="Enter stream name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Monitor className="w-3 h-3" style={{ color: accentColor }} /> Platform
                  </label>
                  <div className="relative">
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white appearance-none focus:outline-none focus:border-white/20 transition-all"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Tag className="w-3 h-3" style={{ color: accentColor }} /> Tags
                  </label>
                  <input
                    placeholder="e.g. Gaming, News..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Zap className="w-3 h-3" style={{ color: accentColor }} /> Priority (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!!error || !url || !name}
                className="w-full disabled:opacity-50 text-black font-black h-12 rounded-xl gap-2 shadow-lg mt-4 transition-all"
                style={{ backgroundColor: accentColor, color: 'black', boxShadow: `0 8px 24px ${accentColor}33` }}
              >
                <Plus className="w-5 h-5" />
                ADD TO GRID
              </Button>
            </form>

            {/* Right Column: Recents */}
            <div className="w-52 p-6 bg-white/[0.02] flex flex-col">
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
