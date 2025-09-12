<template>
	<div class="phase-node" :class="`phase-${data.phase}`">
		<div class="node-content">
			<span class="node-label">{{ data.label }}</span>
		</div>
		
		<!-- Flow handles -->
		<Handle
			id="right"
			type="source"
			:position="Position.Right"
			class="phase-handle"
		/>
		<Handle
			id="left"
			type="target"
			:position="Position.Left"
			class="phase-handle"
		/>
		<Handle
			id="top"
			type="target"
			:position="Position.Top"
			class="phase-handle"
		/>
		<Handle
			id="bottom"
			type="source"
			:position="Position.Bottom"
			class="phase-handle"
		/>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';

interface Props {
	id: string;
	data: {
		label: string;
		phase: string;
	};
	selected?: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.phase-node {
	background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
	border: 2px solid #9ca3af;
	border-radius: 8px;
	padding: calc(0.96vw + 0.32rem) calc(1.2vw + 0.48rem);
	min-width: calc(8vw + 1.6rem);
	min-height: calc(4.8vh + 0.8rem);
	width: calc(9.6vw + 3.2rem);
	height: calc(5.6vh + 1.6rem);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;
	cursor: pointer;
	font-size: calc(0.8vw + 0.6rem);
}

.phase-node:hover {
	transform: scale(1.05);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.node-content {
	text-align: center;
}

.node-label {
	font-weight: 600;
	font-size: calc(0.512vw + 0.384rem);
	color: #374151;
	line-height: 1.3;
	white-space: pre-line;
}

.phase-handle {
	width: calc(0.48vw + 3.2px);
	height: calc(0.48vw + 3.2px);
	min-width: 4.8px;
	min-height: 4.8px;
	max-width: 9.6px;
	max-height: 9.6px;
	background: #6b7280;
	border: 2px solid white;
}

.phase-handle:hover {
	background: #374151;
}

/* Phase-specific styling */
.phase-node.phase-request {
	background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
	border-color: #8b5cf6;
}

.phase-node.phase-evaluate {
	background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
	border-color: #8b5cf6;
}

.phase-node.phase-provide {
	background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
	border-color: #8b5cf6;
}

.phase-node.phase-reevaluate {
	background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
	border-color: #8b5cf6;
}

.phase-node.phase-end {
	background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
	border-color: #8b5cf6;
}
</style>
