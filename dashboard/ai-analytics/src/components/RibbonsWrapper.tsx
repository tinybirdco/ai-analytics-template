'use client';

import { useState, useEffect } from 'react';
import Ribbons from '@/components/ui/ribbons';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

export default function RibbonsWrapper() {
  const [isVisible, setIsVisible] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState(0);

  // Handle Konami code
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const expectedKey = KONAMI_CODE[konamiProgress].toLowerCase();
      
      if (key === expectedKey) {
        const newProgress = konamiProgress + 1;
        setKonamiProgress(newProgress);
        
        if (newProgress === KONAMI_CODE.length) {
          setIsVisible(true);
          setKonamiProgress(0);
        }
      } else {
        setKonamiProgress(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress]);

  if (!isVisible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <Ribbons
        baseThickness={30}
        colors={['#ffffff', '#27F795']}
        speedMultiplier={0.5}
        maxAge={500}
        enableFade={true}
        enableShaderEffect={true}
      />
    </div>
  );
} 