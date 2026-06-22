import { useState, useCallback } from 'react';

/**
 * Hook for managing undo/redo functionality
 * Maintains history stack of states with ability to rewind/forward
 */
export const useUndoRedo = (initialState = null) => {
  const [history, setHistory] = useState(initialState ? [initialState] : []);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex] ?? initialState;

  const setState = useCallback((newState) => {
    setHistory((prev) => {
      // Remove any forward history when new state is added
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(typeof newState === 'function' ? newState(state) : newState);
      return newHistory;
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, state]);

  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const reset = useCallback((newState = initialState) => {
    setHistory(newState ? [newState] : []);
    setCurrentIndex(0);
  }, [initialState]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    state,
    setState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    history: history.slice(0, currentIndex + 1),
  };
};
