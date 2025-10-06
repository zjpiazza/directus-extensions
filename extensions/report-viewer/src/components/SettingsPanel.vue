<template>
	<div class="settings-panel">
		<div class="settings-header">
			<h2>BoldReports Configuration</h2>
			<v-button icon rounded x-small @click="$emit('close')">
				<v-icon name="close" />
			</v-button>
		</div>

		<div class="settings-content">
			<v-input
				v-model="localServerUrl"
				label="Server URL"
				placeholder="http://localhost:51777"
				:nullable="false"
			/>

			<v-input
				v-model="localSiteName"
				label="Site Name"
				placeholder="site1"
				:nullable="false"
			/>

			<v-input
				v-model="localAuthToken"
				label="Authorization Token"
				placeholder="Bearer token"
				type="password"
				:nullable="false"
			/>

			<div class="settings-help">
				<v-icon name="info" small />
				<p>
					Configure your BoldReports Server connection. The authorization token can be obtained from your
					BoldReports Server API settings.
				</p>
			</div>
		</div>

		<div class="settings-footer">
			<v-button secondary @click="$emit('close')">Cancel</v-button>
			<v-button :disabled="!isValid" @click="save">Save Settings</v-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
	serverUrl: string;
	siteName: string;
	authToken: string;
}>();

const emit = defineEmits<{
	'update:serverUrl': [value: string];
	'update:siteName': [value: string];
	'update:authToken': [value: string];
	close: [];
	save: [];
}>();

const localServerUrl = ref(props.serverUrl);
const localSiteName = ref(props.siteName);
const localAuthToken = ref(props.authToken);

const isValid = computed(() => {
	return localServerUrl.value.trim() !== '' && 
	       localSiteName.value.trim() !== '' && 
	       localAuthToken.value.trim() !== '';
});

watch(() => props.serverUrl, (val) => localServerUrl.value = val);
watch(() => props.siteName, (val) => localSiteName.value = val);
watch(() => props.authToken, (val) => localAuthToken.value = val);

function save() {
	emit('update:serverUrl', localServerUrl.value.trim());
	emit('update:siteName', localSiteName.value.trim());
	emit('update:authToken', localAuthToken.value.trim());
	emit('save');
}
</script>

<style scoped>
.settings-panel {
	background: var(--theme--background);
	border-radius: var(--theme--border-radius);
	box-shadow: var(--theme--shadow);
	padding: var(--content-padding);
	max-width: 600px;
	margin: 0 auto;
}

.settings-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 2rem;
}

.settings-header h2 {
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--theme--foreground);
}

.settings-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	margin-bottom: 2rem;
}

.settings-help {
	display: flex;
	gap: 0.75rem;
	padding: 1rem;
	background-color: var(--theme--background-accent);
	border-radius: var(--theme--border-radius);
	color: var(--theme--foreground-subdued);
	font-size: 0.875rem;
	line-height: 1.5;
}

.settings-help .v-icon {
	--v-icon-color: var(--theme--primary);
	flex-shrink: 0;
	margin-top: 0.125rem;
}

.settings-footer {
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
	padding-top: 1rem;
	border-top: 1px solid var(--theme--border-color-subdued);
}
</style>
