<template>
	<private-view title="Reports">
		<template #headline>
			<v-breadcrumb :items="[{ name: 'Reports', to: '/report-viewer' }]" />
		</template>

		<template #title>
			<h1 class="type-title">{{ currentReport?.Name || 'Reports' }}</h1>
		</template>

		<template #actions>
			<v-button v-if="!showSettings" icon rounded @click="showSettings = true">
				<v-icon name="settings" />
			</v-button>
		</template>

		<template #navigation>
			<navigation-sidebar
				:reports="reports"
				:categories="categories"
				:loading="loadingReports"
				:current-report-id="reportId"
				@select="selectReport"
				@refresh="loadReports"
			/>
		</template>

		<div class="report-viewer-container">
			<settings-panel
				v-if="showSettings"
				:server-url="serverUrl"
				:site-name="siteName"
				:auth-token="authToken"
				@update:serverUrl="serverUrl = $event"
				@update:siteName="siteName = $event"
				@update:authToken="authToken = $event"
				@close="showSettings = false"
				@save="saveSettings"
			/>

			<div v-else-if="!isConfigured" class="config-message">
				<v-icon name="settings" large />
				<p>Please configure your BoldReports Server settings</p>
				<v-button @click="showSettings = true">Open Settings</v-button>
			</div>

			<div v-else-if="!reportId" class="no-report-message">
				<v-icon name="description" large />
				<p>Select a report from the sidebar to view</p>
			</div>

			<div v-else-if="scriptsLoaded" id="report-viewer" class="report-viewer"></div>
		</div>
	</private-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavigationSidebar from './components/NavigationSidebar.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import jQuery from 'jquery';

(window as any).$ = (window as any).jQuery = jQuery;

const route = useRoute();
const router = useRouter();

const reportId = computed(() => route.params.reportId as string | undefined);
const reports = ref<BoldReportItem[]>([]);
const categories = ref<BoldReportCategory[]>([]);
const loadingReports = ref(false);
const showSettings = ref(false);
const scriptsLoaded = ref(false);

const serverUrl = ref(localStorage.getItem('boldreports_server_url') || '');
const siteName = ref(localStorage.getItem('boldreports_site_name') || '');
const authToken = ref(localStorage.getItem('boldreports_auth_token') || '');

const isConfigured = computed(() => serverUrl.value && siteName.value && authToken.value);
const currentReport = computed(() => reports.value.find(r => r.Id === reportId.value));

async function loadBoldReportsFromCDN() {
	const version = '11.1.10';
	
	const boldReportsCss = document.createElement('link');
	boldReportsCss.rel = 'stylesheet';
	boldReportsCss.href = `https://cdn.boldreports.com/${version}/content/v2.0/tailwind-light/bold.report-viewer.min.css`;
	document.head.appendChild(boldReportsCss);

	const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		script.onload = () => resolve();
		script.onerror = reject;
		document.head.appendChild(script);
	});

	await loadScript(`https://cdn.boldreports.com/${version}/scripts/v2.0/common/bold.reports.common.min.js`);
	await loadScript(`https://cdn.boldreports.com/${version}/scripts/v2.0/common/bold.reports.widgets.min.js`);
	await loadScript(`https://cdn.boldreports.com/${version}/scripts/v2.0/bold.report-viewer.min.js`);

	scriptsLoaded.value = true;
}

async function loadReports() {
	if (!isConfigured.value) return;

	loadingReports.value = true;
	try {
		const response = await fetch(`${serverUrl.value}/reporting/api/site/${siteName.value}/v5.0/items?itemType=Report`, {
			headers: {
				'Authorization': `Bearer ${authToken.value}`,
			},
		});

		if (!response.ok) throw new Error('Failed to fetch reports');

		const data = await response.json();
		reports.value = data || [];

		const categoriesMap = new Map<string, BoldReportCategory>();
		data.forEach((report: BoldReportItem) => {
			const categoryName = report.CategoryName || 'Uncategorized';
			if (!categoriesMap.has(categoryName)) {
				categoriesMap.set(categoryName, {
					CategoryId: categoryName,
					Name: categoryName,
					Reports: [],
				});
			}
			categoriesMap.get(categoryName)!.Reports.push(report);
		});
		categories.value = Array.from(categoriesMap.values());
	} catch (error) {
		console.error('Error loading reports:', error);
	} finally {
		loadingReports.value = false;
	}
}

function initializeReportViewer() {
	if (!scriptsLoaded.value || !isConfigured.value || !reportId.value) return;

	const viewer = $('#report-viewer');
	viewer.empty();

	viewer.boldReportViewer({
		reportServiceUrl: `${serverUrl.value}/reporting/reportservice/api/Viewer`,
		reportServerUrl: `http://localhost:6505/reporting/api/site/${siteName.value}`,
		serviceAuthorizationToken: `bearer ${authToken.value}`,
		reportPath: reportId.value,
	});
}

function selectReport(id: string) {
	router.push(`/report-viewer/${id}`);
}

function saveSettings() {
	localStorage.setItem('boldreports_server_url', serverUrl.value);
	localStorage.setItem('boldreports_site_name', siteName.value);
	localStorage.setItem('boldreports_auth_token', authToken.value);
	showSettings.value = false;
	loadReports();
}

watch(reportId, () => {
	if (reportId.value && scriptsLoaded.value) {
		initializeReportViewer();
	}
});

watch(isConfigured, (configured) => {
	if (configured) {
		loadReports();
	}
});

onMounted(async () => {
	await loadBoldReportsFromCDN();
	if (isConfigured.value) {
		await loadReports();
		if (reportId.value) {
			initializeReportViewer();
		}
	}
});

onUnmounted(() => {
	const viewer = $('#report-viewer');
	if (viewer.length && viewer.data('boldReportViewer')) {
		viewer.data('boldReportViewer').destroy();
	}
});
</script>

<style scoped>
.report-viewer-container {
	height: 100%;
	padding: var(--content-padding);
	padding-top: 0;
}

.config-message,
.no-report-message {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 1rem;
	color: var(--theme--foreground-subdued);
}

.config-message .v-icon,
.no-report-message .v-icon {
	--v-icon-color: var(--theme--primary);
	margin-bottom: 1rem;
}

.report-viewer {
	height: calc(100vh - 200px);
	width: 100%;
}
</style>
