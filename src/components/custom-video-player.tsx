'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface CustomVideoPlayerProps {
  src: string;
  className?: string;
}

export function CustomVideoPlayer({
  src,
  className = '',
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    // Set initial volume
    video.volume = volume;

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [volume]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || isLoading) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(console.error);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration || isLoading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    // Pause before seeking to prevent bugs
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      video.pause();
      setIsPlaying(false);
    }

    video.currentTime = newTime;
    setCurrentTime(newTime);

    // Resume playing if it was playing before
    if (wasPlaying) {
      setTimeout(() => {
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(console.error);
      }, 100);
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width));

    setVolume(newVolume);
    setIsMuted(false);

    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
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
      {/* Header */}
      <div className="px-3 py-1 border-b border-green-500 bg-green-900/20">
        <div className="flex items-center justify-between">
          <span className="text-xs">📺 VIDEO PLAYER</span>
          <span className="text-xs opacity-70">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={src}
          preload="metadata"
          className="w-full max-h-60 bg-black"
          onClick={togglePlay}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && !isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
            onClick={() => togglePlay()}
          >
            <div className="text-4xl text-green-400 opacity-80">▶</div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-green-400 animate-pulse">Loading...</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 space-y-2">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div
            className="h-2 bg-gray-800 border border-green-600 cursor-pointer relative overflow-hidden w-full"
            onClick={handleProgressClick}
            aria-label="Seek video"
            tabIndex={0}
            role="button"
          >
            <div
              className="h-full bg-green-500 transition-all duration-100"
              style={{ width: `${getProgressPercentage()}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50 pointer-events-none select-none">
              {'█'.repeat(Math.floor(getProgressPercentage() / 5))}
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
              className="px-2 py-1 border border-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : isPlaying ? '⏸' : '▶'}
            </button>

            <span className="text-xs opacity-70">
              {isLoading ? 'Loading...' : isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Volume Control */}
            <button
              type="button"
              onClick={toggleMute}
              className="text-xs hover:text-green-300 transition-colors"
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

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-xs hover:text-green-300 transition-colors px-1"
            >
              ⛶
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="text-xs opacity-50 truncate">📁 {filePath}</div>
      </div>
    </div>
  );
}
