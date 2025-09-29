// Theme system types for workflow nodes

export interface NodeColors {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
  text?: string;
  border?: string;
}

export interface NodeShape {
  type: 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'hexagon' | 'ellipse';
  borderRadius?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: string;
}

export interface NodeTypeTheme {
  start: NodeColors & { shape: NodeShape };
  end: NodeColors & { shape: NodeShape };
  process: {
    task: NodeColors & { shape: NodeShape };
    form: NodeColors & { shape: NodeShape };
  };
  decision: NodeColors & { shape: NodeShape };
  terminal: NodeColors & { shape: NodeShape };
  offpage: {
    default: NodeColors & { shape: NodeShape };
    viewMode: NodeColors & { shape: NodeShape };
  };
}

export interface EdgeStyles {
  default: {
    stroke: string;
    strokeWidth: string;
    strokeDasharray?: string;
    animated?: boolean;
    markerEnd?: string;
    markerStart?: string;
  };
  selected: {
    stroke: string;
    strokeWidth: string;
  };
  hover: {
    stroke: string;
    strokeWidth: string;
  };
}

export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'dots' | 'lines';
  primary: string;
  secondary?: string;
  pattern?: {
    size: number;
    spacing: number;
    opacity: number;
  };
  gradient?: {
    direction: string;
    stops: Array<{ color: string; position: number }>;
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
  edges: EdgeStyles;
  canvas: CanvasBackground;
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