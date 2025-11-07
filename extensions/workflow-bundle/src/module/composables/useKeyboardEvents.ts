import { type Ref, onMounted, onUnmounted } from 'vue';

interface KeyboardEventOptions {
  followMode: Ref<boolean>;
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

/**
 * Composable for handling keyboard events in the workflow editor
 * Manages keyboard shortcuts and arrow key navigation in follow mode
 */
export function useKeyboardEvents(options: KeyboardEventOptions) {
  const { followMode, onNavigate } = options;

  /**
   * Handle keyboard shortcuts and navigation
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!followMode.value) return;
    
    // Prevent default behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      
      switch (event.key) {
        case 'ArrowUp':
          onNavigate('up');
          break;
        case 'ArrowDown':
          onNavigate('down');
          break;
        case 'ArrowLeft':
          onNavigate('left');
          break;
        case 'ArrowRight':
          onNavigate('right');
          break;
      }
    }
  };

  /**
   * Register keyboard event listeners
   */
  const registerListeners = () => {
    window.addEventListener('keydown', handleKeyDown);
  };

  /**
   * Unregister keyboard event listeners
   */
  const unregisterListeners = () => {
    window.removeEventListener('keydown', handleKeyDown);
  };

  // Automatically register/unregister on component lifecycle
  onMounted(() => {
    registerListeners();
  });

  onUnmounted(() => {
    unregisterListeners();
  });

  return {
    handleKeyDown,
    registerListeners,
    unregisterListeners,
  };
}
