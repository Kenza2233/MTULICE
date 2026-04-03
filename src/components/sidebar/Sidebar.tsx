"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useHealthStore } from '@/lib/streams/StreamHealthMonitor';
import {
  Search,
  Trash2,
  Settings2,
  Plus,
  ChevronLeft,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AddStreamModal } from './AddStreamModal';

export const Sidebar: React.FC = () => {
  const {
    streams,
    removeStream,
    sidebarOpen,
    setSidebarOpen,
    focusedStreamId,
    setFocusedStreamId
  } = useAppStore();
  const streamHealth = useHealthStore((state) => state.streamHealth);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredStreams = streams.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-72 bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/5 z-40 transition-transform duration-300">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/70">STREAMS</h2>
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
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              placeholder="Search streams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filteredStreams.map((stream) => {
            const health = streamHealth[stream.id];
            const isActive = focusedStreamId === stream.id;

            return (
              <div
                key={stream.id}
                onClick={() => setFocusedStreamId(stream.id)}
                className={cn(
                  "group relative p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-2",
                  isActive ? "bg-cyan-500/10 border-cyan-500/50" : "bg-white/5 border-transparent hover:bg-white/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      health?.status === 'live' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                      health?.status === 'reconnecting' ? "bg-yellow-500" :
                      "bg-red-500"
                    )} />
                    <span className="text-xs font-bold text-white/80 truncate">{stream.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-white/40 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // open edit modal
                      }}
                    >
                      <Settings2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-white/40 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStream(stream.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {stream.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-0.5 text-[8px] bg-white/5 border border-white/10 rounded px-1 text-white/40 uppercase font-bold tracking-tighter">
                      <Tag className="h-2 w-2" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/30">
                  <span className="font-mono">{health?.currentResolution || '0p'} • {health?.currentBitrate ? `${Math.round(health.currentBitrate)} kbps` : '0 kbps'}</span>
                  <span className="font-bold">{stream.priority.toUpperCase()}</span>
                </div>
              </div>
            );
          })}

          {filteredStreams.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-xs text-white/20">No streams found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <Button
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold h-10 gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            ADD STREAM
          </Button>
        </div>

        <AddStreamModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      </div>
    </aside>
  );
};
