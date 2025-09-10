<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data {
  label: string;
  description?: string;
}

const props = defineProps<NodeProps<Data>>();
</script>

<template>
  <div class="decision-node">
    <Handle id="top" type="target" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="target" :position="Position.Left" :is-connectable="true" />
    <div class="node-content">
      <div class="diamond-shape">
        <span class="node-label">{{ props.data.label }}</span>
      </div>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.decision-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.diamond-shape {
  width: 160px;
  height: 100px;
  background: #d97706;
  border: 2px solid #d97706;
  clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 8px 12px;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.node-label {
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
  text-align: center;
  line-height: 1.15;
  text-shadow: 0 1px 1px rgba(0,0,0,0.25);
}

.diamond-shape:hover {
  transform: translateY(-2px);
  background: #b45309;
  border-color: #b45309;
}
</style>
