<script setup lang="ts">
import { computed } from 'vue';
import { useWorkflowTheme } from '../composables/useWorkflowTheme';

const { currentTheme, availableThemes, setTheme } = useWorkflowTheme();

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
</script>

<template>
  <div class="theme-selector">
    <div class="theme-selector-header">
      <h3 class="selector-title">
        <v-icon name="palette" class="title-icon" />
        Workflow Theme
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
    
    <!-- Theme customization hint -->
    <div class="customization-hint">
      <v-icon name="info" class="hint-icon" />
      <span>Theme colors change node appearance dynamically. Each theme shows different color schemes to demonstrate customization capabilities.</span>
    </div>
  </div>
</template>

<style scoped>
.theme-selector {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  color: #ffffff;
}

.theme-selector-header {
  margin-bottom: 20px;
}

.selector-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.title-icon {
  font-size: 20px;
  color: #a855f7;
}

.current-theme-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.current-theme-name {
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
}

.current-theme-desc {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.theme-option.active {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
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
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  color: #ffffff;
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
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.feature-tag.shadows {
  background: rgba(139, 69, 19, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(139, 69, 19, 0.3);
}

.feature-tag.animations {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.active-indicator {
  flex-shrink: 0;
  color: #a855f7;
}

.check-icon {
  font-size: 20px;
}

.customization-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: #93c5fd;
}

.hint-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}
</style>