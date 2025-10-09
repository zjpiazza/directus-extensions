<template>
	<div class="settings-panel">
		<div class="settings-header">
			<h2>DataHub Connection Settings</h2>
			<v-icon name="close" clickable @click="$emit('close')" />
		</div>

		<div class="settings-content">
			<v-notice type="info">
				<p>Configure your DataHub server connection. You can generate an access token from your DataHub instance under Settings → Access Tokens.</p>
			</v-notice>

			<v-input
				:model-value="serverUrl"
				label="DataHub Server URL"
				placeholder="https://your-datahub-instance.com"
				@update:model-value="$emit('update:serverUrl', $event)"
			/>

			<v-input
				:model-value="authToken"
				label="Access Token"
				type="password"
				placeholder="Your DataHub access token"
				@update:model-value="$emit('update:authToken', $event)"
			/>

			<div class="settings-actions">
				<v-button secondary @click="$emit('close')">Cancel</v-button>
				<v-button @click="$emit('save')">Save Settings</v-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	serverUrl: string;
	authToken: string;
}>();

defineEmits<{
	'update:serverUrl': [value: string];
	'update:authToken': [value: string];
	close: [];
	save: [];
}>();
</script>

<style scoped>
.settings-panel {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var(--theme--background);
	z-index: 100;
	overflow-y: auto;
}

.settings-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem;
	border-bottom: var(--theme--border-width) solid var(--theme--border-color-subdued);
}

.settings-header h2 {
	margin: 0;
	font-size: 1.25rem;
	font-weight: 600;
}

.settings-content {
	padding: 2rem;
	max-width: 600px;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.settings-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
	padding-top: 1rem;
}
</style>
