"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Youtube,
  Play,
  Plus,
  Loader2,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

interface YouTubeSearchResult {
  id: string;
  name: string;
  avatar: string;
  description: string;
  subscriberCount?: string | number;
  isLive: boolean;
  liveVideoId?: string;
  platform: 'youtube';
}

export const YouTubeSearchOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addChannel, networkSettings, interfaceSettings } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const accentColor = interfaceSettings.accentColor;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&key=${networkSettings.youtubeApiKey || ''}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = (result: YouTubeSearchResult) => {
    addChannel({
      name: result.name,
      channelUrl: `https://www.youtube.com/channel/${result.id}`,
      platform: 'youtube',
      tags: [],
      priority: 3,
      autoAddWhenLive: true,
    });
    onClose();
  };

  const handleWatchNow = (result: YouTubeSearchResult) => {
    if (result.isLive) {
      const videoUrl = result.liveVideoId
        ? `https://www.youtube.com/watch?v=${result.liveVideoId}`
        : `https://www.youtube.com/channel/${result.id}/live`;

      addChannel({
        name: result.name,
        channelUrl: videoUrl,
        platform: 'youtube',
        tags: ['LIVE'],
        priority: 5,
        autoAddWhenLive: true,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-[120] flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-black/40 flex items-center gap-4">
        <button onClick={onClose} className="p-2 -ml-2 text-white/40 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <form onSubmit={handleSearch}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search YouTube channels..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none"
            />
          </form>
        </div>
        <Button
          onClick={() => handleSearch()}
          className="h-11 px-6 rounded-xl font-bold"
          style={{ backgroundColor: accentColor, color: 'black' }}
        >
          SEARCH
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Fetching Results...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-4 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <img src={result.avatar} alt={result.name} className="w-14 h-14 rounded-full border border-white/10" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white truncate">{result.name}</h3>
                    <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {result.isLive ? (
                      <div className="flex items-center gap-1.5">
                        <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Now</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Offline</span>
                    )}
                    {result.subscriberCount && (
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{typeof result.subscriberCount === 'number' ? new Intl.NumberFormat('en', { notation: 'compact' }).format(result.subscriberCount) : result.subscriberCount} Subscribers</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 line-clamp-1 mt-1 font-medium">{result.description || 'YouTube Channel'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <Button
                  onClick={() => handleAddChannel(result)}
                  className="flex-1 h-10 rounded-xl bg-white/10 text-[10px] font-black uppercase tracking-widest gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Channel
                </Button>
                {result.isLive && (
                  <Button
                    onClick={() => handleWatchNow(result)}
                    className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                    style={{ backgroundColor: accentColor, color: 'black' }}
                  >
                    <Play className="w-4 h-4 fill-current" /> Watch Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && results.length === 0 && !error && query && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
            <Search className="w-16 h-16" />
            <p className="text-sm font-black uppercase tracking-widest">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
};
