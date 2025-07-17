'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [glitchText, setGlitchText] = useState('ACESSO NEGADO');

  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
  const originalText = 'ACESSO NEGADO';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloqueia F12
      if (e.key === 'F12') e.preventDefault();

      // Bloqueia Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')
        e.preventDefault();

      // Bloqueia Ctrl+U (view source)
      if (e.ctrlKey && e.key.toLowerCase() === 'u') e.preventDefault();

      // Bloqueia Ctrl+F (buscar)
      if (e.ctrlKey && e.key.toLowerCase() === 'f') e.preventDefault();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Desativa clique direito
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const checkDevTools = () => {
      const threshold = 160; // altura típica do devtools
      const devtoolsOpen = window.outerHeight - window.innerHeight > threshold;
      if (devtoolsOpen) {
        alert('DevTools detectado. Essa ação não é permitida.');
        window.location.reload(); // ou redireciona
      }
    };

    const interval = setInterval(checkDevTools, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Tentar tocar o áudio no carregamento
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Se o navegador bloquear autoplay, aguardar interação
          const unlockAudio = () => {
            audioRef.current?.play();
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
          };
          document.addEventListener('click', unlockAudio);
          document.addEventListener('keydown', unlockAudio);
        });
      }
    }

    // Redireciona após 10 segundos
    const redirectTimeout = setTimeout(() => {
      router.replace('/');
    }, 10000);

    // Glitch text effect
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const glitched = originalText
          .split('')
          .map((char) =>
            Math.random() < 0.2
              ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
              : char,
          )
          .join('');
        setGlitchText(glitched);
        setTimeout(() => setGlitchText(originalText), 100);
      }
    }, 200);

    return () => {
      clearTimeout(redirectTimeout);
      clearInterval(glitchInterval);
      audioRef.current?.pause();
      audioRef.current?.removeAttribute('src');
      audioRef.current?.load();
    };
  }, [router]);
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* 🔊 Audio player */}
      <audio
        ref={audioRef}
        src="/audios/alarm.wav"
        autoPlay
        loop
        className="hidden"
      />

      {/* Matrix rain effect */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-500 text-xs font-mono animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          >
            {Math.random().toString(36).substring(7)}
          </div>
        ))}
      </div>

      {/* Glitch overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent animate-bounce" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-8">
        {/* Evil blinking face */}
        <div className="text-8xl mb-8 select-none">
          <span
            className="inline-block animate-pulse"
            style={{ animationDuration: '0.5s' }}
          >
            😈
          </span>
        </div>

        {/* Glitch title */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 text-center relative">
          <span className="absolute inset-0 text-red-500 animate-ping opacity-75 blur-sm">
            {glitchText}
          </span>
          <span className="absolute inset-0 text-blue-500 animate-pulse opacity-50 blur-sm">
            {glitchText}
          </span>
          <span className="relative z-10 glitch-text">{glitchText}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl mb-8 text-center text-red-400 animate-pulse">
          VOCÊ NÃO PODE ACESSAR ESSA PÁGINA
        </p>

        {/* Error code */}
        <div className="text-center mb-8">
          <div className="text-4xl font-mono text-blue-400 mb-2 animate-bounce">
            ERROR 403
          </div>
          <div className="text-sm text-gray-400 font-mono">
            UNAUTHORIZED_ACCESS_DETECTED
          </div>
        </div>

        {/* Hacker-style message */}
        <div className="max-w-2xl text-center font-mono text-sm text-green-400 leading-relaxed animate-pulse">
          <p className="mb-4">{'> SISTEMA DE SEGURANÇA ATIVADO'}</p>
          <p className="mb-4">{'> RASTREANDO LOCALIZAÇÃO...'}</p>
          <p className="mb-4">{'> IP: 192.168.1.1 BLOQUEADO'}</p>
          <p className="text-red-400">
            {'> ACESSO NEGADO - SAINDO EM 10 SEGUNDOS...'}
          </p>
        </div>

        {/* Glitch bars */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-ping" />
        <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 animate-ping" />
      </div>

      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="w-full h-full opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)',
            animation: 'scanlines 0.1s linear infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        
        .glitch-text {
          animation: glitch 0.3s infinite;
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  );
}
