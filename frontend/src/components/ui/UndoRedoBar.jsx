import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import Button from './Button';

const UndoRedoBar = ({ canUndo, canRedo, onUndo, onRedo, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        size="sm"
        variant="outline"
        onClick={onUndo}
        disabled={!canUndo}
        icon={Undo2}
        title="Undo (Ctrl+Z)"
      >
        Undo
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onRedo}
        disabled={!canRedo}
        icon={Redo2}
        title="Redo (Ctrl+Y)"
      >
        Redo
      </Button>
    </div>
  );
};

export default UndoRedoBar;
