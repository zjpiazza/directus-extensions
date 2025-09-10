<template>
	<div class="offpage-node" :class="{ selected: selected, 'has-target': data.targetWorkflowId }" @click="handleClick">
		<div class="node-header">
			<v-icon name="home" class="node-icon" />
			<span class="node-title">{{ data.label || 'Off-page' }}</span>
		</div>
		<div v-if="data.description" class="node-description">
			{{ data.description }}
		</div>
		<div v-if="data.targetWorkflowId" class="target-workflow">
			→ {{ getWorkflowName(data.targetWorkflowId) }}
		</div>
		<div v-else class="no-target">
			Select workflow in properties
		</div>

		<!-- Handles on all sides - all same type for maximum flexibility -->
		<Handle
			id="top"
			type="source"
			:position="Position.Top"
			:style="{ background: '#f59e0b' }"
		/>
		<Handle
			id="right"
			type="source"
			:position="Position.Right"
			:style="{ background: '#f59e0b' }"
		/>
		<Handle
			id="bottom"
			type="source"
			:position="Position.Bottom"
			:style="{ background: '#f59e0b' }"
		/>
		<Handle
			id="left"
			type="source"
			:position="Position.Left"
			:style="{ background: '#f59e0b' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { Handle, Position } from '@vue-flow/core';

interface Props {
	id: string;
	data: {
		label?: string;
		description?: string;
		targetWorkflowId?: string;
	};
	selected?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	navigate: [workflowId: string];
}>();

// Get workflow data from parent component
const availableWorkflows = inject('availableWorkflows') as any;

const getWorkflowName = (workflowId: string) => {
	if (!availableWorkflows?.value) return 'Unknown Workflow';
	const workflow = availableWorkflows.value.find((w: any) => w.id === workflowId);
	return workflow?.name || 'Unknown Workflow';
};

const handleClick = () => {
	if (props.data.targetWorkflowId) {
		emit('navigate', props.data.targetWorkflowId);
	}
};
</script>

<style scoped>
.offpage-node {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	color: white;
	border: 2px solid #92400e;
	/* Pentagon/house shape using clip-path */
	clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%);
	padding: 16px 20px;
	min-width: 120px;
	min-height: 60px;
	text-align: center;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.offpage-node:hover {
	transform: scale(1.05);
	box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.offpage-node.selected {
	border-color: #ffffff;
	box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.4);
}

.node-header {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 600;
}

.node-icon {
	font-size: 16px;
}

.node-title {
	font-size: 14px;
}

.node-description {
	font-size: 12px;
	opacity: 0.9;
	margin-top: 4px;
	line-height: 1.3;
}

.target-workflow {
	font-size: 11px;
	margin-top: 4px;
	opacity: 0.8;
	font-style: italic;
	color: #fef3c7;
}

.offpage-node.has-target {
	cursor: pointer;
}

.offpage-node.has-target:hover {
	transform: scale(1.05);
	box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.offpage-node.has-target .target-workflow {
	color: #fef3c7;
	font-weight: 600;
}

.no-target {
	font-size: 11px;
	margin-top: 4px;
	opacity: 0.7;
	font-style: italic;
	color: #fef3c7;
	border: 1px dashed rgba(255, 255, 255, 0.3);
	padding: 2px 4px;
	border-radius: 3px;
}
</style>
