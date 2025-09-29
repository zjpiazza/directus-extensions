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
      border: 'rgba(255,255,255,0.2)',
      shape: { type: 'circle', borderRadius: '50%', borderStyle: 'solid', borderWidth: '2px' }
    },
    end: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      text: '#ffffff',
      border: 'rgba(255,255,255,0.2)',
      shape: { type: 'circle', borderRadius: '50%', borderStyle: 'solid', borderWidth: '2px' }
    },
    process: {
      task: {
        primary: '#2563eb',
        secondary: '#1d4ed8',
        text: '#ffffff',
        border: 'rgba(255,255,255,0.2)',
        shape: { type: 'rounded', borderRadius: '8px', borderStyle: 'solid', borderWidth: '2px' }
      },
      form: {
        primary: '#7c3aed',
        secondary: '#6d28d9',
        text: '#ffffff',
        border: 'rgba(255,255,255,0.2)',
        shape: { type: 'rounded', borderRadius: '8px', borderStyle: 'solid', borderWidth: '2px' }
      }
    },
    decision: {
      primary: '#d97706',
      secondary: '#b45309',
      text: '#ffffff',
      border: 'rgba(255,255,255,0.2)',
      shape: { type: 'diamond', borderRadius: '4px', borderStyle: 'solid', borderWidth: '2px' }
    },
    terminal: {
      primary: '#0284c7',
      secondary: '#0369a1',
      text: '#ffffff',
      border: 'rgba(255,255,255,0.2)',
      shape: { type: 'hexagon', borderRadius: '4px', borderStyle: 'solid', borderWidth: '2px' }
    },
    offpage: {
      default: {
        primary: '#475569',
        secondary: '#334155',
        text: '#ffffff',
        border: 'rgba(255,255,255,0.2)',
        shape: { type: 'ellipse', borderRadius: '16px', borderStyle: 'solid', borderWidth: '2px' }
      },
      viewMode: {
        primary: '#0066cc',
        secondary: '#0052a3',
        text: '#ffffff',
        border: 'rgba(255,255,255,0.2)',
        shape: { type: 'ellipse', borderRadius: '16px', borderStyle: 'solid', borderWidth: '2px' }
      }
    }
  },
  edges: {
    default: {
      stroke: 'var(--theme-border-color)',
      strokeWidth: '2px',
      animated: false,
      markerEnd: 'url(#arrow)'
    },
    selected: {
      stroke: 'var(--theme-primary)',
      strokeWidth: '3px'
    },
    hover: {
      stroke: 'var(--theme-primary-accent)',
      strokeWidth: '3px'
    }
  },
  canvas: {
    type: 'gradient',
    primary: 'var(--theme-background)',
    secondary: 'var(--theme-background-accent)',
    gradient: {
      direction: '135deg',
      stops: [
        { color: 'var(--theme-background)', position: 0 },
        { color: 'var(--theme-background-accent)', position: 1 }
      ]
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
      border: 'rgba(0,255,0,0.6)',
      shape: { type: 'circle', borderRadius: '50%', borderStyle: 'solid', borderWidth: '3px' }
    },
    end: {
      primary: '#ff0080',
      secondary: '#cc0066',
      text: '#ffffff',
      border: 'rgba(255,0,128,0.6)',
      shape: { type: 'circle', borderRadius: '50%', borderStyle: 'solid', borderWidth: '3px' }
    },
    process: {
      task: {
        primary: '#00ccff',
        secondary: '#0099cc',
        text: '#ffffff',
        border: 'rgba(0,204,255,0.6)',
        shape: { type: 'rectangle', borderRadius: '4px', borderStyle: 'solid', borderWidth: '3px' }
      },
      form: {
        primary: '#ff00ff',
        secondary: '#cc00cc',
        text: '#ffffff',
        border: 'rgba(255,0,255,0.6)',
        shape: { type: 'rectangle', borderRadius: '4px', borderStyle: 'solid', borderWidth: '3px' }
      }
    },
    decision: {
      primary: '#ffff00',
      secondary: '#cccc00',
      text: '#000000',
      border: 'rgba(255,255,0,0.6)',
      shape: { type: 'diamond', borderRadius: '0px', borderStyle: 'solid', borderWidth: '3px' }
    },
    terminal: {
      primary: '#ff8000',
      secondary: '#cc6600',
      text: '#ffffff',
      border: 'rgba(255,128,0,0.6)',
      shape: { type: 'hexagon', borderRadius: '0px', borderStyle: 'solid', borderWidth: '3px' }
    },
    offpage: {
      default: {
        primary: '#8000ff',
        secondary: '#6600cc',
        text: '#ffffff',
        border: 'rgba(128,0,255,0.6)',
        shape: { type: 'ellipse', borderRadius: '12px', borderStyle: 'solid', borderWidth: '3px' }
      },
      viewMode: {
        primary: '#00ffff',
        secondary: '#00cccc',
        text: '#000000',
        border: 'rgba(0,255,255,0.6)',
        shape: { type: 'ellipse', borderRadius: '12px', borderStyle: 'solid', borderWidth: '3px' }
      }
    }
  },
  edges: {
    default: {
      stroke: '#ffffff',
      strokeWidth: '2px',
      strokeDasharray: '5,5',
      animated: true,
      markerEnd: 'url(#neon-arrow)'
    },
    selected: {
      stroke: '#00ffff',
      strokeWidth: '4px'
    },
    hover: {
      stroke: '#ff00ff',
      strokeWidth: '4px'
    }
  },
  canvas: {
    type: 'solid',
    primary: '#0a0a0a'
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
      border: 'rgba(75,85,99,0.3)',
      shape: { type: 'circle', borderRadius: '50%', borderStyle: 'solid', borderWidth: '1px' }
    },
    end: {
      primary: '#6b7280',
      secondary: '#4b5563',
      text: '#ffffff',
      border: 'rgba(75,85,99,0.3)',
      shape: { type: 'circle', borderRadius: '50%', borderStyle: 'solid', borderWidth: '1px' }
    },
    process: {
      task: {
        primary: '#4b5563',
        secondary: '#374151',
        text: '#ffffff',
        border: 'rgba(75,85,99,0.3)',
        shape: { type: 'rounded', borderRadius: '6px', borderStyle: 'solid', borderWidth: '1px' }
      },
      form: {
        primary: '#6b7280',
        secondary: '#4b5563',
        text: '#ffffff',
        border: 'rgba(75,85,99,0.3)',
        shape: { type: 'rounded', borderRadius: '6px', borderStyle: 'solid', borderWidth: '1px' }
      }
    },
    decision: {
      primary: '#9ca3af',
      secondary: '#6b7280',
      text: '#1f2937',
      border: 'rgba(75,85,99,0.3)',
      shape: { type: 'diamond', borderRadius: '2px', borderStyle: 'solid', borderWidth: '1px' }
    },
    terminal: {
      primary: '#374151',
      secondary: '#1f2937',
      text: '#ffffff',
      border: 'rgba(75,85,99,0.3)',
      shape: { type: 'hexagon', borderRadius: '2px', borderStyle: 'solid', borderWidth: '1px' }
    },
    offpage: {
      default: {
        primary: '#4b5563',
        secondary: '#374151',
        text: '#ffffff',
        border: 'rgba(75,85,99,0.3)',
        shape: { type: 'ellipse', borderRadius: '12px', borderStyle: 'solid', borderWidth: '1px' }
      },
      viewMode: {
        primary: '#6b7280',
        secondary: '#4b5563',
        text: '#ffffff',
        border: 'rgba(75,85,99,0.3)',
        shape: { type: 'ellipse', borderRadius: '12px', borderStyle: 'solid', borderWidth: '1px' }
      }
    }
  },
  edges: {
    default: {
      stroke: '#6b7280',
      strokeWidth: '1px',
      animated: false,
      markerEnd: 'url(#simple-arrow)'
    },
    selected: {
      stroke: '#374151',
      strokeWidth: '2px'
    },
    hover: {
      stroke: '#4b5563',
      strokeWidth: '2px'
    }
  },
  canvas: {
    type: 'dots',
    primary: '#f9fafb',
    secondary: '#e5e7eb',
    pattern: {
      size: 1,
      spacing: 20,
      opacity: 0.3
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