<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWorkflowTheme } from '../composables/useWorkflowTheme';

const { currentTheme, availableThemes, setTheme } = useWorkflowTheme();

// Active customization panel
const activePanel = ref<'themes' | 'nodes' | 'edges' | 'canvas'>('themes');

const handleThemeChange = (themeId: string) => {
  setTheme(themeId);
};

// Preview colors for each theme - shows the primary colors for different node types
const getThemePreview = (theme: any) => {
  return [
    theme.nodeTypes.start.primary,
    theme.nodeTypes.process.task.primary,  
    theme.nodeTypes.process.form.primary,
    theme.nodeTypes.decision.primary,
    theme.nodeTypes.end.primary
  ];
};

// Node shape preview based on type
const getNodeShapeClass = (shape: any) => {
  const baseClass = 'shape-preview';
  switch (shape.type) {
    case 'circle':
      return `${baseClass} shape-circle`;
    case 'diamond':
      return `${baseClass} shape-diamond`;
    case 'hexagon':
      return `${baseClass} shape-hexagon`;
    case 'ellipse':
      return `${baseClass} shape-ellipse`;
    case 'rounded':
      return `${baseClass} shape-rounded`;
    default:
      return `${baseClass} shape-rectangle`;
  }
};
</script>

<template>
  <div class="theme-selector">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        v-for="tab in [
          { key: 'themes', label: 'Themes', icon: 'palette' },
          { key: 'nodes', label: 'Nodes', icon: 'account_tree' },
          { key: 'edges', label: 'Edges', icon: 'timeline' },
          { key: 'canvas', label: 'Canvas', icon: 'wallpaper' }
        ]" 
        :key="tab.key"
        class="tab-button"
        :class="{ 'active': activePanel === tab.key }"
        @click="activePanel = tab.key"
      >
        <v-icon :name="tab.icon" class="tab-icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Themes Panel -->
    <div v-if="activePanel === 'themes'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <v-icon name="palette" class="title-icon" />
          Workflow Themes
        </h3>
        <div class="current-theme-info">
          <span class="current-theme-name">{{ currentTheme.name }}</span>
          <span class="current-theme-desc">{{ currentTheme.description }}</span>
        </div>
      </div>
      
      <div class="theme-options">
        <div 
          v-for="theme in availableThemes" 
          :key="theme.id"
          class="theme-option"
          :class="{ 'active': theme.id === currentTheme.id }"
          @click="handleThemeChange(theme.id)"
          :title="theme.description"
        >
          <!-- Theme preview -->
          <div class="theme-preview">
            <div 
              v-for="(color, index) in getThemePreview(theme)"
              :key="index"
              class="preview-dot"
              :style="{ background: color }"
            ></div>
          </div>
          
          <!-- Theme info -->
          <div class="theme-info">
            <span class="theme-name">{{ theme.name }}</span>
            <div class="theme-features">
              <span 
                v-if="theme.effects.glassomorphism.enabled" 
                class="feature-tag glass"
                title="Glass morphism effects enabled"
              >
                Glass
              </span>
              <span 
                v-if="theme.effects.shadows.enabled" 
                class="feature-tag shadows"
                title="Shadow effects enabled"
              >
                Shadows
              </span>
              <span 
                v-if="theme.effects.animations.enabled" 
                class="feature-tag animations"
                title="Hover animations enabled"
              >
                Animated
              </span>
            </div>
          </div>
          
          <!-- Active indicator -->
          <div v-if="theme.id === currentTheme.id" class="active-indicator">
            <v-icon name="check_circle" class="check-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- Nodes Panel -->
    <div v-if="activePanel === 'nodes'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <v-icon name="account_tree" class="title-icon" />
          Node Styles
        </h3>
        <p class="panel-description">Customize node appearance and shapes for different node types</p>
      </div>
      
      <div class="node-type-options">
        <div 
          v-for="(nodeConfig, nodeType) in currentTheme.nodeTypes" 
          :key="nodeType"
          class="node-type-card"
        >
          <div class="node-type-header">
            <div class="node-type-preview">
              <div 
                :class="getNodeShapeClass(nodeConfig.shape || nodeConfig.default?.shape)"
                :style="{ 
                  backgroundColor: nodeConfig.primary || nodeConfig.default?.primary,
                  borderColor: nodeConfig.border || nodeConfig.default?.border,
                  color: nodeConfig.text || nodeConfig.default?.text
                }"
              >
                {{ nodeType }}
              </div>
            </div>
            <div class="node-type-info">
              <h4 class="node-type-name">{{ nodeType.charAt(0).toUpperCase() + nodeType.slice(1) }}</h4>
              <span class="shape-type">{{ (nodeConfig.shape || nodeConfig.default?.shape)?.type || 'rectangle' }}</span>
            </div>
          </div>
          
          <!-- Color swatches -->
          <div class="color-swatches">
            <div class="color-swatch" :style="{ backgroundColor: nodeConfig.primary || nodeConfig.default?.primary }" title="Primary"></div>
            <div class="color-swatch" :style="{ backgroundColor: nodeConfig.secondary || nodeConfig.default?.secondary }" title="Secondary"></div>
            <div class="color-swatch" :style="{ backgroundColor: nodeConfig.text || nodeConfig.default?.text }" title="Text"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edges Panel -->
    <div v-if="activePanel === 'edges'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <v-icon name="timeline" class="title-icon" />
          Edge Styles
        </h3>
        <p class="panel-description">Configure connection line appearance and animations</p>
      </div>
      
      <div class="edge-options">
        <div class="edge-preview-container">
          <svg width="100%" height="120" class="edge-preview-svg">
            <!-- Default edge -->
            <line 
              x1="20" y1="30" x2="280" y2="30"
              :stroke="currentTheme.edges.default.stroke"
              :stroke-width="currentTheme.edges.default.strokeWidth"
              :stroke-dasharray="currentTheme.edges.default.strokeDasharray"
            />
            <text x="150" y="20" text-anchor="middle" class="edge-label">Default</text>
            
            <!-- Selected edge -->
            <line 
              x1="20" y1="60" x2="280" y2="60"
              :stroke="currentTheme.edges.selected.stroke"
              :stroke-width="currentTheme.edges.selected.strokeWidth"
            />
            <text x="150" y="50" text-anchor="middle" class="edge-label">Selected</text>
            
            <!-- Hover edge -->
            <line 
              x1="20" y1="90" x2="280" y2="90"
              :stroke="currentTheme.edges.hover.stroke"
              :stroke-width="currentTheme.edges.hover.strokeWidth"
            />
            <text x="150" y="80" text-anchor="middle" class="edge-label">Hover</text>
          </svg>
        </div>
        
        <div class="edge-properties">
          <div class="property-group">
            <label class="property-label">Default Stroke</label>
            <div class="color-input">
              <div class="color-preview" :style="{ backgroundColor: currentTheme.edges.default.stroke }"></div>
              <span class="color-value">{{ currentTheme.edges.default.stroke }}</span>
            </div>
          </div>
          
          <div class="property-group">
            <label class="property-label">Animation</label>
            <div class="toggle-value">
              <v-icon :name="currentTheme.edges.default.animated ? 'play_arrow' : 'pause'" />
              {{ currentTheme.edges.default.animated ? 'Enabled' : 'Disabled' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Canvas Panel -->
    <div v-if="activePanel === 'canvas'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <v-icon name="wallpaper" class="title-icon" />
          Canvas Background
        </h3>
        <p class="panel-description">Set the background appearance of the workflow canvas</p>
      </div>
      
      <div class="canvas-options">
        <div class="canvas-preview">
          <div 
            class="canvas-preview-area"
            :style="{ 
              background: currentTheme.canvas.type === 'gradient' 
                ? `linear-gradient(${currentTheme.canvas.gradient?.direction}, ${currentTheme.canvas.primary}, ${currentTheme.canvas.secondary})`
                : currentTheme.canvas.primary
            }"
          >
            <div class="canvas-grid" v-if="currentTheme.canvas.type === 'dots'">
              <!-- Dot pattern preview -->
            </div>
            <span class="canvas-type-label">{{ currentTheme.canvas.type }}</span>
          </div>
        </div>
        
        <div class="canvas-properties">
          <div class="property-group">
            <label class="property-label">Type</label>
            <div class="canvas-type">
              <v-icon name="texture" />
              {{ currentTheme.canvas.type }}
            </div>
          </div>
          
          <div class="property-group">
            <label class="property-label">Primary Color</label>
            <div class="color-input">
              <div class="color-preview" :style="{ backgroundColor: currentTheme.canvas.primary }"></div>
              <span class="color-value">{{ currentTheme.canvas.primary }}</span>
            </div>
          </div>
          
          <div v-if="currentTheme.canvas.secondary" class="property-group">
            <label class="property-label">Secondary Color</label>
            <div class="color-input">
              <div class="color-preview" :style="{ backgroundColor: currentTheme.canvas.secondary }"></div>
              <span class="color-value">{{ currentTheme.canvas.secondary }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Theme customization hint -->
    <div class="customization-hint">
      <v-icon name="info" class="hint-icon" />
      <span>Use the JSON editor below to make custom modifications to the current theme configuration.</span>
    </div>
  </div>
</template>

<style scoped>
.theme-selector {
  background: var(--theme-background-accent);
  border: var(--theme-border-width) solid var(--theme-border-color-subdued);
  border-radius: var(--theme-border-radius);
  overflow: hidden;
  color: var(--theme-foreground);
}

.tab-navigation {
  display: flex;
  background: var(--theme-background);
  border-bottom: var(--theme-border-width) solid var(--theme-border-color);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  color: var(--theme-foreground-subdued);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: var(--theme-background-accent);
  color: var(--theme-foreground);
}

.tab-button.active {
  background: var(--theme-primary-background);
  color: var(--theme-primary);
  border-bottom: 2px solid var(--theme-primary);
}

.tab-icon {
  font-size: 16px;
}

.panel {
  padding: 20px;
}

.panel-header {
  margin-bottom: 20px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-foreground);
}

.title-icon {
  font-size: 20px;
  color: var(--theme-primary);
}

.panel-description {
  font-size: 13px;
  color: var(--theme-foreground-subdued);
  margin: 0;
}

.current-theme-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.current-theme-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-foreground);
}

.current-theme-desc {
  font-size: 12px;
  color: var(--theme-foreground-subdued);
  font-style: italic;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--theme-background);
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background: var(--theme-background-accent);
  transform: translateY(-1px);
}

.theme-option.active {
  background: var(--theme-primary-background);
  border-color: var(--theme-primary);
  box-shadow: var(--theme-elevation-sm);
}

.theme-preview {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.preview-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: var(--theme-border-width) solid var(--theme-border-color);
}

.theme-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-foreground);
}

.theme-features {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.feature-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-tag.glass {
  background: var(--theme-primary-background);
  color: var(--theme-primary);
  border: var(--theme-border-width) solid var(--theme-primary-25);
}

.feature-tag.shadows {
  background: var(--theme-warning-background);
  color: var(--theme-warning);
  border: var(--theme-border-width) solid var(--theme-warning-25);
}

.feature-tag.animations {
  background: var(--theme-success-background);
  color: var(--theme-success);
  border: var(--theme-border-width) solid var(--theme-success-25);
}

.active-indicator {
  flex-shrink: 0;
  color: var(--theme-primary);
}

.check-icon {
  font-size: 20px;
}

/* Node Styles */
.node-type-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.node-type-card {
  background: var(--theme-background);
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  padding: 16px;
}

.node-type-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.node-type-preview {
  flex-shrink: 0;
}

.shape-preview {
  width: 48px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  border-width: 2px;
  border-style: solid;
}

.shape-circle {
  border-radius: 50%;
  width: 32px;
  height: 32px;
}

.shape-diamond {
  transform: rotate(45deg);
  width: 24px;
  height: 24px;
}

.shape-hexagon {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.shape-ellipse {
  border-radius: 50%;
  height: 24px;
}

.shape-rounded {
  border-radius: 8px;
}

.shape-rectangle {
  border-radius: 2px;
}

.node-type-info {
  flex: 1;
}

.node-type-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-foreground);
  margin: 0 0 4px 0;
}

.shape-type {
  font-size: 12px;
  color: var(--theme-foreground-subdued);
  text-transform: capitalize;
}

.color-swatches {
  display: flex;
  gap: 6px;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: var(--theme-border-width) solid var(--theme-border-color);
}

/* Edge Styles */
.edge-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edge-preview-container {
  background: var(--theme-background);
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  padding: 16px;
}

.edge-preview-svg {
  width: 100%;
  height: 120px;
}

.edge-label {
  font-size: 12px;
  fill: var(--theme-foreground-subdued);
  font-family: var(--theme-font-family);
}

.edge-properties {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--theme-foreground-subdued);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--theme-background);
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: var(--theme-border-width) solid var(--theme-border-color);
}

.color-value {
  font-size: 12px;
  font-family: var(--theme-fonts-monospace-font-family);
  color: var(--theme-foreground);
}

.toggle-value {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--theme-background);
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  font-size: 12px;
  color: var(--theme-foreground);
}

/* Canvas Styles */
.canvas-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.canvas-preview {
  background: var(--theme-background);
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  padding: 16px;
}

.canvas-preview-area {
  width: 100%;
  height: 120px;
  border-radius: var(--theme-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.canvas-type-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-foreground);
  text-transform: capitalize;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 16px;
  backdrop-filter: blur(4px);
}

.canvas-properties {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.canvas-type {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--theme-background);
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  font-size: 12px;
  color: var(--theme-foreground);
  text-transform: capitalize;
}

.customization-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 20px;
  background: var(--theme-info-background);
  border-top: var(--theme-border-width) solid var(--theme-border-color);
  font-size: 12px;
  line-height: 1.4;
  color: var(--theme-info);
}

.hint-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}
</style>