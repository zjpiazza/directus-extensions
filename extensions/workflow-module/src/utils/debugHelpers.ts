export interface DebugContext {
  [key: string]: any;
}

const DEBUG_ENABLED = true;

export function debugLog(emoji: string, message: string, context?: DebugContext): void {
  if (!DEBUG_ENABLED) return;
  
  if (context) {
    console.log(`${emoji} ${message}`, context);
  } else {
    console.log(`${emoji} ${message}`);
  }
}

export function debugError(message: string, error?: any): void {
  if (!DEBUG_ENABLED) return;
  
  if (error) {
    console.error(message, error);
  } else {
    console.error(message);
  }
}

export function debugWarn(message: string, context?: DebugContext): void {
  if (!DEBUG_ENABLED) return;
  
  if (context) {
    console.warn(message, context);
  } else {
    console.warn(message);
  }
}

export const DEBUG_EMOJIS = {
  SEARCH: '🔍',
  CHECK: '✅',
  CROSS: '❌',
  EYES: '👀',
  SEND: '📤',
  RECEIVE: '📥',
  SAVE: '💾',
  CLEAN: '🧹',
  RELOAD: '🔄',
  PAUSE: '⏸️',
  SKIP: '⏭️',
  NODES: '🔍',
} as const;
