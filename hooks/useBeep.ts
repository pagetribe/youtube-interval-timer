import { useCallback, useRef } from 'react';

export const useBeep = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
        }
      } catch (e) {
        console.error("Web Audio API is not supported in this browser", e);
      }
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((context: AudioContext, frequency: number, duration: number, type: OscillatorType) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration / 1000);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  }, []);

  const playBeeps = useCallback(async (count: number, frequency = 880, duration = 150, interval = 250, type: OscillatorType = 'sine') => {
    const audioContext = getAudioContext();
    if (!audioContext) return;
    
    // Resume audio context if it's suspended (required by modern browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    for (let i = 0; i < count; i++) {
      playBeep(audioContext, frequency, duration, type);
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }, [getAudioContext, playBeep]);

  return { playBeeps };
};
