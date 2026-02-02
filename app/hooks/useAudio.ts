import { useRef, useEffect, useState, useCallback } from 'react';

type SoundName = 'hit' | 'kill' | 'dead' | 'levelUp';

export const useAudio = () => {
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const soundsRef = useRef<Record<SoundName, HTMLAudioElement | null>>({
    hit: null,
    kill: null,
    dead: null,
    levelUp: null
  });

  useEffect(() => {
    // Initialize Audio
    bgmRef.current = new Audio('/mega.mp3');
    bgmRef.current.loop = true;

    soundsRef.current.hit = new Audio('/hit.wav');
    soundsRef.current.kill = new Audio('/kill.wav');
    soundsRef.current.dead = new Audio('/dead.wav');
    soundsRef.current.levelUp = new Audio('/kill.wav'); // Placeholder reuse

    return () => {
      bgmRef.current?.pause();
      bgmRef.current = null;
      soundsRef.current = { hit: null, kill: null, dead: null, levelUp: null };
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
        bgmRef.current.volume = isMuted ? 0 : volume;
    }
    Object.values(soundsRef.current).forEach(sound => {
        if (sound) sound.volume = isMuted ? 0 : volume;
    });
  }, [volume, isMuted]);

  const playBgm = useCallback(() => {
    bgmRef.current?.play().catch(e => console.log("Audio play failed (autoplay policy):", e));
  }, []);

  const pauseBgm = useCallback(() => {
    bgmRef.current?.pause();
  }, []);

  const playSound = useCallback((name: SoundName) => {
    const sound = soundsRef.current[name];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play failed:", e));
    }
  }, []);

  return {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playBgm,
    pauseBgm,
    playSound
  };
};
