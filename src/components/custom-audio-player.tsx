'use client'

import { useEffect, useRef, useState } from 'react'

interface CustomAudioPlayerProps {
  src: string
}

export function CustomAudioPlayer({ src }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    audio.addEventListener('timeupdate', updateProgress)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="w-full bg-black border border-gray-600 rounded px-4 py-2 font-mono text-white">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="px-2 py-1 border border-gray-500 rounded hover:bg-gray-700 transition"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-green-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
