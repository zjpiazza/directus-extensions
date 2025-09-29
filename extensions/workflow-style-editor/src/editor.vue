<template>
	<div class="workflow-style-editor">
		<div class="editor-header">
			<h2 class="editor-title">
				<v-icon name="palette" class="title-icon" />
				Workflow Style Configuration
			</h2>
			<p class="editor-description">
				Configure themes and styling for workflow visualizations. Changes are stored as JSON and can be applied to workflow editors.
			</p>
		</div>

		<div class="editor-content">
			<!-- Theme Selector Component -->
			<div class="theme-section">
				<ThemeSelector />
			</div>

			<!-- Theme Preview -->
			<div class="preview-section">
				<h3 class="section-title">
					<v-icon name="visibility" class="section-icon" />
					Theme Preview
				</h3>
				<div class="preview-container">
					<!-- Node Previews -->
					<div class="node-previews">
						<div 
							v-for="nodeType in nodeTypes" 
							:key="nodeType.type + (nodeType.subtype || '')"
							class="preview-node"
							:class="getNodeShapeClass(nodeType.type, nodeType.subtype)"
							:style="getPreviewStyle(nodeType.type, nodeType.subtype)"
							:title="nodeType.label"
						>
							<div class="node-content">
								<v-icon :name="nodeType.icon" class="node-icon" />
								<span class="node-label">{{ nodeType.label }}</span>
							</div>
						</div>
					</div>
					
					<!-- Edge Preview -->
					<div class="edge-preview">
						<h4 class="preview-subtitle">Edge Styles</h4>
						<svg width="100%" height="80" class="edge-svg">
							<line 
								x1="20" y1="25" x2="180" y2="25"
								:stroke="currentTheme.edges?.default?.stroke || 'var(--theme-border-color)'"
								:stroke-width="currentTheme.edges?.default?.strokeWidth || '2px'"
								:stroke-dasharray="currentTheme.edges?.default?.strokeDasharray"
							/>
							<text x="100" y="18" text-anchor="middle" class="edge-label">Default Edge</text>
							
							<line 
								x1="20" y1="55" x2="180" y2="55"
								:stroke="currentTheme.edges?.selected?.stroke || 'var(--theme-primary)'"
								:stroke-width="currentTheme.edges?.selected?.strokeWidth || '3px'"
							/>
							<text x="100" y="48" text-anchor="middle" class="edge-label">Selected Edge</text>
						</svg>
					</div>
					
					<!-- Canvas Preview -->
					<div class="canvas-preview">
						<h4 class="preview-subtitle">Canvas Background</h4>
						<div 
							class="canvas-sample"
							:style="getCanvasPreviewStyle()"
							:title="`Canvas: ${currentTheme.canvas?.type || 'default'}`"
						>
							<span class="canvas-type">{{ currentTheme.canvas?.type || 'solid' }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- JSON Output -->
			<div class="json-section">
				<h3 class="section-title">
					<v-icon name="code" class="section-icon" />
					Theme Configuration (JSON)
				</h3>
				<div class="json-output">
					<textarea 
						:value="jsonOutput" 
						@input="handleJsonChange(($event.target as HTMLTextAreaElement).value)"
						class="json-textarea"
						placeholder="Theme configuration will appear here..."
						rows="12"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import ThemeSelector from './components/ThemeSelector.vue';
import { useWorkflowTheme } from './composables/useWorkflowTheme';
import type { NodeStyleOptions } from './types/theme';

// Props and emits
const props = defineProps<{
	value?: string;
}>();

const emit = defineEmits<{
	input: [value: string];
}>();

// Composable
const { currentTheme, getNodeStyle } = useWorkflowTheme();

// Node types for preview
const nodeTypes = [
	{ type: 'start', label: 'Start', icon: 'play_arrow' },
	{ type: 'process', subtype: 'task', label: 'Task', icon: 'task' },
	{ type: 'process', subtype: 'form', label: 'Form', icon: 'description' },
	{ type: 'decision', label: 'Decision', icon: 'help' },
	{ type: 'terminal', label: 'Terminal', icon: 'terminal' },
	{ type: 'end', label: 'End', icon: 'stop' }
] as const;

// JSON output computed
const jsonOutput = computed(() => {
	try {
		return JSON.stringify(currentTheme.value, null, 2);
	} catch (error) {
		return '';
	}
});

// Get preview style for nodes
const getPreviewStyle = (nodeType: string, subtype?: string) => {
	const options: NodeStyleOptions = {
		nodeType: nodeType as any,
		subtype,
		isHovered: false,
		isViewMode: false
	};
	
	return getNodeStyle(options);
};

// Get node shape class for proper rendering
const getNodeShapeClass = (nodeType: string, subtype?: string) => {
	const nodeConfig = getNodeConfig(nodeType, subtype);
	const shape = nodeConfig?.shape?.type || 'rectangle';
	
	return `preview-node-${shape}`;
};

// Get node configuration from theme
const getNodeConfig = (nodeType: string, subtype?: string) => {
	const theme = currentTheme.value;
	if (!theme.nodeTypes) return null;
	
	const typeConfig = theme.nodeTypes[nodeType as keyof typeof theme.nodeTypes];
	if (!typeConfig) return null;
	
	// Handle nested node types like process.task
	if (subtype && typeof typeConfig === 'object' && 'default' in typeConfig) {
		return typeConfig[subtype as keyof typeof typeConfig] || typeConfig.default;
	}
	
	return typeConfig;
};

// Get canvas preview style
const getCanvasPreviewStyle = () => {
	const canvas = currentTheme.value.canvas;
	if (!canvas) return { background: 'var(--theme-background)' };
	
	switch (canvas.type) {
		case 'gradient':
			if (canvas.gradient) {
				const stops = canvas.gradient.stops
					.map(stop => `${stop.color} ${stop.position * 100}%`)
					.join(', ');
				return {
					background: `linear-gradient(${canvas.gradient.direction}, ${stops})`
				};
			}
			return {
				background: `linear-gradient(135deg, ${canvas.primary}, ${canvas.secondary || canvas.primary})`
			};
		case 'dots':
			return {
				background: canvas.primary,
				backgroundImage: `radial-gradient(circle, ${canvas.secondary || '#ddd'} 1px, transparent 1px)`,
				backgroundSize: `${canvas.pattern?.spacing || 20}px ${canvas.pattern?.spacing || 20}px`
			};
		case 'lines':
			return {
				background: canvas.primary,
				backgroundImage: `linear-gradient(90deg, ${canvas.secondary || '#ddd'} 1px, transparent 1px), linear-gradient(${canvas.secondary || '#ddd'} 1px, transparent 1px)`,
				backgroundSize: `${canvas.pattern?.spacing || 20}px ${canvas.pattern?.spacing || 20}px`
			};
		case 'pattern':
		case 'solid':
		default:
			return { background: canvas.primary };
	}
};

// Handle JSON change
const handleJsonChange = (value: string) => {
	emit('input', value);
};

// Watch for theme changes and emit
watch(
	() => currentTheme.value,
	(newTheme) => {
		const themeJson = JSON.stringify(newTheme, null, 2);
		emit('input', themeJson);
	},
	{ deep: true, immediate: true }
);
</script>

<style scoped>
.workflow-style-editor {
	padding: 24px;
	width: 100%;
	background: var(--theme--background);
	min-height: 100vh;
	color: var(--theme--foreground);
}

.editor-header {
	margin-bottom: 32px;
	text-align: center;
}

.editor-title {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	margin: 0 0 12px 0;
	font-size: 28px;
	font-weight: 700;
	color: var(--theme--foreground);
}

.title-icon {
	font-size: 32px;
	color: var(--theme--primary);
}

.editor-description {
	font-size: 16px;
	color: var(--theme--foreground-subdued);
	line-height: 1.5;
	margin: 0 auto;
}

.editor-content {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 32px;
	align-items: start;
}

@media (max-width: 1024px) {
	.editor-content {
		grid-template-columns: 1fr;
	}
}

.theme-section {
	grid-column: 1;
}

.preview-section {
	grid-column: 2;
	background: var(--theme--background-accent);
	border: var(--theme--border-width) solid var(--theme--border-color-subdued);
	border-radius: var(--theme--border-radius);
	padding: 20px;
}

.json-section {
	grid-column: 1 / -1;
	background: var(--theme--background-accent);
	border: var(--theme--border-width) solid var(--theme--border-color-subdued);
	border-radius: var(--theme--border-radius);
	padding: 20px;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 0 0 16px 0;
	font-size: 18px;
	font-weight: 600;
	color: var(--theme--foreground);
}

.section-icon {
	font-size: 20px;
	color: var(--theme--primary);
}

.preview-container {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.node-previews {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	gap: 16px;
}

.preview-node {
	padding: 16px;
	text-align: center;
	cursor: default;
	min-height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	border-width: 2px;
	border-style: solid;
}

/* Node Shape Classes */
.preview-node-circle {
	border-radius: 50%;
	width: 80px;
	height: 80px;
}

.preview-node-diamond {
	transform: rotate(45deg);
	width: 60px;
	height: 60px;
	border-radius: 8px;
}

.preview-node-diamond .node-content {
	transform: rotate(-45deg);
}

.preview-node-hexagon {
	clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
	border-radius: 0;
}

.preview-node-ellipse {
	border-radius: 50%;
	height: 60px;
}

.preview-node-rounded {
	border-radius: 12px;
}

.preview-node-rectangle {
	border-radius: 4px;
}

.preview-node:hover {
	transform: translateY(-2px) scale(1.02);
	box-shadow: var(--theme--elevation-lg);
}

.node-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.node-icon {
	font-size: 24px;
}

.node-label {
	font-size: 12px;
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.json-output {
	background: var(--theme--background-normal);
	border-radius: var(--theme--border-radius);
	border: var(--theme--border-width) solid var(--theme--border-color);
	padding: 2px;
}

.json-textarea {
	width: 100%;
	background: transparent;
	border: none;
	color: var(--theme--foreground);
	font-family: var(--theme--fonts--monospace--font-family);
	font-size: 13px;
	line-height: 1.5;
	padding: 16px;
	resize: vertical;
	outline: none;
}

.json-textarea::placeholder {
	color: var(--theme--foreground-subdued);
}

.json-textarea:focus {
	background: var(--theme--background-accent);
}

/* Preview Sections */
.preview-subtitle {
	font-size: 14px;
	font-weight: 600;
	color: var(--theme--foreground);
	margin: 0 0 12px 0;
	display: flex;
	align-items: center;
	gap: 6px;
}

.preview-subtitle::before {
	content: '';
	width: 4px;
	height: 14px;
	background: var(--theme--primary);
	border-radius: 2px;
}

.edge-preview {
	background: var(--theme--background-normal);
	border: var(--theme--border-width) solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	padding: 16px;
}

.edge-svg {
	background: var(--theme--background);
	border-radius: var(--theme--border-radius);
}

.edge-label {
	font-size: 11px;
	fill: var(--theme--foreground-subdued);
	font-family: var(--theme--fonts--sans--font-family);
}

.canvas-preview {
	background: var(--theme--background-normal);
	border: var(--theme--border-width) solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	padding: 16px;
}

.canvas-sample {
	width: 100%;
	height: 80px;
	border-radius: var(--theme--border-radius);
	border: var(--theme--border-width) solid var(--theme--border-color);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
}

.canvas-type {
	font-size: 12px;
	font-weight: 600;
	color: var(--theme--foreground);
	background: rgba(255, 255, 255, 0.9);
	padding: 4px 12px;
	border-radius: 12px;
	backdrop-filter: blur(4px);
	text-transform: capitalize;
	border: var(--theme--border-width) solid rgba(255, 255, 255, 0.2);
}
</style>
