
import React, { useEffect, useRef } from 'react';
import type { YT } from '../types';

interface YouTubePlayerProps {
  videoId: string;
  onPlayerReady: (player: YT.Player) => void;
  onStateChange: (state: YT.PlayerState) => void;
}

const PLAYER_CONTAINER_ID = 'youtube-player-container';

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, onPlayerReady, onStateChange }) => {
  const playerRef = useRef<YT.Player | null>(null);

  useEffect(() => {
    const setupPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player(PLAYER_CONTAINER_ID, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1, // Helps minimize YouTube branding and overlays
          },
          events: {
            onReady: (event) => {
              onPlayerReady(event.target);
            },
            onStateChange: (event) => {
              onStateChange(event.data);
            },
          },
        });
      }
    };
    
    if (!window.YT) {
      // If YT API is not loaded, load it
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = () => {
        setupPlayer();
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      setupPlayer();
    }

    return () => {
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700">
      <div id={PLAYER_CONTAINER_ID} className="w-full h-full"></div>
    </div>
  );
};

export default YouTubePlayer;