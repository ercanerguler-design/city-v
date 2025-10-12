'use client';

import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Guard clause: event.key undefined olabilir
      if (!event.key) return;

      shortcuts.forEach(({ key, ctrlKey, shiftKey, metaKey, callback }) => {
        const isCtrlMatch = ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const isShiftMatch = shiftKey ? event.shiftKey : !event.shiftKey;
        const isMetaMatch = metaKey ? event.metaKey : true;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          isCtrlMatch &&
          isShiftMatch &&
          isMetaMatch
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Keyboard shortcuts helper component
export function KeyboardShortcutsInfo() {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 max-w-sm">
      <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        ⌨️ Klavye Kısayolları
      </h4>
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center justify-between">
          <span>Arama</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded font-mono text-xs">
            Ctrl + K
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span>Filtreler</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded font-mono text-xs">
            Ctrl + F
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span>Kapat</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded font-mono text-xs">
            ESC
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded font-mono text-xs">
            Ctrl + D
          </kbd>
        </div>
      </div>
    </div>
  );
}
