<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data { label: string; description?: string; }
const props = defineProps<NodeProps<Data>>();
</script>

<template>
  <div class="start-node">
    <div class="terminal-shape">
      <span class="node-label">{{ props.data.label }}</span>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.start-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.terminal-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: #16a34a;
  border: 2px solid #16a34a;
  border-radius: 14px;
  min-width: 160px;
  min-height: 56px;
  text-align: center;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.node-label { font-size: 14px; font-weight: 500; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 1px rgba(0,0,0,0.3); }

.terminal-shape:hover { transform: translateY(-2px); background: #15803d; border-color: #15803d; }
</style>