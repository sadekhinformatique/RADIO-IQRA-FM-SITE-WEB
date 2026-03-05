/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import shaka from 'shaka-player';
import { supabase, RadioConfig } from '../lib/supabase';

interface PlayerContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  toggleMute: () => void;
  currentTrack: string;
  config: RadioConfig | null;
  downloadM3U: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const DEFAULT_STREAM_URL = "https://radioiqrabf-1.ice.infomaniak.ch/radioiqrabf-96.mp3";
export const DEFAULT_FALLBACK_URL = "https://radioiqrabf-1.ice.infomaniak.ch/radioiqrabf-128.mp3";

// Install polyfills for Shaka once
shaka.polyfill.installAll();

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [config, setConfig] = useState<RadioConfig | null>(null);
  const [currentSourceType, setCurrentSourceType] = useState<'primary' | 'fallback' | 'playlist'>('primary');
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState('RADIO IQRA FM');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shakaPlayerRef = useRef<shaka.Player | null>(null);

  // Fetch config from Supabase
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('radio_config')
          .select('*')
          .single();
        
        if (error) {
          console.warn('Radio config not found, using defaults');
          return;
        }
        if (data) setConfig(data);
      } catch (err) {
        console.error('Error fetching radio config:', err);
      }
    };
    fetchConfig();
  }, []);

  const getSourceUrl = () => {
    if (!config) return DEFAULT_STREAM_URL;
    
    if (currentSourceType === 'primary') return config.primary_stream_url || DEFAULT_STREAM_URL;
    if (currentSourceType === 'fallback') return config.fallback_stream_url || DEFAULT_FALLBACK_URL;
    
    if (currentSourceType === 'playlist' && config.audio_playlist?.length > 0) {
      const track = config.audio_playlist[playlistIndex % config.audio_playlist.length];
      return track.url;
    }
    
    return DEFAULT_STREAM_URL;
  };

  // Function to initialize or update the player source
  const updatePlayerSource = async (url: string) => {
    if (!audioRef.current || !url) return;
    
    const audio = audioRef.current;
    
    // Clean up existing Shaka instance
    if (shakaPlayerRef.current) {
      await shakaPlayerRef.current.destroy();
      shakaPlayerRef.current = null;
    }

    // Reset audio element state
    audio.pause();
    audio.removeAttribute('src');
    audio.load();

    if (url.endsWith('.m3u8') || url.includes('.mpd')) {
      if (shaka.Player.isBrowserSupported()) {
        const player = new shaka.Player(audio);
        shakaPlayerRef.current = player;

        // Listen for errors
        player.addEventListener('error', (event: any) => {
          console.error('Shaka Player Error:', event.detail);
          handleFallback();
        });

        try {
          await player.load(url);
          console.log('Shaka Player: Stream loaded successfully');
        } catch (e) {
          console.error('Shaka Player: Error loading stream', e);
          handleFallback();
        }
      } else {
        console.warn('Shaka Player: Browser not supported');
        // Fallback to native if possible
        audio.src = url;
      }
    } else {
      audio.src = url;
    }
    
    audio.load();
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Playback failed after source change:", e);
          if (e.name === 'NotSupportedError') {
            handleFallback();
          }
        });
      }
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
      
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      
      const onError = (e: any) => {
        console.error("Audio element error:", e);
        handleFallback();
      };

      const onEnded = () => {
        if (currentSourceType === 'playlist') {
          setPlaylistIndex(prev => prev + 1);
        } else {
          handleFallback();
        }
      };
      
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('error', onError);
      audio.addEventListener('ended', onEnded);

      // Initial source load
      updatePlayerSource(getSourceUrl());

      return () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('ended', onEnded);
        audio.pause();
        audio.src = "";
        if (shakaPlayerRef.current) shakaPlayerRef.current.destroy();
      };
    }
  }, [config]);

  // Handle source changes
  useEffect(() => {
    const url = getSourceUrl();
    updatePlayerSource(url);
    
    if (currentSourceType === 'playlist' && config?.audio_playlist) {
      const track = config.audio_playlist[playlistIndex % config.audio_playlist.length];
      setCurrentTrack(track?.title || 'Playlist Audio');
    } else {
      setCurrentTrack('RADIO IQRA FM - En Direct');
    }
  }, [currentSourceType, playlistIndex, config]);

  const handleFallback = () => {
    if (currentSourceType === 'primary') {
      console.log("Primary stream failed, switching to fallback");
      setCurrentSourceType('fallback');
    } else if (currentSourceType === 'fallback') {
      console.log("Fallback stream failed, switching to playlist");
      setCurrentSourceType('playlist');
      setPlaylistIndex(0);
    } else if (currentSourceType === 'playlist') {
      // If playlist fails, try next track
      setPlaylistIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Error playing stream:", e);
            handleFallback();
          });
        }
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const downloadM3U = () => {
    const url = getSourceUrl();
    const content = `#EXTM3U\n#EXTINF:-1,${currentTrack}\n${url}`;
    const blob = new Blob([content], { type: 'audio/x-mpegurl' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `radio_iqra_fm.m3u`;
    link.click();
  };

  return (
    <PlayerContext.Provider value={{ 
      isPlaying, 
      togglePlay, 
      volume, 
      setVolume, 
      isMuted, 
      setIsMuted, 
      toggleMute,
      currentTrack,
      config,
      downloadM3U
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
