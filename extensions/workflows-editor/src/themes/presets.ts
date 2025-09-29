import type { WorkflowTheme } from '../types/theme';

export const glassModernTheme: WorkflowTheme = {
  id: 'glass-modern',
  name: 'Glass Modern',
  description: 'Modern glass morphism with vibrant colors',
  nodeTypes: {
    start: {
      primary: '#16a34a',
      secondary: '#15803d',
      text: '#ffffff',
      border: 'rgba(255,255,255,0.2)'
    },
    end: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      text: '#ffffff',
      border: 'rgba(255,255,255,0.2)'
    },
    process: {
      task: {
        primary: '#2563eb',
        secondary: '#1d4ed8',
        text: '#ffffff',
        border: 'rgba(255,255,255,0.2)'
      },
      form: {
        primary: '#7c3aed',
        secondary: '#6d28d9',
        text: '#ffffff',
        border: 'rgba(255,255,255,0.2)'
      }
    },
    decision: {
      primary: '#d97706',
      secondary: '#b45309',
      text: '#ffffff',
      border: 'rgba(255,255,255,0.2)'
    },
    terminal: {
      primary: '#0284c7',
      secondary: '#0369a1',
      text: '#ffffff',
      border: 'rgba(255,255,255,0.2)'
    },
    offpage: {
      default: {
        primary: '#475569',
        secondary: '#334155',
        text: '#ffffff',
        border: 'rgba(255,255,255,0.2)'
      },
      viewMode: {
        primary: '#0066cc',
        secondary: '#0052a3',
        text: '#ffffff',
        border: 'rgba(255,255,255,0.2)'
      }
    }
  },
  effects: {
    glassomorphism: {
      enabled: true,
      blur: 10,
      opacity: 0.9,
      borderOpacity: 0.2
    },
    shadows: {
      enabled: true,
      default: '0 4px 16px rgba(0,0,0,0.1)',
      hover: '0 8px 32px rgba(0,0,0,0.15)'
    },
    animations: {
      enabled: true,
      hoverTransform: 'translateY(-4px)',
      transition: 'all 0.3s ease'
    }
  }
};

export const neonCyberTheme: WorkflowTheme = {
  id: 'neon-cyber',
  name: 'Neon Cyber',
  description: 'Cyberpunk-inspired neon theme with electric colors',
  nodeTypes: {
    start: {
      primary: '#00ff00',
      secondary: '#00cc00',
      text: '#000000',
      border: 'rgba(0,255,0,0.6)'
    },
    end: {
      primary: '#ff0080',
      secondary: '#cc0066',
      text: '#ffffff',
      border: 'rgba(255,0,128,0.6)'
    },
    process: {
      task: {
        primary: '#00ccff',
        secondary: '#0099cc',
        text: '#ffffff',
        border: 'rgba(0,204,255,0.6)'
      },
      form: {
        primary: '#ff00ff',
        secondary: '#cc00cc',
        text: '#ffffff',
        border: 'rgba(255,0,255,0.6)'
      }
    },
    decision: {
      primary: '#ffff00',
      secondary: '#cccc00',
      text: '#000000',
      border: 'rgba(255,255,0,0.6)'
    },
    terminal: {
      primary: '#ff8000',
      secondary: '#cc6600',
      text: '#ffffff',
      border: 'rgba(255,128,0,0.6)'
    },
    offpage: {
      default: {
        primary: '#8000ff',
        secondary: '#6600cc',
        text: '#ffffff',
        border: 'rgba(128,0,255,0.6)'
      },
      viewMode: {
        primary: '#00ffff',
        secondary: '#00cccc',
        text: '#000000',
        border: 'rgba(0,255,255,0.6)'
      }
    }
  },
  effects: {
    glassomorphism: {
      enabled: false,
      blur: 0,
      opacity: 1,
      borderOpacity: 0.6
    },
    shadows: {
      enabled: true,
      default: '0 0 20px currentColor',
      hover: '0 0 30px currentColor, 0 0 40px currentColor'
    },
    animations: {
      enabled: true,
      hoverTransform: 'scale(1.05)',
      transition: 'all 0.2s ease'
    }
  }
};

export const minimalMonoTheme: WorkflowTheme = {
  id: 'minimal-mono',
  name: 'Minimal Mono',
  description: 'Clean monochromatic theme with subtle variations',
  nodeTypes: {
    start: {
      primary: '#374151',
      secondary: '#1f2937',
      text: '#ffffff',
      border: 'rgba(75,85,99,0.3)'
    },
    end: {
      primary: '#6b7280',
      secondary: '#4b5563',
      text: '#ffffff',
      border: 'rgba(75,85,99,0.3)'
    },
    process: {
      task: {
        primary: '#4b5563',
        secondary: '#374151',
        text: '#ffffff',
        border: 'rgba(75,85,99,0.3)'
      },
      form: {
        primary: '#6b7280',
        secondary: '#4b5563',
        text: '#ffffff',
        border: 'rgba(75,85,99,0.3)'
      }
    },
    decision: {
      primary: '#9ca3af',
      secondary: '#6b7280',
      text: '#1f2937',
      border: 'rgba(75,85,99,0.3)'
    },
    terminal: {
      primary: '#374151',
      secondary: '#1f2937',
      text: '#ffffff',
      border: 'rgba(75,85,99,0.3)'
    },
    offpage: {
      default: {
        primary: '#4b5563',
        secondary: '#374151',
        text: '#ffffff',
        border: 'rgba(75,85,99,0.3)'
      },
      viewMode: {
        primary: '#6b7280',
        secondary: '#4b5563',
        text: '#ffffff',
        border: 'rgba(75,85,99,0.3)'
      }
    }
  },
  effects: {
    glassomorphism: {
      enabled: true,
      blur: 5,
      opacity: 0.95,
      borderOpacity: 0.3
    },
    shadows: {
      enabled: true,
      default: '0 2px 8px rgba(0,0,0,0.1)',
      hover: '0 4px 16px rgba(0,0,0,0.15)'
    },
    animations: {
      enabled: true,
      hoverTransform: 'translateY(-2px)',
      transition: 'all 0.25s ease'
    }
  }
};

export const presetThemes = [glassModernTheme, neonCyberTheme, minimalMonoTheme];