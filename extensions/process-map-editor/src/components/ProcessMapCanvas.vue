<template>
	<div class="canvas-container">
		<!-- Loading State -->
		<div v-if="isInitializing" class="loading-overlay">
			<div class="loading-content">
				<v-icon name="hourglass_empty" class="loading-spinner" />
				<p>Initializing Process Map...</p>
			</div>
		</div>
		
		<!-- Vue Flow Canvas - Only show when fully initialized -->
		<VueFlow
			v-if="!isInitializing"
			v-model:nodes="flowNodes"
			v-model:edges="flowEdges"
			:nodes-draggable="isEditMode"
			:nodes-connectable="isEditMode"
			:edges-updatable="isEditMode"
			snap-to-grid
			:snap-grid="[20, 20]"
			:zoom-on-scroll="isEditMode"
			:zoom-on-pinch="isEditMode"
			:zoom-on-double-click="false"
			:pan-on-scroll="false"
			:pan-on-scroll-mode="PanOnScrollMode.Free"
			:pan-on-drag="isEditMode"
			:min-zoom="0.1"
			:max-zoom="4"
			:fit-view-on-init="true"
			:default-edge-options="{ type: 'step', animated: true }"
			:class="['vue-flow-canvas', `zoom-level-${Math.round(currentZoom * 10)}`]"
			@nodes-initialized="onNodesInitialized"
			@move="onViewportMove"
		>
			<!-- Custom Node Templates -->
			<template #node-phase="nodeProps">
				<PhaseNode v-bind="nodeProps" />
			</template>
			<template #node-decision="nodeProps">
				<DecisionNode v-bind="nodeProps" />
			</template>

			<!-- Background -->
			<Background pattern="dots" :gap="20" :size="1" color="var(--theme--border-color)" />
			
			<!-- Custom SVG separator line overlay -->
			<div class="separator-overlay">
				<svg class="separator-line-svg" width="100%" height="100%" viewBox="0 0 1200 800">
					<!-- Vertical separator line positioned between Evaluate and Provide Services phases -->
					<!-- <line 
						x1="120" y1="0" 
						x2="120" y2="800" 
						stroke="#7c3aed" 
						stroke-width="8" 
						stroke-linecap="round"
					/> -->
					<!-- Text label for the separator -->
					<!-- <text 
						x="277" 
						y="400" 
						fill="#374151" 
						font-size="14" 
						font-weight="600" 
						letter-spacing="0.5px"
						text-anchor="middle"
						transform="rotate(-90, 277, 400)"
						style="cursor: pointer;"
						@click="editSeparatorText"
					>
						{{ separatorText }}
					</text> -->
				</svg>
			</div>

			<!-- Controls - Hide the default controls -->
			<Controls :show-zoom="false" :show-fit-view="false" :show-interactive="false">
				<!-- We'll move all functionality to our custom cluster -->
			</Controls>
		</VueFlow>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueFlow, PanOnScrollMode } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import type { Node, Edge } from '@vue-flow/core';

import PhaseNode from './PhaseNode.vue';
import DecisionNode from './DecisionNode.vue';

// Props
interface Props {
	isInitializing: boolean;
	flowNodes: Node[];
	flowEdges: Edge[];
	isEditMode: boolean;
	currentZoom: number;
	separatorText: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
	'update:flowNodes': [nodes: Node[]];
	'update:flowEdges': [edges: Edge[]];
	'nodes-initialized': [];
	'viewport-move': [event: { flowTransform: { x: number; y: number; zoom: number } }];
	'edit-separator-text': [];
}>();

// Computed properties for v-model
const flowNodes = computed({
	get: () => props.flowNodes,
	set: (value) => emit('update:flowNodes', value)
});

const flowEdges = computed({
	get: () => props.flowEdges,
	set: (value) => emit('update:flowEdges', value)
});

// Event handlers
function onNodesInitialized() {
	emit('nodes-initialized');
}

function onViewportMove(event: { flowTransform: { x: number; y: number; zoom: number } }) {
	emit('viewport-move', event);
}

function editSeparatorText() {
	emit('edit-separator-text');
}
</script>

<style scoped>
.canvas-container {
	flex: 1;
	height: 60vh;
	position: relative;
	border-bottom: 2px solid var(--theme--border-color, #e5e7eb);
}

/* Adjust layout when custom header is active */
.custom-header-active .canvas-container {
	height: calc(100vh - 200px); /* Adjust for header height */
}

.vue-flow-canvas {
	width: 100%;
	height: 100%;
}

/* Loading Overlay */
.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var(--theme--background, #f8fafc);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	color: var(--theme--foreground-subdued);
}

.loading-spinner {
	font-size: 2rem;
	animation: spin 2s linear infinite;
}

.loading-content p {
	margin: 0;
	font-size: 0.875rem;
	font-weight: 500;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

/* Vue Flow custom styling */
:deep(.vue-flow) {
	background: var(--theme--background, #f8fafc);
}

:deep(.vue-flow__background) {
	background: var(--theme--background, #f8fafc);
}

:deep(.vue-flow__edge-path) {
	stroke: var(--theme--foreground-subdued, #6b7280);
	stroke-width: 2;
}

:deep(.vue-flow__edge.animated .vue-flow__edge-path) {
	stroke-dasharray: 5;
	animation: dashdraw 0.5s linear infinite;
}

:deep(.vue-flow__edge-label) {
	background: var(--theme--background, white);
	padding: 2px 6px;
	border-radius: 3px;
	font-size: 11px;
	font-weight: 600;
	color: var(--theme--foreground, #374151);
}

@keyframes dashdraw {
	to {
		stroke-dashoffset: -10;
	}
}

/* Responsive zoom classes for optimal viewing at different zoom levels */
.vue-flow.zoom-small :deep(.vue-flow__node) {
	transform-origin: center;
}

.vue-flow.zoom-medium :deep(.vue-flow__node) {
	transform-origin: center;
}

.vue-flow.zoom-large :deep(.vue-flow__node) {
	transform-origin: center;
}

/* Custom freeze button styling to match other controls */
:deep(.vue-flow__controls-button) {
	background: transparent;
	border: none;
	color: var(--theme--foreground);
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	border-radius: var(--theme--border-radius);
	margin: 2px;
}

/* Style all Vue Flow control buttons for better contrast */
:deep(.vue-flow__controls) {
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.95));
	backdrop-filter: blur(8px);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	box-shadow: 0 4px 12px var(--theme--shadow, rgba(0, 0, 0, 0.15));
}

:deep(.vue-flow__controls button) {
	background: transparent;
	border: none;
	color: var(--theme--foreground);
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	border-radius: var(--theme--border-radius);
	margin: 2px;
}

:deep(.vue-flow__controls button:hover),
:deep(.vue-flow__controls-button:hover) {
	background: var(--theme--primary);
	color: var(--theme--primary-foreground);
	transform: scale(1.05);
}

:deep(.vue-flow__controls button svg) {
	width: 16px;
	height: 16px;
	fill: currentColor;
}

:deep(.vue-flow__controls-button:disabled) {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
	background: transparent;
}

:deep(.vue-flow__controls-button .v-icon) {
	font-size: 16px;
}

/* Separator Line Styles */
.separator-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 1000;
}

.separator-line-svg {
	width: 100%;
	height: 100%;
	position: relative;
	z-index: 1001;
}

.separator-line-svg line {
	pointer-events: none;
}

.separator-line-svg text {
	cursor: pointer;
	transition: fill 0.2s ease;
	pointer-events: auto;
}

.separator-line-svg text:hover {
	fill: var(--theme--primary, #7c3aed);
}
</style>