<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data {
  label: string;
  description?: string;
}

const props = defineProps<NodeProps<Data>>();
</script>

<template>
  <div class="terminal-node">
    <Handle id="top" type="target" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="target" :position="Position.Left" :is-connectable="true" />
    <div class="node-content">
      <div class="terminal-shape">
        <span class="node-label">{{ props.data.label }}</span>
      </div>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.terminal-node {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 24px;
  background: #0284c7;
  border: 2px solid #0284c7;
  border-radius: 14px;
  min-width: 160px;
  min-height: 60px;
  text-align: center;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.terminal-shape {
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 1px rgba(0,0,0,0.3);
}

.node-content:hover {
  transform: translateY(-2px);
  background: #0369a1;
  border-color: #0369a1;
}
</style>
