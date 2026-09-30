import { useEffect } from "react";

interface ShortcutHandlers {
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDuplicate?: () => void;
  onDeselect?: () => void;

  // Selected element movement
  onMoveLeft?: (amount: number) => void;
  onMoveRight?: (amount: number) => void;
  onMoveUp?: (amount: number) => void;
  onMoveDown?: (amount: number) => void;
}

/**
 * Falcon editor keyboard shortcuts.
 *
 * Delete / Backspace  -> Delete
 * Cmd/Ctrl + Z        -> Undo
 * Cmd/Ctrl + Shift+Z -> Redo
 * Cmd/Ctrl + D        -> Duplicate
 * Escape              -> Deselect
 * Arrow keys          -> Move selected element
 * Shift + Arrow       -> Move faster
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isTypingTarget =
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable);

      if (isTypingTarget) return;

      const meta = e.metaKey || e.ctrlKey;

      // Delete
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        handlers.onDelete
      ) {
        e.preventDefault();
        handlers.onDelete();
        return;
      }

      // Redo
      if (
        meta &&
        e.key.toLowerCase() === "z" &&
        e.shiftKey &&
        handlers.onRedo
      ) {
        e.preventDefault();
        handlers.onRedo();
        return;
      }

      // Undo
      if (
        meta &&
        e.key.toLowerCase() === "z" &&
        !e.shiftKey &&
        handlers.onUndo
      ) {
        e.preventDefault();
        handlers.onUndo();
        return;
      }

      // Duplicate
      if (
        meta &&
        e.key.toLowerCase() === "d" &&
        handlers.onDuplicate
      ) {
        e.preventDefault();
        handlers.onDuplicate();
        return;
      }

      // Deselect
      if (e.key === "Escape" && handlers.onDeselect) {
        e.preventDefault();
        handlers.onDeselect();
        return;
      }

      // Move amount
      const amount = e.shiftKey ? 10 : 1;

      // Arrow movement
      if (e.key === "ArrowLeft" && handlers.onMoveLeft) {
        e.preventDefault();
        handlers.onMoveLeft(amount);
        return;
      }

      if (e.key === "ArrowRight" && handlers.onMoveRight) {
        e.preventDefault();
        handlers.onMoveRight(amount);
        return;
      }

      if (e.key === "ArrowUp" && handlers.onMoveUp) {
        e.preventDefault();
        handlers.onMoveUp(amount);
        return;
      }

      if (e.key === "ArrowDown" && handlers.onMoveDown) {
        e.preventDefault();
        handlers.onMoveDown(amount);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handlers]);
}