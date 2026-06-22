import { useEffect } from 'react';

/**
 * Hook for managing keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        shortcuts.undo?.();
      }

      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        shortcuts.redo?.();
      }

      // Ctrl+Y or Cmd+Y for redo (alternative)
      if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        event.preventDefault();
        shortcuts.redo?.();
      }

      // Ctrl+S or Cmd+S for save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        shortcuts.save?.();
      }

      // Escape to close/clear
      if (event.key === 'Escape') {
        shortcuts.escape?.();
      }

      // Ctrl+A or Cmd+A for select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        if (shortcuts.selectAll) {
          event.preventDefault();
          shortcuts.selectAll?.();
        }
      }

      // Ctrl+D or Cmd+D for delete
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        if (shortcuts.delete) {
          event.preventDefault();
          shortcuts.delete?.();
        }
      }

      // Ctrl+K for search/command palette
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        shortcuts.search?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
