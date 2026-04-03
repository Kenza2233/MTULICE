"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Search,
  Trash2,
  Settings2,
  Plus,
  ChevronLeft,
  Tag,
  Youtube,
  Twitch,
  Music2,
  Zap,
  Facebook,
  Link as LinkIcon,
  Monitor,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AddStreamModal } from './AddStreamModal';

const PLATFORM_ICONS = {
  youtube: <Youtube className="w-3 h-3 text-red-500" />,
  twitch: <Twitch className="w-3 h-3 text-purple-500" />,
  tiktok: <Music2 className="w-3 h-3 text-cyan-500" />,
  kick: <Zap className="w-3 h-3 text-green-500" />,
  facebook: <Facebook className="w-3 h-3 text-blue-500" />,
  rumble: <Monitor className="w-3 h-3 text-white/40" />,
  trovo: <Monitor className="w-3 h-3 text-white/40" />,
  dlive: <Monitor className="w-3 h-3 text-white/40" />,
  custom: <LinkIcon className="w-3 h-3 text-white/40" />,
};

export const Sidebar: React.FC = () => {
  const {
    channels,
    removeChannel,
    sidebarOpen,
    setSidebarOpen,
    focusedChannelId,
    setFocusedChannelId,
    importChannels,
    interfaceSettings
  } = useAppStore();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const accentColor = interfaceSettings.accentColor;

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const data = JSON.stringify(channels, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `multilive-channels-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          importChannels(imported);
        }
      } catch (err) {
        console.error('Failed to import channels', err);
      }
    };
    reader.readAsText(file);
  };

  if (!sidebarOpen) return null;

  return (
    <aside
      className={cn(
        "fixed top-14 left-0 bottom-0 w-72 bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/5 z-40 transition-transform",
        interfaceSettings.animations ? "duration-300" : "duration-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/70">CHANNELS</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white/40 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 bg-white/[0.01]">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-cyan-500 transition-colors" style={{ color: search ? accentColor : undefined }} />
            <input
              type="text"
              placeholder="Filter by name or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-bold text-white placeholder:text-white/20 focus:outline-none transition-all uppercase tracking-widest"
              style={{ borderColor: search ? `${accentColor}40` : undefined }}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 custom-scrollbar">
          {filteredChannels.map((channel) => {
            const isActive = focusedChannelId === channel.id;

            return (
              <div
                key={channel.id}
                onClick={() => setFocusedChannelId(channel.id)}
                className={cn(
                  "group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-3",
                  isActive ? "bg-white/[0.04] border-current shadow-lg" : "bg-white/5 border-transparent hover:bg-white/[0.08]"
                )}
                style={isActive ? { color: accentColor, borderColor: accentColor } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                      {PLATFORM_ICONS[channel.platform]}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[11px] font-black text-white/80 truncate uppercase tracking-tight">{channel.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60" style={{ color: accentColor }}>{channel.platform}</span>
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={channel.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChannel(channel.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {channel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {channel.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-0.5 text-[8px] bg-white/5 border border-white/5 rounded px-1.5 py-0.5 text-white/30 uppercase font-black tracking-tighter">
                        <Tag className="h-2 w-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredChannels.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white/10" />
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">No channels found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 space-y-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 h-10 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase gap-2"
              onClick={handleExport}
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT
            </Button>
            <div className="flex-1 relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <Button
                variant="ghost"
                className="w-full h-10 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                IMPORT
              </Button>
            </div>
          </div>
          <Button
            className="w-full font-black h-12 rounded-xl gap-2 shadow-lg transition-all active:scale-95"
            onClick={() => setIsAddModalOpen(true)}
            style={{ backgroundColor: accentColor, color: 'black', boxShadow: `0 8px 24px ${accentColor}33` }}
          >
            <Plus className="w-5 h-5" />
            ADD CHANNEL
          </Button>
        </div>

        <AddStreamModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      </div>
    </aside>
  );
};
