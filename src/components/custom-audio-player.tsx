'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface CustomAudioPlayerProps {
  src: string;
  className?: string;
}

export function CustomAudioPlayer({
  src,
  className = '',
}: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      const dur = audio.duration;
      if (isFinite(dur) && dur > 0) {
        setDuration(dur);
        setIsLoading(false);
      }
    };

    // Polling para verificar a duração em casos onde eventos não disparam
    const checkDuration = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        setIsLoading(false);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setDuration(0); // Reseta a duração ao carregar novo áudio
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Adiciona múltiplos eventos para capturar a duração
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('canplay', updateDuration);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('ended', handleEnded);

    // Inicia polling para duração
    const durationInterval = setInterval(checkDuration, 500);

    audio.volume = isMuted ? 0 : volume;

    return () => {
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('canplay', updateDuration);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('ended', handleEnded);
      clearInterval(durationInterval);
    };
  }, [isMuted, volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error('Erro ao reproduzir áudio:', error);
          setIsLoading(false);
        });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration || isLoading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width));

    setVolume(newVolume);
    setIsMuted(false);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsMuted((prev) => {
      audio.volume = prev ? volume : 0;
      return !prev;
    });
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '00:00';

    const totalSeconds = Math.floor(time);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    return hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };

  const getProgressPercentage = () => {
    if (!duration || !isFinite(duration)) return 0;
    return Math.min((currentTime / duration) * 100, 100);
  };

  const getVolumePercentage = () => {
    return isMuted ? 0 : volume * 100;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  const filePath =
    decodeURI(src).split('&').pop()?.split('%2F').pop() || 'audio.mp3';

  return (
    <div
      className={`mt-2 bg-black border border-green-500 rounded font-mono text-green-400 text-sm max-w-[500px] w-full ${className}`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header */}
      <div className="px-3 py-1 border-b border-green-500 bg-green-900/20">
        <div className="flex items-center justify-between">
          <span className="text-xs">♪ AUDIO PLAYER</span>
          <span className="text-xs opacity-70">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="p-3 space-y-2">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div
            className="h-2 bg-gray-800 border border-green-600 cursor-pointer relative overflow-hidden w-full"
            onClick={handleProgressClick}
            aria-label="Seek audio"
            tabIndex={0}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
          >
            <div
              className="h-full bg-green-500 transition-all duration-100"
              style={{ width: `${getProgressPercentage()}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50 pointer-events-none select-none">
              {'█'.repeat(Math.floor(getProgressPercentage() / 5))}
              {'░'.repeat(20 - Math.floor(getProgressPercentage() / 5))}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-7 h-7 border border-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : isPlaying ? '⏸' : '▶'}
            </button>

            <span className="text-xs opacity-70">
              {isLoading ? 'Loading...' : isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleMute}
              className="text-xs hover:text-green-300 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {getVolumeIcon()}
            </button>

            <div
              className="w-16 h-2 bg-gray-800 border border-green-600 cursor-pointer relative"
              onClick={handleVolumeClick}
              role="slider"
              tabIndex={0}
              aria-valuenow={Math.round(getVolumePercentage())}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Adjust volume"
            >
              <div
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${getVolumePercentage()}%` }}
              />
            </div>

            <span className="text-xs w-8 text-right">
              {Math.round(getVolumePercentage())}%
            </span>
          </div>
        </div>

        {/* File Info */}
        <div className="text-xs opacity-50 truncate">📁 {filePath}</div>
      </div>
    </div>
  );
}
