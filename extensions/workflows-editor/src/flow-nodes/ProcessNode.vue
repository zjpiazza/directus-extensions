<script setup lang="ts">
import { computed, ref } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowTheme } from '../composables/useWorkflowTheme';

interface Data {
  label: string;
  description?: string;
  subtype?: 'task' | 'form';
  targetCollection?: string;
  targetCollections?: Array<{ collection: string; label?: string }>;
  formLabel?: string;
  openCollection?: (collectionName: string) => void;
  nodeSize?: 'small' | 'medium' | 'large';
}

const props = defineProps<NodeProps<Data>>();

// Theme system
const { getNodeStyle, getHoverTransform } = useWorkflowTheme();
const isHovered = ref(false);

const handleOpenCollection = (collectionName: string) => {
  if (props.data.subtype === 'form' && collectionName && props.data.openCollection) {
    props.data.openCollection(collectionName);
  }
};

const hasCollectionLinks = computed(() => {
  if (props.data.subtype !== 'form') return false;
  return (props.data.targetCollections && props.data.targetCollections.length > 0) || 
         props.data.targetCollection;
});

const nodeIcon = computed(() => (props.data.subtype === 'form' ? 'description' : 'task'));

const displayLabel = computed(() => {
  if (props.data.subtype === 'form' && props.data.targetCollections && props.data.targetCollections.length > 0) {
    const labels = props.data.targetCollections
      .filter(link => link.collection)
      .map(link => link.label || link.collection)
      .join(' ');
    return labels || props.data.label;
  }
  
  if (props.data.subtype === 'form' && props.data.formLabel) {
    return props.data.formLabel;
  }
  
  return props.data.label;
});

// Dynamic themed styles
const themedNodeStyle = computed(() => {
  return getNodeStyle({
    nodeType: 'process',
    subtype: props.data.subtype || 'task',
    isHovered: isHovered.value
  });
});

const nodeStyle = computed(() => {
  const size = props.data.nodeSize || 'medium';
  const isFormWithActions = props.data.subtype === 'form' && hasCollectionLinks.value;
  
  if (isFormWithActions) {
    // Taller for form nodes with actions to accommodate multiple rows
    const actionCount = props.data.targetCollections?.length || 1;
    const displayedActions = Math.min(actionCount, 3);
    const baseHeight = 80; // Header height
    const actionHeight = 44; // Height per action row
    const calculatedHeight = baseHeight + (displayedActions * actionHeight);
    
    const sizes = {
      small: { width: '180px', minHeight: `${calculatedHeight}px` },
      medium: { width: '220px', minHeight: `${calculatedHeight}px` },
      large: { width: '300px', minHeight: `${calculatedHeight}px` }
    };
    return sizes[size];
  } else {
    // Original sizes for non-action nodes
    const sizes = {
      small: { width: '160px', minHeight: '100px' },
      medium: { width: '200px', minHeight: '120px' },
      large: { width: '280px', minHeight: '160px' }
    };
    return sizes[size];
  }
});
</script>

<template>
  <div class="process-node-v3">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
    
    <!-- Dynamic themed card -->
    <div 
      class="glass-card" 
      :style="{ ...nodeStyle, ...themedNodeStyle }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      
      <!-- Content overlay -->
      <div class="card-overlay">
         <!-- Form node with full-width action buttons -->
         <div v-if="props.data.subtype === 'form' && hasCollectionLinks" class="form-actions">
           <!-- Header with icon and title on same line -->
           <div class="form-header">
             <div class="icon-badge">
               <v-icon class="badge-icon" :name="nodeIcon" />
             </div>
             <h3 class="form-title">{{ props.data.formLabel || props.data.label }}</h3>
           </div>
          
          <!-- Single collection -->
          <button
            v-if="props.data.targetCollection && !props.data.targetCollections?.length"
            class="action-row"
            @click="handleOpenCollection(props.data.targetCollection)"
            :title="`Open ${props.data.targetCollection}`"
          >
            <span class="action-label">{{ props.data.targetCollection }}</span>
            <v-icon name="launch" class="action-icon" />
          </button>
          
          <!-- Multiple collections - each as separate row -->
          <button
            v-for="(link, index) in props.data.targetCollections?.slice(0, 3) || []"
            :key="`${link.collection}-${index}`"
            class="action-row"
            @click="handleOpenCollection(link.collection)"
            :title="`Open ${link.label || link.collection}`"
          >
            <span class="action-label">{{ link.label || link.collection }}</span>
            <v-icon name="launch" class="action-icon" />
          </button>
          
          <!-- Show "more" indicator if there are additional collections -->
          <div v-if="props.data.targetCollections && props.data.targetCollections.length > 3" class="more-actions">
            +{{ props.data.targetCollections.length - 3 }} more collections
          </div>
        </div>
        
         <!-- Regular node without actions or non-form nodes -->
         <div v-else class="regular-content">
           <!-- Header with icon and title on same line -->
           <div class="regular-header">
             <div class="icon-badge">
               <v-icon class="badge-icon" :name="nodeIcon" />
             </div>
             <div class="title-section">
               <h3 class="node-title">{{ displayLabel }}</h3>
               <div v-if="props.data.subtype === 'form'" class="node-subtitle">
                 Interactive Form
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
    
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.process-node-v3 {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.glass-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  /* Theme-specific styles (backdrop-filter, border, transition) are applied via themedNodeStyle */
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.9;
}

.card-overlay {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  /* Text color is inherited from theme system */
}

.icon-badge {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 6px;
  border: 1px solid rgba(255,255,255,0.3);
  flex-shrink: 0;
}

.badge-icon {
  font-size: 18px;
  color: inherit;
}

.form-actions {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  margin-bottom: 8px;
  gap: 12px;
}

.form-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  word-wrap: break-word;
  text-align: left;
  color: inherit;
  flex: 1;
}

.action-row {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 6px;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.2s ease;
  width: 100%;
  min-height: 40px;
}

.action-row:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.action-row:active {
  transform: translateY(0);
}

.action-label {
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  word-wrap: break-word;
  text-align: left;
  flex: 1;
  min-width: 0;
}

.action-icon {
  font-size: 16px;
  opacity: 0.8;
  flex-shrink: 0;
}

.more-actions {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  text-align: center;
  font-style: italic;
  margin-top: 4px;
}

.regular-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.regular-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  word-wrap: break-word;
  text-align: left;
}

.node-subtitle {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
  gap: 4px;
  max-width: 140px;
  margin: 0 auto;
}

.collection-chip {
  width: 32px;
  height: 24px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 9px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collection-chip:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.more-indicator {
  width: 32px;
  height: 24px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  color: #ffffff;
  font-size: 9px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}
</style>