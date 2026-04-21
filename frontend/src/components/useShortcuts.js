// src/hooks/useShortcuts.js

import { useEffect } from 'react';

export function useShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (shortcuts[e.key]) {
        shortcuts[e.key](e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}