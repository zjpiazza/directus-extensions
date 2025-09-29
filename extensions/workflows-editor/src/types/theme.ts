// Theme system types for workflow nodes

export interface NodeColors {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
  text?: string;
  border?: string;
}

export interface NodeTypeTheme {
  start: NodeColors;
  end: NodeColors;
  process: {
    task: NodeColors;
    form: NodeColors;
  };
  decision: NodeColors;
  terminal: NodeColors;
  offpage: {
    default: NodeColors;
    viewMode: NodeColors;
  };
}

export interface ThemeEffects {
  glassomorphism: {
    enabled: boolean;
    blur: number;
    opacity: number;
    borderOpacity: number;
  };
  shadows: {
    enabled: boolean;
    hover: string;
    default: string;
  };
  animations: {
    enabled: boolean;
    hoverTransform: string;
    transition: string;
  };
}

export interface WorkflowTheme {
  id: string;
  name: string;
  description: string;
  nodeTypes: NodeTypeTheme;
  effects: ThemeEffects;
  customProperties?: Record<string, any>;
}

export interface ThemeCustomization {
  themeId: string;
  overrides: Partial<NodeTypeTheme>;
  customEffects?: Partial<ThemeEffects>;
}

// Helper types for dynamic styling
export interface ComputedNodeStyle {
  background: string;
  border: string;
  color: string;
  backdropFilter?: string;
  boxShadow?: string;
  transition?: string;
}

export interface NodeStyleOptions {
  nodeType: 'start' | 'end' | 'process' | 'decision' | 'terminal' | 'offpage';
  subtype?: string;
  isHovered?: boolean;
  isViewMode?: boolean;
}