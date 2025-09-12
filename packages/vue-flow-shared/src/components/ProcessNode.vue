<template>
	<div class="process-node" :class="{ selected: selected, [`subtype-${data.subtype || 'task'}`]: true }">
		<div class="node-header">
			<v-icon :name="getSubtypeIcon()" class="node-icon" />
			<span class="node-title">{{ data.label || getDefaultLabel() }}</span>
		</div>
		<div v-if="data.description" class="node-description">
			{{ data.description }}
		</div>
		<div 
			v-if="data.subtype === 'form' && data.targetCollection" 
			class="node-collection clickable"
			@click.stop="openCollection"
			title="Click to open collection"
		>
			<v-icon name="folder" size="small" />
			{{ data.targetCollection }}
			<v-icon name="open_in_new" size="x-small" class="open-icon" />
		</div>

		<!-- Handles on all sides - all same type for maximum flexibility -->
		<Handle
			id="top"
			type="source"
			:position="Position.Top"
			:style="{ background: getSubtypeColor() }"
		/>
		<Handle
			id="right"
			type="source"
			:position="Position.Right"
			:style="{ background: getSubtypeColor() }"
		/>
		<Handle
			id="bottom"
			type="source"
			:position="Position.Bottom"
			:style="{ background: getSubtypeColor() }"
		/>
		<Handle
			id="left"
			type="source"
			:position="Position.Left"
			:style="{ background: getSubtypeColor() }"
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
		subtype?: 'task' | 'form';
		targetCollection?: string;
	};
	selected?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	'open-collection': [collection: string];
}>();

// Helper functions for subtype-specific display
function getSubtypeIcon() {
	const subtype = props.data.subtype || 'task';
	return subtype === 'form' ? 'description' : 'crop_square';
}

function getDefaultLabel() {
	const subtype = props.data.subtype || 'task';
	return subtype === 'form' ? 'Form' : 'Task';
}

function getSubtypeColor() {
	const subtype = props.data.subtype || 'task';
	return subtype === 'form' ? '#10b981' : '#3b82f6'; // Green for form, blue for task
}

function openCollection() {
	if (props.data.targetCollection) {
		emit('open-collection', props.data.targetCollection);
	}
}
</script>

<style scoped>
.process-node {
	background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
	color: white;
	border: 2px solid #1e3a8a;
	border-radius: 6px; /* Sharp rectangle shape */
	padding: 12px 16px;
	width: 140px;
	height: 80px;
	box-sizing: border-box;
	text-align: center;
	font-weight: 500;
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
	transition: all 0.2s ease;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.process-node:hover {
	transform: scale(1.05);
	box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.process-node.selected {
	border-color: #ffffff;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
}

.node-header {
	display: flex;
	align-items: center;
	gap: 8px;
}

.node-icon {
	font-size: 16px;
}

.node-title {
	font-weight: 600;
	font-size: 14px;
}

.node-description {
	font-size: 12px;
	opacity: 0.9;
	margin-top: 4px;
	line-height: 1.3;
}

.node-collection {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 11px;
	opacity: 0.8;
	margin-top: 4px;
	padding: 2px 6px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
}

.node-collection.clickable {
	cursor: pointer;
	transition: all 0.2s ease;
}

.node-collection.clickable:hover {
	opacity: 1;
	background: rgba(255, 255, 255, 0.2);
	transform: translateY(-1px);
}

.node-collection .open-icon {
	opacity: 0.7;
	margin-left: auto;
}

/* Subtype-specific styling */
.process-node.subtype-form {
	background: linear-gradient(135deg, #10b981 0%, #047857 100%);
	border-color: #065f46;
	box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.process-node.subtype-form:hover {
	box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.process-node.subtype-form.selected {
	box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
}
</style>