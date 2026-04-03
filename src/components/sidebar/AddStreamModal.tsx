"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Link, Type, Tag, Image as ImageIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { StreamType } from "@/types";

export const AddStreamModal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const { addStream } = useAppStore();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !name) return;

    let type: StreamType = "hls";
    if (url.includes(".mpd")) type = "dash";
    else if (url.includes("youtube.com") || url.includes("youtu.be")) type = "youtube";
    else if (url.includes("twitch.tv")) type = "twitch";
    else if (url.endsWith(".mp4") || url.endsWith(".webm")) type = "mp4";

    addStream({
      url,
      name,
      thumbnail: thumbnail || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      priority,
      type,
    });

    // Reset
    setUrl("");
    setName("");
    setThumbnail("");
    setTags("");
    setPriority("medium");
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#12121a] border border-white/10 rounded-2xl p-6 shadow-2xl z-[101] animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-500" />
              ADD NEW STREAM
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Link className="w-3 h-3" /> STREAM URL
              </label>
              <input
                autoFocus
                required
                placeholder="https://example.com/playlist.m3u8"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Type className="w-3 h-3" /> STREAM NAME
              </label>
              <input
                required
                placeholder="Live Event 01"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Tag className="w-3 h-3" /> TAGS
                </label>
                <input
                  placeholder="Sports, News..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> PRIORITY
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as import('@/types').Stream['priority'])}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                >
                  <option value="low">LOW</option>
                  <option value="medium">MEDIUM</option>
                  <option value="high">HIGH</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> THUMBNAIL URL (OPTIONAL)
              </label>
              <input
                placeholder="https://example.com/thumb.jpg"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-black h-12 rounded-xl gap-2 shadow-lg shadow-cyan-500/20">
                <Plus className="w-5 h-5" />
                ADD TO GRID
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
