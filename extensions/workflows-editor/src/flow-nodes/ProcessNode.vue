<script setup lang="ts">
import { computed, inject } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { IS_EDIT_MODE_KEY } from '../constants/injection-keys';

interface Data {
  label: string;
  description?: string;
  subtype?: 'task' | 'form';
  targetCollection?: string;
  targetCollections?: Array<{ collection: string; label?: string }>;
  formLabel?: string;
  openCollection?: (collectionName: string) => void;
  nodeSize?: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: number;
  customHeight?: number;
}

const props = defineProps<NodeProps<Data>>();

const isEditMode = inject(IS_EDIT_MODE_KEY, false);

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
const nodeColor = computed(() => (props.data.subtype === 'form' ? '#7c3aed' : '#2563eb'));

const displayLabel = computed(() => {
  // For form nodes with multiple collections, create a compound label
  if (props.data.subtype === 'form' && props.data.targetCollections && props.data.targetCollections.length > 0) {
    const labels = props.data.targetCollections
      .filter(link => link.collection)
      .map(link => link.label || link.collection)
      .join(' ');
    return labels || props.data.label;
  }
  
  // For form nodes with single collection, use formLabel or default
  if (props.data.subtype === 'form' && props.data.formLabel) {
    return props.data.formLabel;
  }
  
  return props.data.label;
});

const nodeStyle = computed(() => {
  const size = props.data.nodeSize || 'medium';
  
  // If custom size, use custom dimensions
  if (size === 'custom') {
    return {
      width: `${props.data.customWidth || 160}px`,
      minHeight: `${props.data.customHeight || 56}px`
    };
  }
  
  // Otherwise use preset sizes
  const sizes = {
    small: { width: '120px', minHeight: '60px' },
    medium: { width: '160px', minHeight: '56px' },
    large: { width: '240px', minHeight: '100px' }
  };
  
  return sizes[size as 'small' | 'medium' | 'large'] || sizes.medium;
});
</script>

<template>
  <div class="process-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
     <div class="process-shape" :style="{ borderColor: nodeColor, background: nodeColor, ...nodeStyle }">
      <v-icon class="node-icon" :name="nodeIcon" />
      <span class="node-label">{{ displayLabel }}</span>
      
      <!-- Multiple collection links for form nodes -->
      <div v-if="props.data.subtype === 'form' && hasCollectionLinks" class="collection-links">
        <!-- Legacy single collection support -->
        <button
          v-if="props.data.targetCollection && !props.data.targetCollections?.length"
          class="collection-link-btn"
          @click="handleOpenCollection(props.data.targetCollection)"
          :title="`Open ${props.data.targetCollection}`"
        >
          <v-icon name="open_in_new" class="link-icon" />
        </button>
        
        <!-- Multiple collections -->
        <div v-if="props.data.targetCollections?.length" class="multiple-links">
          <button
            v-for="(link, index) in props.data.targetCollections"
            :key="`${link.collection}-${index}`"
            class="collection-link-btn"
            @click="handleOpenCollection(link.collection)"
            :title="`Open ${link.label || link.collection}`"
          >
            <v-icon name="open_in_new" class="link-icon" />
            <span v-if="props.data.targetCollections.length > 1" class="link-index">{{ index + 1 }}</span>
          </button>
        </div>
      </div>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.process-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.process-shape {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: #eff6ff;
  border: 2px solid;
  border-radius: 0;
  /* Dynamic width and height are now set via :style binding */
  position: relative;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.node-icon { 
  font-size: 16px; 
  flex-shrink: 0; 
  margin-top: 2px; /* Align icon with first line of text */
  color: #ffffff;
}

.form-link {
  color: #ffffff;
  text-decoration: underline;
  cursor: pointer;
}

.node-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  flex: 1;
  text-align: center;
  text-shadow: 0 1px 1px rgba(0,0,0,0.25);
  line-height: 1.3;
  min-width: 0; /* Allow text to shrink */
}

.collection-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
  margin-top: 2px;
}

.multiple-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.collection-link-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 20px;
  height: 16px;
}

.collection-link-btn:hover { 
  opacity: 1; 
  background: rgba(0,0,0,0.1); 
}

.link-icon {
  color: #ffffff;
  font-size: 12px;
}

.link-index {
  color: #ffffff;
  font-size: 8px;
  font-weight: bold;
  line-height: 1;
  min-width: 8px;
  text-align: center;
}

.open-collection-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px; /* Align with first line of text */
}
.open-collection-btn:hover { opacity: 1; background: rgba(0,0,0,0.1); }

.process-shape:hover { transform: translateY(-2px); filter: brightness(0.9); }
</style>
