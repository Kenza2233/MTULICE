"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Youtube,
  Play,
  Plus,
  Loader2,
  Circle,
  History,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

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

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'live', name: '🔴 Live Now' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'music', name: 'Music' },
  { id: 'vtuber', name: 'VTuber' },
  { id: 'news', name: 'News' },
  { id: 'sports', name: 'Sports' },
];

export const YouTubeSearchOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { addChannel, networkSettings, interfaceSettings } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const accentColor = interfaceSettings.accentColor;

  useEffect(() => {
    inputRef.current?.focus();
    const saved = localStorage.getItem('yt-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveRecentSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 20);
    setRecentSearches(updated);
    localStorage.setItem('yt-recent-searches', JSON.stringify(updated));
  };

  const removeRecentSearch = (q: string) => {
    const updated = recentSearches.filter(s => s !== q);
    setRecentSearches(updated);
    localStorage.setItem('yt-recent-searches', JSON.stringify(updated));
  };

  // Debounced suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`);
        const text = await res.text();
        const json = JSON.parse(text.match(/window\.google\.ac\.h\((.*)\)/)?.[1] || '[]');
        const suggestions = json[1]?.map((s: any[]) => s[0]) || [];
        setSuggestions(suggestions);
      } catch (err) {
        console.error('Suggestions error', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (q: string = query, cat: string = activeCategory) => {
    const finalQuery = q.trim();
    if (!finalQuery) return;

    setLoading(true);
    setError(null);
    setIsInputFocused(false);
    saveRecentSearch(finalQuery);

    try {
      const searchRes = cat === 'live' ? `${finalQuery} live` : finalQuery;
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchRes)}&key=${networkSettings.youtubeApiKey || ''}`);
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
      <div className="p-4 border-b border-white/5 bg-black/60 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={onClose} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
          <X className="w-7 h-7" />
        </button>
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20">
            <Search className="w-full h-full" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search YouTube channels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-base text-white focus:outline-none focus:border-cyan-500/50 transition-all h-14"
          />
          {query && (
            <button
              onClick={() => {setQuery(''); inputRef.current?.focus();}}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/20 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Autocomplete / Recent Dropdown */}
          {isInputFocused && (query.trim() || recentSearches.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-150">
              <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
                {query.trim() && suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(s); handleSearch(s); }}
                    className="w-full text-left px-5 py-3 hover:bg-white/5 flex items-center gap-4 group"
                  >
                    <Search className="w-4 h-4 text-white/20 group-hover:text-cyan-500" />
                    <span className="text-sm font-medium text-white/80 group-hover:text-white">{s}</span>
                  </button>
                ))}
                {!query.trim() && recentSearches.map((s, i) => (
                  <div key={i} className="flex items-center hover:bg-white/5 group">
                    <button
                      onClick={() => { setQuery(s); handleSearch(s); }}
                      className="flex-1 text-left px-5 py-3 flex items-center gap-4"
                    >
                      <History className="w-4 h-4 text-white/20" />
                      <span className="text-sm font-medium text-white/60 group-hover:text-white">{s}</span>
                    </button>
                    <button
                      onClick={() => removeRecentSearch(s)}
                      className="p-3 text-white/20 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar shrink-0">
         {CATEGORIES.map((cat) => (
           <button
             key={cat.id}
             onClick={() => { setActiveCategory(cat.id); if(query) handleSearch(query, cat.id); }}
             className={cn(
               "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap border transition-all",
               activeCategory === cat.id
                ? "bg-white text-black border-white shadow-xl shadow-white/5"
                : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
             )}
           >
             {cat.name}
           </button>
         ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-black/40">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse rounded-full" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">Scanning Satellite Nodes...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-center space-y-4">
            <TrendingUp className="w-10 h-10 mx-auto opacity-20 rotate-45" />
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-widest">Search failure</p>
              <p className="text-xs opacity-60 leading-relaxed">{error}</p>
            </div>
            <Button
               onClick={() => handleSearch()}
               className="bg-red-500 text-white h-10 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
              Retry Connection
            </Button>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {results.map((result) => (
              <div
                key={result.id}
                className="group p-5 rounded-3xl bg-[#12121a] border border-white/5 flex flex-col gap-5 shadow-2xl hover:border-white/20 transition-all hover:-translate-y-1 duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img src={result.avatar} alt={result.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg" />
                    {result.isLive && (
                      <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded-md border border-black/50 shadow-xl">
                        LIVE
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white truncate text-base leading-none group-hover:text-cyan-500 transition-colors">{result.name}</h3>
                      <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                      {result.isLive ? (
                        <div className="flex items-center gap-1.5">
                          <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">On Air</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Standby</span>
                      )}
                      {result.subscriberCount && (
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{typeof result.subscriberCount === 'number' ? new Intl.NumberFormat('en', { notation: 'compact' }).format(result.subscriberCount) : result.subscriberCount} Subs</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/30 line-clamp-2 leading-relaxed h-8">{result.description || 'Verified YouTube Broadcast Channel'}</p>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleAddChannel(result)}
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl bg-white/5 border-white/5 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4" /> Add Channel
                  </Button>
                  {result.isLive && (
                    <Button
                      onClick={() => handleWatchNow(result)}
                      className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-cyan-500/10"
                      style={{ backgroundColor: accentColor, color: 'black' }}
                    >
                      <Play className="w-4 h-4 fill-current" /> Watch Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-10">
            <Search className="w-24 h-24" />
            <div className="text-center space-y-2">
              <p className="text-xl font-black uppercase tracking-widest">No Signals Detected</p>
              <p className="text-sm font-medium">Try refining your search parameters</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-8">
               <Youtube className="w-10 h-10 text-white/10" />
            </div>
            <h2 className="text-2xl font-black text-white/20 uppercase tracking-widest mb-4">Satellite Scan Ready</h2>
            <p className="text-white/10 text-sm font-medium leading-relaxed">
              Enter a channel name or live topic to begin scanning the YouTube broadcast network.
            </p>
          </div>
        )}
      </div>

      {/* Footer / Mobile Hint */}
      <div className="p-4 border-t border-white/5 bg-black/60 text-center md:hidden shrink-0">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Swipe up to dismiss</p>
      </div>
    </div>
  );
};
