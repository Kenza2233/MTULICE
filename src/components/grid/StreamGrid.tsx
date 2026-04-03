"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { AnimatePresence, Reorder } from 'framer-motion';

export const StreamGrid: React.FC = () => {
  const { streams, displaySettings, videoSettings, reorderStreams } = useAppStore();
  const sortedStreams = [...streams].sort((a, b) => a.order - b.order);
  const streamCount = sortedStreams.length;

  const getGridCols = () => {
    if (displaySettings.gridLayout !== 'auto') {
      const [cols] = displaySettings.gridLayout.split('x').map(Number);
      return cols;
    }
    if (streamCount <= 1) return 1;
    if (streamCount <= 2) return 2;
    if (streamCount <= 4) return 2;
    if (streamCount <= 6) return 3;
    if (streamCount <= 9) return 3;
    return 4;
  };

  const getGridRows = () => {
    if (displaySettings.gridLayout !== 'auto') {
      const [, rows] = displaySettings.gridLayout.split('x').map(Number);
      return rows;
    }
    if (streamCount <= 1) return 1;
    if (streamCount <= 2) return 1;
    if (streamCount <= 4) return 2;
    if (streamCount <= 6) return 2;
    if (streamCount <= 9) return 3;
    return 3;
  };

  const cols = getGridCols();
  const rows = getGridRows();

  const handleReorder = (newOrder: typeof sortedStreams) => {
    reorderStreams(newOrder.map(s => s.id));
  };

  return (
    <Reorder.Group
      axis="y"
      values={sortedStreams}
      onReorder={handleReorder}
      className="grid gap-4 w-full h-full p-4 transition-all duration-500 ease-in-out"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        aspectRatio: '16/9'
      }}
    >
      <AnimatePresence>
        {sortedStreams.map((stream) => (
          <Reorder.Item
            key={stream.id}
            value={stream}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              layout: { duration: displaySettings.animatedTransitions ? 0.3 : 0 }
            }}
            className="w-full h-full cursor-move active:cursor-grabbing"
          >
            <GridCell stream={stream} videoSettings={videoSettings} />
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
};

import { Stream, VideoPerformanceSettings } from '@/types';

const GridCell: React.FC<{ stream: Stream, videoSettings: VideoPerformanceSettings }> = ({ stream, videoSettings }) => {
  const [isVisible, setIsVisible] = useState(true);
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        console.log(`Stream ${stream.name} visibility: ${entry.isIntersecting}`);
      },
      { threshold: 0.1 }
    );

    if (cellRef.current) {
      observer.observe(cellRef.current);
    }

    return () => observer.disconnect();
  }, [stream.name]);

  return (
    <div ref={cellRef} className="w-full h-full">
      {/* Passing visibility as a prop to VideoPlayer could be one way,
          but let's update VideoPlayer to use this context or its own observer */}
      <VideoPlayer stream={{ ...stream, isVisible }} settings={{ ...videoSettings, showLabels: videoSettings.showLabels ?? true }} />
    </div>
  );
};
