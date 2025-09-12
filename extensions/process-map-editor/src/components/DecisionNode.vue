<template>
	<div class="decision-node" :class="{ selected: selected }">
		<div class="diamond-shape">
			<div class="node-content">
				<span class="node-title">{{ data.label || 'Decision' }}</span>
				<div v-if="data.description" class="node-description">
					{{ data.description }}
				</div>
			</div>
		</div>

		<!-- Handles on all sides - all same type for maximum flexibility -->
		<Handle
			id="top"
			type="source"
			:position="Position.Top"
			:style="{ background: '#fbbf24' }"
		/>
		<Handle
			id="right"
			type="source"
			:position="Position.Right"
			:style="{ background: '#fbbf24' }"
		/>
		<Handle
			id="bottom"
			type="source"
			:position="Position.Bottom"
			:style="{ background: '#fbbf24' }"
		/>
		<Handle
			id="left"
			type="source"
			:position="Position.Left"
			:style="{ background: '#fbbf24' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';

interface Props {
	id: string;
	data: {
		label?: string;
		description?: string;
	};
	selected?: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.decision-node {
	position: relative;
	width: calc(8vw + 2rem);
	height: calc(8vw + 2rem);
	min-width: 80px;
	min-height: 80px;
	max-width: 120px;
	max-height: 120px;
}

.diamond-shape {
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
	border: 2px solid #d97706;
	transform: rotate(45deg);
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.diamond-shape:hover {
	transform: rotate(45deg) scale(1.05);
	box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);
}

.decision-node.selected .diamond-shape {
	border-color: #ffffff;
	box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.4);
	transform: rotate(45deg) scale(1.05);
}

.node-content {
	transform: rotate(-45deg);
	text-align: center;
	color: black;
	padding: calc(0.5vw + 0.2rem);
	max-width: calc(6vw + 1.2rem);
	font-size: calc(0.512vw + 0.384rem);
}

.node-title {
	font-weight: 600;
	font-size: calc(0.512vw + 0.384rem);
	display: block;
	line-height: 1.2;
}

.node-description {
	font-size: calc(0.4vw + 0.24rem);
	opacity: 0.9;
	margin-top: 2px;
	line-height: 1.2;
}
</style>
