"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlatformEmbedPlayer } from '@/components/player/PlatformEmbedPlayer';
import { AnimatePresence } from 'framer-motion';
import { Channel } from '@/types';
import {
  Maximize,
  RefreshCw,
  ExternalLink,
  Trash2,
  Circle,
  GripVertical,
  Timer,
  Search,
  Plus,
  Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AddStreamModal } from '../sidebar/AddStreamModal';
import { YouTubeSearchOverlay } from '../youtube/YouTubeSearchOverlay';

export const StreamGrid: React.FC = () => {
  const { channels, displaySettings, interfaceSettings, reorderChannels, focusedChannelId, setFocusedChannelId } = useAppStore();
  const sortedChannels = [...channels].sort((a, b) => a.order - b.order);
  const channelCount = sortedChannels.length;
  const [isMobile, setIsMobile] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getGridCols = () => {
    if (isMobile) return 1;
    if (displaySettings.gridLayout !== 'auto') {
      const [cols] = displaySettings.gridLayout.split('x').map(Number);
      return cols;
    }
    if (channelCount <= 1) return 1;
    if (channelCount <= 2) return 2;
    if (channelCount <= 4) return 2;
    if (channelCount <= 6) return 3;
    if (channelCount <= 9) return 3;
    return 4;
  };

  const getGridRows = () => {
    if (isMobile) return 1;
    if (displaySettings.gridLayout !== 'auto') {
      const [, rows] = displaySettings.gridLayout.split('x').map(Number);
      return rows;
    }
    if (channelCount <= 1) return 1;
    if (channelCount <= 2) return 1;
    if (channelCount <= 4) return 2;
    if (channelCount <= 6) return 2;
    if (channelCount <= 9) return 3;
    return 3;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedChannels.findIndex((c) => c.id === active.id);
      const newIndex = sortedChannels.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(sortedChannels, oldIndex, newIndex);
      reorderChannels(newOrder.map(c => c.id));
    }
  };

  const activeFocusedId = focusedChannelId || (sortedChannels[0]?.id);
  const focusedChannel = sortedChannels.find(c => c.id === activeFocusedId);

  if (channelCount === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-3xl">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
           <Youtube className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white/80 max-w-md leading-tight mb-4">
          No streams yet. Search for a YouTube channel or paste a live link to get started.
        </h2>
        <p className="text-white/30 text-sm max-w-xs mb-10">
          Your command center for high-performance YouTube live monitoring.
        </p>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-sm">
          <Button
            onClick={() => setIsSearchOpen(true)}
            className="h-14 md:h-12 bg-cyan-500 hover:bg-cyan-400 text-black font-black flex-1 rounded-2xl gap-2 shadow-xl shadow-cyan-500/10 uppercase tracking-widest text-xs"
          >
            <Search className="w-4 h-4" />
            Search YouTube
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="outline"
            className="h-14 md:h-12 border-white/10 hover:bg-white/5 text-white font-black flex-1 rounded-2xl gap-2 uppercase tracking-widest text-xs"
          >
            <Plus className="w-4 h-4" />
            Paste Link
          </Button>
        </div>
        <AddStreamModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
        {isSearchOpen && <YouTubeSearchOverlay onClose={() => setIsSearchOpen(false)} />}
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full h-full p-4 overflow-hidden flex flex-col items-center justify-center relative",
      interfaceSettings.compactMode && "p-1 gap-1"
    )}>
      {isMobile ? (
        <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="w-full aspect-video shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-black">
              {focusedChannel && (
                <GridCell
                  channel={focusedChannel}
                  showLabels={displaySettings.showLabels}
                  showTimer={interfaceSettings.showStreamTimer}
                />
              )}
            </div>
          </div>

          <div className="h-28 w-full flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar shrink-0 px-1">
            {sortedChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setFocusedChannelId(channel.id)}
                className={cn(
                  "h-full aspect-video rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-black/60 relative",
                  activeFocusedId === channel.id
                    ? "border-cyan-500 scale-105 shadow-xl shadow-cyan-500/20"
                    : "border-white/5 opacity-40 hover:opacity-100"
                )}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(https://img.youtube.com/vi/${channel.channelUrl.match(/(?:v=|\/|live\/)([0-9A-Za-z_-]{11})/)?.[1]}/mqdefault.jpg)` }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-tighter text-center px-2 leading-tight">
                  {channel.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedChannels.map(c => c.id)} strategy={rectSortingStrategy}>
            <div
              className={cn(
                "grid w-full h-full transition-all duration-500 ease-in-out",
                interfaceSettings.compactMode ? "gap-1" : "gap-4"
              )}
              style={{
                gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
                gridTemplateRows: `repeat(${getGridRows()}, 1fr)`,
                aspectRatio: '16/9',
              }}
            >
              <AnimatePresence initial={false}>
                {sortedChannels.map((channel) => (
                  <SortableItem
                    key={channel.id}
                    channel={channel}
                    showLabels={displaySettings.showLabels}
                    showTimer={interfaceSettings.showStreamTimer}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

const SortableItem = ({ channel, showLabels, showTimer }: { channel: Channel, showLabels: boolean, showTimer: boolean }) => {
  const { interfaceSettings } = useAppStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: channel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: interfaceSettings.animations ? transition : 'none',
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full h-full relative group">
      <GridCell channel={channel} showLabels={showLabels} showTimer={showTimer} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
};

const GridCell: React.FC<{
  channel: Channel,
  showLabels: boolean,
  showTimer: boolean,
  dragListeners?: import('@dnd-kit/core').DraggableSyntheticListeners,
  dragAttributes?: import('@dnd-kit/core').DraggableAttributes
}> = ({ channel, showLabels, showTimer, dragListeners, dragAttributes }) => {
  const { removeChannel, interfaceSettings } = useAppStore();
  const [key, setKey] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setElapsedTime(0);
    if (!showTimer) return;
    const interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [channel.id, showTimer, key]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const handleRefresh = () => setKey(prev => prev + 1);
  const toggleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const accentColor = interfaceSettings.accentColor;

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full relative rounded-xl overflow-hidden border border-white/10 transition-all shadow-2xl bg-black group/cell",
        interfaceSettings.compactMode && "rounded-md"
      )}
      style={{ borderLeft: `2px solid ${accentColor}40` }}
    >
      <PlatformEmbedPlayer key={key} channel={channel} />

      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start opacity-0 group-hover/cell:opacity-100 transition-all bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
              <Circle className="w-2.5 h-2.5 fill-current animate-pulse" />
              LIVE
            </div>
            {showLabels && (
              <span className="text-xs font-black text-white uppercase tracking-tight drop-shadow-xl truncate max-w-[150px]">{channel.name}</span>
            )}
          </div>
          {showTimer && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 drop-shadow-lg font-bold">
              <Timer className="w-3 h-3" />
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {dragAttributes && (
            <div {...dragAttributes} {...dragListeners} className="h-8 w-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-lg" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <a
            href={channel.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg" onClick={() => removeChannel(channel.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover/cell:opacity-100 transition-all z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-black/80 backdrop-blur-md text-white border border-white/10 hover:border-white/30 rounded-xl shadow-2xl transition-all"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
