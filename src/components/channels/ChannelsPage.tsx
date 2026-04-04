"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  ExternalLink,
  Circle,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AddStreamModal } from '../sidebar/AddStreamModal';
import { YouTubeSearchOverlay } from "../youtube/YouTubeSearchOverlay";

export const ChannelsPage: React.FC = () => {
  const { channels, removeChannel, updateChannel, interfaceSettings } = useAppStore();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isYTSearchOpen, setIsYTSearchOpen] = useState(false);

  const accentColor = interfaceSettings.accentColor;

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-40 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-cyan-500" />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white uppercase italic">Channels</h2>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="h-10 w-10 p-0 rounded-xl shadow-lg"
          style={{ backgroundColor: accentColor, color: 'black' }}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 bg-black/10">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
            style={search ? { borderColor: accentColor } : {}}
          />
        </div>
        <div className="flex justify-end mt-2">
            <button
                onClick={() => setIsYTSearchOpen(true)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors"
            >
                <Search className="w-3 h-3" />
                Search YouTube
            </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {filteredChannels.map((channel) => (
          <div
            key={channel.id}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-white/10 shrink-0">
                  <span className="text-lg font-black text-white/20">{channel.name[0].toUpperCase()}</span>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{channel.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60">{channel.platform}</span>
                    <div className="flex items-center gap-1">
                       <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
                       <span className="text-[9px] font-bold text-green-500 uppercase tracking-tighter">Live</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                   checked={channel.autoAddWhenLive}
                   onCheckedChange={(val) => updateChannel(channel.id, { autoAddWhenLive: val })}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {channel.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {channel.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[9px] bg-white/5 border border-white/5 rounded-full px-2.5 py-1 text-white/40 uppercase font-black">
                    <Tag className="w-2 h-2" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <Button
                variant="ghost"
                className="flex-1 h-9 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest gap-2"
                onClick={() => window.open(channel.channelUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3" /> Visit
              </Button>
              <Button
                variant="ghost"
                className="h-9 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase px-4"
                onClick={() => removeChannel(channel.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {filteredChannels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
            <Users className="w-16 h-16" />
            <p className="text-sm font-black uppercase tracking-widest">No channels found</p>
          </div>
        )}
      </div>

      <AddStreamModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      {isYTSearchOpen && <YouTubeSearchOverlay onClose={() => setIsYTSearchOpen(false)} />}
    </div>
  );
};
