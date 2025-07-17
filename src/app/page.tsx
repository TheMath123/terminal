'use client';

import PermissionRequestModal from '@/components/permissions-modal';
import Terminal from './terminal';
import { useEffect } from 'react';

export default function Page() {
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

  return (
    <>
      <Terminal />
      <PermissionRequestModal />
    </>
  );
}
