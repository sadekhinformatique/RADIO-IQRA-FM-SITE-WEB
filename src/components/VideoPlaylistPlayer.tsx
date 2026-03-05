import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Video, Play, Pause, SkipForward, Volume2, VolumeX, Loader2 } from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { usePlayer } from '../context/PlayerContext';

export const VideoPlaylistPlayer = () => {
  const { config } = usePlayer();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);

  const playlist = config?.video_playlist || [];

  useEffect(() => {
    if (videoRef.current && playlist.length > 0) {
      const url = playlist[currentIndex].url;
      const video = videoRef.current;

      if (!playerRef.current) {
        const player = videojs(video, {
          autoplay: isPlaying,
          muted: isMuted,
          controls: false,
          responsive: true,
          fluid: true,
          sources: [{
            src: url,
            type: url.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
          }]
        });

        player.on('ended', handleEnded);
        player.on('play', () => setIsPlaying(true));
        player.on('pause', () => setIsPlaying(false));
        player.on('error', () => {
          console.error('Video.js error, skipping to next');
          handleEnded();
        });

        playerRef.current = player;
      } else {
        const player = playerRef.current;
        player.src({
          src: url,
          type: url.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
        });
        if (isPlaying) {
          player.play().catch(console.error);
        }
      }
    }
  }, [currentIndex, playlist]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.muted(isMuted);
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadVideoM3U = (url: string, title: string) => {
    const content = `#EXTM3U\n#EXTINF:-1,${title}\n${url}`;
    const blob = new Blob([content], { type: 'audio/x-mpegurl' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, '_')}.m3u`;
    link.click();
  };

  if (playlist.length === 0) return null;

  return (
    <section className="py-24 bg-stone-900 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#065f46,transparent)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-2/3 w-full">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-islamic-green/20 text-islamic-green border border-islamic-green/30 mb-4">
                <Video size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">RADIO IQRA TV - Playlist</span>
              </div>
              <h2 className="text-4xl font-serif font-bold mb-4">Visionnez nos programmes</h2>
              <p className="text-stone-400">Une sélection de nos meilleures vidéos, diffusée en continu pour votre édification.</p>
            </div>

            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <div data-vjs-player className="w-full h-full">
                <video
                  ref={videoRef}
                  className="video-js vjs-big-play-centered w-full h-full"
                  playsInline
                />
              </div>
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-islamic-green transition-colors">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    <button onClick={handleEnded} className="text-white hover:text-islamic-green transition-colors">
                      <SkipForward size={24} fill="currentColor" />
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-islamic-green transition-colors">
                      {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                    <button 
                      onClick={() => downloadVideoM3U(playlist[currentIndex].url, playlist[currentIndex].title)} 
                      title="Ouvrir dans VLC"
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[10px] font-bold text-white uppercase tracking-widest"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/VLC_Icon.svg" alt="VLC" className="w-4 h-4" />
                      VLC
                    </button>
                  </div>
                  <div className="text-sm font-medium text-white/80">
                    {playlist[currentIndex].title}
                  </div>
                </div>
              </div>

              {!isPlaying && (
                <button 
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all"
                >
                  <div className="w-20 h-20 bg-islamic-green text-white rounded-full flex items-center justify-center shadow-xl scale-110">
                    <Play size={32} fill="currentColor" className="ml-1" />
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="lg:w-1/3 w-full">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[450px] flex flex-col">
              <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                <Video className="text-islamic-green" size={20} />
                À Suivre
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {playlist.map((video, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left ${
                      currentIndex === idx 
                        ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20' 
                        : 'hover:bg-white/10 text-stone-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      currentIndex === idx ? 'bg-white/20' : 'bg-white/5'
                    }`}>
                      {currentIndex === idx && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-3">
                          <div className="w-0.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite]" />
                          <div className="w-0.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" />
                          <div className="w-0.5 bg-white animate-[music-bar_0.4s_ease-in-out_infinite]" />
                        </div>
                      ) : (
                        <Play size={16} fill="currentColor" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{video.title}</p>
                      <p className={`text-[10px] uppercase tracking-widest ${currentIndex === idx ? 'text-white/60' : 'text-stone-500'}`}>Vidéo {idx + 1}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
