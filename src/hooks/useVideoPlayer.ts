import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import shaka from 'shaka-player';
import { Stream, VideoPerformanceSettings } from '@/types';
import { useHealthStore } from '@/lib/streams/StreamHealthMonitor';
import { useBandwidthStore } from '@/lib/bandwidth/GlobalBandwidthManager';
interface VideoPlayerProps {
  stream: Stream;
  settings: VideoPerformanceSettings;
}

export const useVideoPlayer = ({ stream, settings }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const shakaRef = useRef<shaka.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(stream.volume);
  const [isMuted, setIsMuted] = useState(stream.isMuted);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const qualityCap = useBandwidthStore((state) => state.qualityCap);

  const updateHealth = useCallback((metrics: Partial<import('@/lib/streams/StreamHealthMonitor').StreamHealthMetrics>) => {
    useHealthStore.getState().updateHealth(stream.id, metrics);
  }, [stream.id]);

  const initPlayerRef = useRef<() => void>(() => {});

  const handleFatalError = useCallback(() => {
    updateHealth({ status: 'reconnecting' });
    if (reconnectAttemptsRef.current < 3) {
      reconnectAttemptsRef.current += 1;
      const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        initPlayerRef.current();
      }, delay);
    } else {
      updateHealth({ status: 'offline' });
    }
  }, [updateHealth]);

  const initPlayer = useCallback(async () => {
    if (!videoRef.current || ['youtube', 'twitch', 'iframe'].includes(stream.type)) return;
    const video = videoRef.current;

    // Reset current players
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (shakaRef.current) {
      await shakaRef.current.destroy();
      shakaRef.current = null;
    }

    const { url, type } = stream;

    // Auto-detect type if not specified or override
    let finalType = type;
    if (url.endsWith('.m3u8')) finalType = 'hls';
    if (url.endsWith('.mpd')) finalType = 'dash';

    if (finalType === 'hls' && Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 3,
        maxBufferLength: settings.bufferSize,
        maxMaxBufferLength: settings.bufferSize * 2,
        backBufferLength: 30,
        abrEwmaDefaultEstimate: 500000,
        startLevel: -1, // Auto
        enableWorker: settings.useWebWorker,
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        updateHealth({ status: 'live' });
        reconnectAttemptsRef.current = 0;
        video.play().catch(console.error);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = hls.levels[data.level];
        if (level) {
          updateHealth({
            currentResolution: `${level.height}p`,
            currentBitrate: level.bitrate / 1000,
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          handleFatalError();
        } else {
          updateHealth({ packetLoss: (Math.random() * 5) }); // Simulated packet loss for UI
        }
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        const bufferInfo = hls.mainForwardBufferInfo;
        updateHealth({ bufferLength: bufferInfo ? bufferInfo.len : 0 });
      });

    } else if (finalType === 'dash') {
      shaka.polyfill.installAll();
      if (shaka.Player.isBrowserSupported()) {
        const player = new shaka.Player(video);
        shakaRef.current = player;

        player.configure({
          streaming: {
            lowLatencyMode: true,
            bufferingGoal: settings.bufferSize,
            rebufferingGoal: 2,
            bufferBehind: 30,
          },
          abr: {
            enabled: true,
          },
        });
        player.addEventListener('error', (event: Event) => {
          const fakeEvent = event as unknown as { detail: { severity: number } };
          const detail = fakeEvent.detail;
          if (detail && detail.severity === shaka.util.Error.Severity.CRITICAL) {
            handleFatalError();
          }
        });

        player.addEventListener('variantchanged', () => {
          const variant = player.getVariantTracks().find(t => t.active);
          if (variant) {
            updateHealth({
              currentResolution: `${variant.height}p`,
              currentBitrate: variant.bandwidth / 1000,
            });
          }
        });

        try {
          await player.load(url);
          updateHealth({ status: 'live' });
          reconnectAttemptsRef.current = 0;
        } catch (_err) {
          console.error(`Error loading DASH stream: ${url}`, _err);
          handleFatalError();
        }
      }
    } else {
      // Direct MP4/WebM
      video.src = url;
      video.load();
      video.onloadeddata = () => {
        updateHealth({ status: 'live', currentResolution: `${video.videoHeight}p` });
        reconnectAttemptsRef.current = 0;
        video.play().catch(console.error);
      };
      video.onerror = () => handleFatalError();
    }
  }, [stream, settings, updateHealth, handleFatalError]);

  useEffect(() => {
    initPlayerRef.current = initPlayer;
  }, [initPlayer]);


  useEffect(() => {
    if (!stream.isVisible) {
      if (hlsRef.current) hlsRef.current.stopLoad();
      if (shakaRef.current) videoRef.current?.pause();
      return;
    }

    if (hlsRef.current) {
      hlsRef.current.startLoad();
    } else if (shakaRef.current) {
      videoRef.current?.play().catch(() => {});
    } else {
      initPlayer();
    }

    return () => {
      if (!stream.isVisible && hlsRef.current) hlsRef.current.stopLoad();
    };
  }, [stream.isVisible, initPlayer, stream.url]);

  useEffect(() => {
    initPlayer();
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (shakaRef.current) shakaRef.current.destroy();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [initPlayer]);

  // Handle setting updates and ABR throttling
  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.config.maxBufferLength = settings.bufferSize;

      // Throttle HLS: limit max level based on quality cap
      const hls = hlsRef.current;
      if (qualityCap < 1.0 && hls.levels.length > 0) {
        const levels = hls.levels.length;
        const maxLevel = Math.max(0, Math.floor(levels * qualityCap) - 1);
        hls.autoLevelCapping = maxLevel;
      } else {
        hls.autoLevelCapping = -1;
      }
    }
    if (shakaRef.current) {
      const shakaPlayer = shakaRef.current;
      shakaPlayer.configure({
        streaming: { bufferingGoal: settings.bufferSize },
      });

      // Throttle Shaka: Adjust ABR restrictions
      if (qualityCap < 1.0) {
        shakaPlayer.configure({
          abr: { enabled: false }
        });
        const tracks = shakaPlayer.getVariantTracks();
        const sorted = tracks.sort((a, b) => (a.bandwidth || 0) - (b.bandwidth || 0));
        const index = Math.max(0, Math.floor(sorted.length * qualityCap) - 1);
        shakaPlayer.selectVariantTrack(sorted[index] || sorted[0], true);
      } else {
        shakaPlayer.configure({ abr: { enabled: true } });
      }
    }
  }, [settings.bufferSize, qualityCap]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeVolume = (val: number) => {
    if (videoRef.current) {
      videoRef.current.volume = val;
      setVolume(val);
    }
  };

  const takeScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `screenshot-${stream.name}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const startRecording = () => {
    if (!videoRef.current) return;
    const v = videoRef.current as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
    const streamObj = v.captureStream ?
                      v.captureStream() :
                      v.mozCaptureStream ?
                      v.mozCaptureStream() : null;

    if (!streamObj) {
      console.error('Recording not supported by browser');
      return;
    }

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamObj, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const clipUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = clipUrl;
      link.download = `clip-${stream.name}-${Date.now()}.webm`;
      link.click();
      setIsRecording(false);
    };

    mediaRecorder.start();
    setIsRecording(true);

    // Stop after 30 seconds
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, 30000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return {
    videoRef,
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    toggleMute,
    changeVolume,
    takeScreenshot,
    startRecording,
    stopRecording,
    isRecording,
  };
};
