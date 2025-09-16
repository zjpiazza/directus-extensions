<template>
	<div class="decision-node" :class="{ selected: selected }">
		<div class="diamond-shape">
			<div class="node-content">
				<span class="node-title" :class="{ 'small-text': isAppropriateText }">{{ data.label || 'Decision' }}</span>
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
			:style="{ background: 'var(--theme--warning, #fbbf24)' }"
		/>
		<Handle
			id="right"
			type="source"
			:position="Position.Right"
			:style="{ background: 'var(--theme--warning, #fbbf24)' }"
		/>
		<Handle
			id="bottom"
			type="source"
			:position="Position.Bottom"
			:style="{ background: 'var(--theme--warning, #fbbf24)' }"
		/>
		<Handle
			id="left"
			type="source"
			:position="Position.Left"
			:style="{ background: 'var(--theme--warning, #fbbf24)' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';

interface Props {
	id: string;
	data: {
		label?: string;
		description?: string;
	};
	selected?: boolean;
}

const props = defineProps<Props>();

const isAppropriateText = computed(() => {
	return props.data.label?.includes('Appropriate') || false;
});
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
	background: var(--theme--warning, #fbbf24);
	border: 2px solid var(--theme--warning-border, #d97706);
	transform: rotate(45deg);
	border-radius: 8px;
	box-shadow: 0 4px 12px var(--theme--warning-shadow, rgba(251, 191, 36, 0.2));
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.diamond-shape:hover {
	transform: rotate(45deg) scale(1.05);
	box-shadow: 0 8px 25px var(--theme--warning-shadow-hover, rgba(251, 191, 36, 0.3));
}

.decision-node.selected .diamond-shape {
	border-color: var(--theme--background, #ffffff);
	box-shadow: 0 0 0 3px var(--theme--warning-selection, rgba(251, 191, 36, 0.4));
	transform: rotate(45deg) scale(1.05);
}

.node-content {
	transform: rotate(-45deg);
	text-align: center;
	color: var(--theme--warning-foreground, black);
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

.node-title.small-text {
	font-size: calc(0.35vw + 0.25rem);
}

.node-description {
	font-size: calc(0.4vw + 0.24rem);
	opacity: 0.9;
	margin-top: 2px;
	line-height: 1.2;
}
</style>
