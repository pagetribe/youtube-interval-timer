// Manually declare the YouTube Iframe API types as they are loaded from a script
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: typeof YT;
  }
}

export interface Preset {
  url: string;
  videoId: string;
  triggerTimestamp: number;
  duration?: number;
  cooldownDuration?: number;
  intervals?: number[];
  title?: string;
}


export namespace YT {
  export enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  export interface PlayerOptions {
    height?: string;
    width?: string;
    videoId?: string;
    playerVars?: PlayerVars;
    events?: Events;
  }

  export interface PlayerVars {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
    [key: string]: any;
  }

  export interface Events {
    onReady?: (event: { target: Player }) => void;
    onStateChange?: (event: { data: PlayerState; target: Player }) => void;
    [key: string]: ((event: any) => void) | undefined;
  }

  // Describes the YT.Player instance
  export interface Player {
    playVideo: () => void;
    pauseVideo: () => void;
    stopVideo: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => PlayerState;
    destroy: () => void;
    getIframe: () => HTMLIFrameElement;
  }

  // Describes the YT.Player constructor, which is a value on the YT object
  export declare const Player: {
    new (elementId: string, options: PlayerOptions): Player;
  };
}