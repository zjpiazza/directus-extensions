<template>
	<div class="stats-card" :class="variantClass">
		<div class="stats-header">
			<span class="stats-label">{{ label }}</span>
			<v-icon v-if="icon" :name="icon" small class="stats-icon" />
		</div>
		<div class="stats-value">{{ value }}</div>
		<div class="stats-subtitle" :class="subtitleClass">
			{{ subtitle }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
	label: string;
	value: string | number;
	subtitle: string;
	icon?: string;
	variant?: 'default' | 'success' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'default',
});

const variantClass = computed(() => `variant-${props.variant}`);
const subtitleClass = computed(() => `subtitle-${props.variant}`);
</script>

<style scoped>
.stats-card {
	background: var(--theme--background);
	border: var(--theme--border-width) solid var(--theme--border-color-subdued);
	border-radius: var(--theme--border-radius);
	padding: 20px;
	transition: all var(--fast) var(--transition);
}

.stats-card:hover {
	border-color: var(--theme--border-color);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stats-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}

.stats-label {
	font-size: 14px;
	font-weight: 600;
	color: var(--theme--foreground-subdued);
	text-transform: none;
}

.stats-icon {
	color: var(--theme--foreground-subdued);
}

.stats-value {
	font-size: 32px;
	font-weight: 700;
	line-height: 1.2;
	margin-bottom: 8px;
	color: var(--theme--foreground);
}

.stats-subtitle {
	font-size: 12px;
	color: var(--theme--foreground-subdued);
}

.subtitle-success {
	color: var(--theme--success);
}

.subtitle-warning {
	color: var(--theme--warning);
}

.subtitle-danger {
	color: var(--theme--danger);
}

.variant-success .stats-value {
	color: var(--theme--success);
}

.variant-warning .stats-value {
	color: var(--theme--warning);
}

.variant-danger .stats-value {
	color: var(--theme--danger);
}
</style>
