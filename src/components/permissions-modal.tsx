'use client';

import { useEffect, useState } from 'react';

export default function PermissionRequestModal() {
  const [show, setShow] = useState(false);

  // Lista de permissões verificáveis
  const permissionKeys: Array<PermissionName> = [
    'geolocation',
    'camera',
    'microphone',
    'notifications',
  ];

  const checkPermissions = async () => {
    let allGranted = true;

    for (const key of permissionKeys) {
      if (!navigator.permissions) continue;

      try {
        const result = await navigator.permissions.query({ name: key } as any);
        if (result.state !== 'granted') {
          allGranted = false;
        }
      } catch {
        // Ignora se o navegador não suportar a permissão específica
      }
    }

    return allGranted;
  };

  useEffect(() => {
    const checkAndSet = async () => {
      const alreadyVerified = localStorage.getItem('permissions-verified');
      if (alreadyVerified === 'true') return;

      const granted = await checkPermissions();
      if (granted) {
        localStorage.setItem('permissions-verified', 'true');
        setShow(false);
      } else {
        setShow(true);
      }
    };

    checkAndSet();
  }, []);

  const requestPermissions = async () => {
    try {
      // Notificações
      if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }

      // Geolocalização
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {},
          () => {},
        );
      }

      // Câmera e Microfone
      if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch {}
      }

      // Clipboard
      if ('clipboard' in navigator) {
        try {
          await navigator.clipboard.readText();
        } catch {}
      }

      // Autoplay
      try {
        const audio = new Audio('/sounds/unlock.mp3');
        audio.volume = 1;
        await audio.play();
      } catch {}

      // Marca como verificado
      localStorage.setItem('permissions-verified', 'true');
      setShow(false);
    } catch (err) {
      console.error('Erro ao solicitar permissões:', err);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-black border border-green-600 text-white shadow-xl p-6 max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Permissões Necessárias</h2>
        <p className="text-sm text-zinc-300 dark:text-zinc-300">
          Para melhor funcionamento do terminal, conceda as permissões
          solicitadas (áudio, câmera, clipboard, localização, notificações e
          autoplay).
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={requestPermissions}
            className="bg-green-600 hover:bg-greens-700 text-white font-semibold px-4 py-2 transition"
          >
            Aceito as permissões
          </button>
          <span className="text-xs font-light uppercase text-zinc-500">
            ME USE!
          </span>
        </div>
      </div>
    </div>
  );
}
