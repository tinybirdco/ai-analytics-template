// src/app/hooks/useKeyboardShortcut.ts
'use client';

import { useEffect } from 'react';

export function useKeyboardShortcut(key: string, callback: () => void, metaKey = false) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() && 
        (!metaKey || (metaKey && (event.metaKey || event.ctrlKey)))
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, metaKey]);
}