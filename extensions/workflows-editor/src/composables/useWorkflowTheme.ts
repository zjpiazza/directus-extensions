import { ref, computed } from 'vue';
import type { 
  WorkflowTheme, 
  NodeStyleOptions, 
  ComputedNodeStyle,
  NodeColors
} from '../types/theme';
import { presetThemes } from '../themes/presets';

// Global theme state
const currentThemeId = ref<string>('glass-modern');

export function useWorkflowTheme() {
  
  const currentTheme = computed(() => {
    return presetThemes.find(theme => theme.id === currentThemeId.value) ?? presetThemes[0];
  });

  const availableThemes = computed(() => presetThemes);

  const setTheme = (themeId: string) => {
    const theme = presetThemes.find(t => t.id === themeId);
    if (theme) {
      currentThemeId.value = themeId;
    }
  };

  const getNodeColors = (theme: WorkflowTheme, options: NodeStyleOptions): NodeColors => {
    switch (options.nodeType) {
      case 'start':
        return theme.nodeTypes.start;
      case 'end':
        return theme.nodeTypes.end;
      case 'process':
        return options.subtype === 'form' 
          ? theme.nodeTypes.process.form 
          : theme.nodeTypes.process.task;
      case 'decision':
        return theme.nodeTypes.decision;
      case 'terminal':
        return theme.nodeTypes.terminal;
      case 'offpage':
        return options.isViewMode 
          ? theme.nodeTypes.offpage.viewMode 
          : theme.nodeTypes.offpage.default;
      default:
        return theme.nodeTypes.process.task;
    }
  };

  const getNodeStyle = (options: NodeStyleOptions): ComputedNodeStyle => {
    const theme = currentTheme.value;
    if (!theme) return { background: '#000', border: '1px solid #fff', color: '#fff' };
    
    const colors = getNodeColors(theme, options);

    const style: ComputedNodeStyle = {
      background: `linear-gradient(135deg, ${colors.primary}dd, ${colors.primary}aa)`,
      border: `1px solid ${colors.border || 'rgba(255,255,255,0.2)'}`,
      color: colors.text || '#ffffff'
    };

    if (theme.effects.glassomorphism.enabled) {
      style.backdropFilter = `blur(${theme.effects.glassomorphism.blur}px)`;
    }

    if (theme.effects.shadows.enabled) {
      style.boxShadow = options.isHovered 
        ? theme.effects.shadows.hover 
        : theme.effects.shadows.default;
    }

    if (theme.effects.animations.enabled) {
      style.transition = theme.effects.animations.transition;
    }

    return style;
  };

  const getHoverTransform = computed(() => {
    const theme = currentTheme.value;
    if (!theme) return 'none';
    
    return theme.effects.animations.enabled 
      ? theme.effects.animations.hoverTransform 
      : 'none';
  });

  return {
    currentTheme,
    availableThemes,
    currentThemeId: currentThemeId,
    setTheme,
    getNodeStyle,
    getHoverTransform
  };
}