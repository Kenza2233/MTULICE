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
  ChevronLeft,
  ChevronRight
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

export const StreamGrid: React.FC = () => {
  const { channels, displaySettings, videoSettings, reorderChannels, focusedChannelId, setFocusedChannelId } = useAppStore();
  const sortedChannels = [...channels].sort((a, b) => a.order - b.order);
  const channelCount = sortedChannels.length;
  const [isMobile, setIsMobile] = useState(false);

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

  const focusedChannel = sortedChannels.find(c => c.id === focusedChannelId) || sortedChannels[0];

  if (isMobile && channelCount > 0) {
    return (
      <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="w-full aspect-video shadow-2xl rounded-2xl overflow-hidden border border-white/10">
            <GridCell channel={focusedChannel} showLabels={videoSettings.showLabels} />
          </div>
        </div>

        <div className="h-24 w-full flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar shrink-0 px-2">
          {sortedChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setFocusedChannelId(channel.id)}
              className={cn(
                "h-full aspect-video rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-black/40",
                focusedChannelId === channel.id || (focusedChannelId === null && channel === sortedChannels[0])
                  ? "border-cyan-500 scale-105"
                  : "border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
              )}
            >
              <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-white/40 uppercase tracking-tighter text-center px-1">
                {channel.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 overflow-hidden flex items-center justify-center">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortedChannels.map(c => c.id)} strategy={rectSortingStrategy}>
          <div
            className="grid gap-4 w-full h-full transition-all duration-500 ease-in-out"
            style={{
              gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
              gridTemplateRows: `repeat(${getGridRows()}, 1fr)`,
              aspectRatio: '16/9'
            }}
          >
            <AnimatePresence>
              {sortedChannels.map((channel) => (
                <SortableItem
                  key={channel.id}
                  channel={channel}
                  showLabels={videoSettings.showLabels}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const SortableItem = ({ channel, showLabels }: { channel: Channel, showLabels?: boolean }) => {
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
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full h-full relative group">
      <GridCell channel={channel} showLabels={showLabels} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
};

const GridCell: React.FC<{
  channel: Channel,
  showLabels?: boolean,
  dragListeners?: import('@dnd-kit/core').DraggableSyntheticListeners,
  dragAttributes?: import('@dnd-kit/core').DraggableAttributes
}> = ({ channel, showLabels, dragListeners, dragAttributes }) => {
  const { removeChannel } = useAppStore();
  const [key, setKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => setKey(prev => prev + 1);
  const toggleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-colors shadow-2xl bg-black">
      <PlatformEmbedPlayer key={key} channel={channel} />

      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500 text-white text-[8px] font-black uppercase tracking-widest">
              <Circle className="w-2 h-2 fill-current animate-pulse" />
              LIVE
            </div>
            {showLabels && (
              <span className="text-[10px] font-black text-white uppercase tracking-tight drop-shadow-lg truncate max-w-[120px]">{channel.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          {dragAttributes && (
            <div {...dragAttributes} {...dragListeners} className="h-7 w-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-3.5 w-3.5" />
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <a
            href={channel.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 w-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-red-500 hover:bg-red-500/10" onClick={() => removeChannel(channel.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/60 backdrop-blur-md text-white hover:text-cyan-500 border border-white/10" onClick={toggleFullscreen}>
            <Maximize className="h-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
