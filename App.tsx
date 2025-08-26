import React, { useState, useRef, useCallback, useEffect } from 'react';
import YouTubePlayer from './components/YouTubePlayer';
import Timer from './components/Timer';
import PresetManager from './components/PresetManager';
import { extractYouTubeID } from './services/youtubeService';
import { parseTimeToSeconds } from './services/timeService';
import { YT, Preset } from './types';

const NUM_PRESETS = 3;

const App: React.FC = () => {
  const [activeConfig, setActiveConfig] = useState<Preset | null>(null);
  const [presets, setPresets] = useState<(Preset | null)[]>(new Array(NUM_PRESETS).fill(null));
  
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  
  const playerRef = useRef<YT.Player | null>(null);
  const timeUpdateIntervalRef = useRef<number | null>(null);

  // Effect to load presets from the JSON file on startup
  useEffect(() => {
    const fetchVideoTitle = async (videoUrl: string): Promise<string | null> => {
        try {
          const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
          if (!response.ok) return null;
          const data = await response.json();
          if (data.error) {
            console.error(`Error from oEmbed for ${videoUrl}:`, data.error);
            return null;
          }
          return data.title || null;
        } catch (error) {
          console.error('Error fetching video title:', error);
          return null;
        }
      };

    fetch('/presets.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(async (data: (any | null)[]) => {
        if (!Array.isArray(data) || data.length > NUM_PRESETS) {
          throw new Error(`presets.json must be an array with up to ${NUM_PRESETS} presets.`);
        }

        const processedPresets = data.map(p => {
          if (!p) return null;

          // Common validation
          if (!p.url || p.triggerTimestamp === undefined) {
            console.error("Invalid preset object in presets.json (missing url or triggerTimestamp):", p);
            return null;
          }

          const videoId = extractYouTubeID(p.url);
          if (!videoId) {
            console.error("Could not extract video ID from URL in preset:", p.url);
            return null;
          }

          const triggerTimestamp = parseTimeToSeconds(String(p.triggerTimestamp));
          if (triggerTimestamp === null) {
            console.error("Invalid triggerTimestamp format in preset object:", p);
            return null;
          }

          // Check for interval-based or duration-based preset
          if (p.intervals && Array.isArray(p.intervals) && p.intervals.every((i: any) => typeof i === 'number' && i > 0)) {
            return {
              url: p.url,
              videoId: videoId,
              triggerTimestamp: triggerTimestamp,
              intervals: p.intervals,
            } as Preset;
          } else if (p.duration !== undefined && p.cooldownDuration !== undefined) {
            const duration = parseTimeToSeconds(String(p.duration));
            const cooldownDuration = parseTimeToSeconds(String(p.cooldownDuration));

            if (duration === null || cooldownDuration === null || duration <= 0 || cooldownDuration < 0) {
              console.error("Invalid time format for duration/cooldown in preset object:", p);
              return null;
            }

            return {
              url: p.url,
              videoId: videoId,
              triggerTimestamp: triggerTimestamp,
              duration: duration,
              cooldownDuration: cooldownDuration,
            } as Preset;
          } else {
            console.error("Invalid preset object: must contain either 'intervals' array or 'duration' and 'cooldownDuration'.", p);
            return null;
          }
        });

        const presetsWithTitlesPromises = processedPresets.map(async (p) => {
            if (!p) return null;
            const title = await fetchVideoTitle(p.url);
            return { ...p, title: title || 'YouTube Video' };
        });

        let presetsWithTitles = await Promise.all(presetsWithTitlesPromises);
        
        // Pad the array with nulls if presets.json has fewer than NUM_PRESETS
        while(presetsWithTitles.length < NUM_PRESETS) {
            presetsWithTitles.push(null);
        }

        setPresets(presetsWithTitles);
      })
      .catch(err => {
        console.error("Error fetching or parsing presets.json:", err);
        setError("Could not load presets from presets.json.");
      });
  }, []);


  const cleanupTimeCheck = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };
  
  const handlePlayerReady = useCallback((player: YT.Player) => {
    playerRef.current = player;
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!playerRef.current) return;
    const newTime = playerRef.current.getCurrentTime();
    setCurrentTime(newTime);
  }, []);

  const handlePlayerStateChange = useCallback((state: YT.PlayerState) => {
    cleanupTimeCheck();
    if (state === YT.PlayerState.PLAYING) {
      timeUpdateIntervalRef.current = window.setInterval(handleTimeUpdate, 100); 
    } else {
      handleTimeUpdate();
    }
  }, [handleTimeUpdate]);

  useEffect(() => {
    if (!activeConfig || !playerRef.current) {
      setIsTimerVisible(false);
      return;
    };
    
    const playerState = playerRef.current.getPlayerState();
    if (currentTime >= activeConfig.triggerTimestamp && playerState !== YT.PlayerState.ENDED) {
        setIsTimerVisible(true);
    } else {
        setIsTimerVisible(false);
    }
  }, [currentTime, activeConfig]);

  useEffect(() => {
    return () => cleanupTimeCheck();
  }, []);

  const resetApp = () => {
    cleanupTimeCheck();
    setActiveConfig(null);
    setError(null);
    setCurrentTime(0);
    setIsTimerVisible(false);
    playerRef.current?.destroy();
    playerRef.current = null;
  };
  
  const handleLoadPreset = (slotIndex: number) => {
    const preset = presets[slotIndex];
    if (preset) {
        resetApp();
        setActiveConfig(preset);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-8">
        {activeConfig && (
          <div className="w-full relative">
            <YouTubePlayer
              videoId={activeConfig.videoId}
              onPlayerReady={handlePlayerReady}
              onStateChange={handlePlayerStateChange}
            />
            {isTimerVisible && (
              <Timer 
                duration={activeConfig.duration} 
                cooldownDuration={activeConfig.cooldownDuration}
                intervals={activeConfig.intervals}
                triggerTimestamp={activeConfig.triggerTimestamp}
                currentTime={currentTime} 
              />
            )}
          </div>
        )}

        <PresetManager 
          presets={presets}
          onLoad={handleLoadPreset}
        />
        
        {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;