"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Plus,
  Link,
  Type,
  Tag,
  Youtube,
  History,
  Clipboard,
  AlertCircle,
  Star,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { YouTubeSearchOverlay } from "../youtube/YouTubeSearchOverlay";

export const AddStreamModal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const { addChannel, recentUrls, interfaceSettings } = useAppStore();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [isYTSearchOpen, setIsYTSearchOpen] = useState(false);

  const accentColor = interfaceSettings.accentColor;

  useEffect(() => {
    if (!url) {
        setError(null);
        return;
    }

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (!isYouTube) {
      setError("Only YouTube links are supported");
    } else {
      setError(null);
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error || !url || !name) return;

    addChannel({
      name,
      channelUrl: url,
      platform: 'youtube',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      priority,
      autoAddWhenLive: true,
    });

    // Reset
    setUrl("");
    setName("");
    setTags("");
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
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] animate-in fade-in" />
        <Dialog.Content className="fixed top-0 left-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-screen h-screen md:w-full md:max-w-xl bg-[#0a0a0f] md:border md:border-white/10 md:rounded-2xl p-0 shadow-2xl z-[101] overflow-hidden animate-in md:zoom-in-95 slide-in-from-bottom md:slide-in-from-none duration-200">

          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/40">
            <Dialog.Title className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-3">
              <div
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>
              ADD YOUTUBE STREAM
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white/40 hover:text-white">
                <X className="h-6 w-6" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[520px] overflow-hidden">
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 rounded-full border border-red-600/20">
                   <Youtube className="w-3.5 h-3.5 text-red-600" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-red-600">YouTube Exclusive</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsYTSearchOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search YouTube
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 ml-1">
                  <Link className="w-3 h-3" style={{ color: accentColor }} /> Paste YouTube Live Link
                </label>
                <div className="relative group flex gap-2">
                  <input
                    required
                    placeholder="youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={cn(
                      "flex-1 bg-white/5 border rounded-xl px-4 py-4 text-base md:text-sm text-white placeholder:text-white/10 focus:outline-none transition-all",
                      error ? "border-red-500/50 focus:border-red-500" : "border-white/5 focus:border-white/20"
                    )}
                  />
                  <Button
                    type="button"
                    onClick={handlePaste}
                    className="h-[52px] md:h-auto px-4 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl"
                  >
                    <Clipboard className="w-5 h-5 md:w-4 md:h-4" />
                  </Button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold bg-red-400/5 p-3 rounded-xl border border-red-400/10 animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 ml-1">
                    <Type className="w-3 h-3" style={{ color: accentColor }} /> Stream Name
                  </label>
                  <input
                    required
                    placeholder="e.g. Lofi Girl Live"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-base md:text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 ml-1">
                    <Tag className="w-3 h-3" style={{ color: accentColor }} /> Tags (Comma separated)
                  </label>
                  <input
                    placeholder="Gaming, Music, News..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-base md:text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 ml-1">
                  <Star className="w-3 h-3" style={{ color: accentColor }} /> Allocation Priority
                </label>
                <div className="flex items-center gap-3 py-3 px-4 bg-white/[0.02] border border-white/5 rounded-2xl justify-between">
                  <div className="flex gap-2">
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
                            s <= priority ? "fill-current" : "text-white/5"
                          )}
                          style={s <= priority ? { color: accentColor } : {}}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{priority} / 5 STARS</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!!error || !url || !name}
                className="w-full disabled:opacity-50 text-black font-black h-14 md:h-12 rounded-xl gap-2 shadow-lg transition-all text-sm uppercase tracking-widest"
                style={{ backgroundColor: accentColor }}
              >
                <Plus className="w-5 h-5" />
                ADD TO GRID
              </Button>

              <div className="pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2 mb-4 ml-1">
                  <History className="w-3 h-3" /> Recent URLs
                </h3>
                <div className="grid grid-cols-1 gap-2">
                   {recentUrls.map((recentUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setUrl(recentUrl)}
                      className="w-full text-left p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all group"
                    >
                      <span className="text-[11px] text-white/40 truncate font-mono flex-1 group-hover:text-white transition-colors">{recentUrl}</span>
                    </button>
                   ))}
                   {recentUrls.length === 0 && (
                     <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">No recent history</p>
                     </div>
                   )}
                </div>
              </div>
            </form>
          </div>
          {isYTSearchOpen && <YouTubeSearchOverlay onClose={() => setIsYTSearchOpen(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
