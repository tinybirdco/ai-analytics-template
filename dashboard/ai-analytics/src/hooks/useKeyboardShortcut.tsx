// src/app/hooks/useKeyboardShortcut.ts
'use client';

import { useEffect } from 'react';

export function useKeyboardShortcut(key: string, callback: () => void, useCtrlKey = false) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the user is typing in an input field or textarea
      const isTyping = 
        document.activeElement instanceof HTMLInputElement || 
        document.activeElement instanceof HTMLTextAreaElement;
      
      // Only trigger shortcut if not typing in an input field
      if (!isTyping && event.key.toLowerCase() === key.toLowerCase()) {
        // If useCtrlKey is true, require Ctrl/Cmd key to be pressed
        if (useCtrlKey && !(event.ctrlKey || event.metaKey)) {
          return;
        }
        
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, useCtrlKey]);
}