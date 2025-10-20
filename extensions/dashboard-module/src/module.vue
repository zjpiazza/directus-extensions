<template>
	<private-view title="Dashboard">
		<div class="dash-grid">
			<div class="stats">
				<div class="stat">
					<div class="stat-title">Total Cases</div>
					<div class="stat-value">{{ stats.totalCases }}</div>
					<div class="stat-sub">excludes archived</div>
				</div>
				<div class="stat">
					<div class="stat-title">Active Cases</div>
					<div class="stat-value">{{ stats.activeCases }}</div>
					<div class="stat-sub">status = published</div>
				</div>
				<div class="stat">
					<div class="stat-title">Overdue Tasks</div>
					<div class="stat-value">{{ stats.overdueTasks }}</div>
					<div class="stat-sub">appointments past due</div>
				</div>
				<div class="stat">
					<div class="stat-title">Completed This Week</div>
					<div class="stat-value">{{ stats.completedThisWeek }}</div>
					<div class="stat-sub">placeholder metric — configurable</div>
				</div>
			</div>

			<div class="lists">
				<div class="list">
					<div class="list-header">
						<div class="title">Recent Cases</div>
						<router-link to="/content/cases" class="view-all">View All</router-link>
					</div>
					<div v-if="loading" class="pad">Loading…</div>
					<template v-else>
						<div>
							<div v-for="c in recentCases" :key="c.id" class="list-line">
								<div>
									<div class="item-title">{{ displayCaseTitle(c) }}</div>
									<div class="item-sub">Updated {{ formatRelative(c.date_updated) }}</div>
								</div>
								<router-link :to="`/content/cases/${c.id}`">View</router-link>
							</div>
						</div>
					</template>
				</div>

				<div class="list">
					<div class="list-header">
						<div class="title">Upcoming Tasks</div>
						<router-link to="/content/appointments" class="view-all">View All</router-link>
					</div>
					<div v-if="loading" class="pad">Loading…</div>
					<template v-else>
						<div>
							<div v-for="a in upcomingTasks" :key="a.id" class="list-line">
								<div>
									<div class="item-title">{{ a.case?.case_number ? `Case ${a.case.case_number}` : `Appointment #${a.id}` }}</div>
									<div class="item-sub">{{ formatDateTime(a.appointment_datetime) }}</div>
								</div>
								<router-link :to="`/content/appointments/${a.id}`">Open</router-link>
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>
	</private-view>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useApi } from '@directus/extensions-sdk';

export default defineComponent({
	setup() {
		const api = useApi();
		const loading = ref(true);
		const stats = reactive({
			totalCases: 0,
			activeCases: 0,
			overdueTasks: 0,
			completedThisWeek: 0,
		});
		const recentCases = ref<any[]>([]);
		const upcomingTasks = ref<any[]>([]);

		function nowIso() {
			return new Date().toISOString();
		}

		function sevenDaysAgoIso() {
			const d = new Date();
			d.setDate(d.getDate() - 7);
			return d.toISOString();
		}

		function formatRelative(iso: string) {
			if (!iso) return 'unknown';
			const d = new Date(iso);
			if (isNaN(d.getTime())) return 'unknown';
			const diffMs = Date.now() - d.getTime();
			const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
			if (diffDays <= 0) return 'today';
			if (diffDays === 1) return 'yesterday';
			return `${diffDays} days ago`;
		}

		function formatDateTime(iso: string) {
			if (!iso) return 'unknown';
			const d = new Date(iso);
			if (isNaN(d.getTime())) return 'unknown';
			return d.toLocaleString();
		}

		function displayCaseTitle(c: any) {
			return c.case_number ? `Case ${c.case_number}` : `Case #${c.id}`;
		}

	async function fetchStats() {
		// Total cases (exclude archived)
		const total = await api.get('items/cases', {
			params: {
				limit: '0',
				meta: 'total_count',
				'filter[status][_neq]': 'archived',
			},
		}) as any;
		stats.totalCases = total?.data?.meta?.total_count ?? 0;

		// Active cases (status = published)
		const active = await api.get('items/cases', {
			params: {
				limit: '0',
				meta: 'total_count',
				'filter[status][_eq]': 'published',
			},
		}) as any;
		stats.activeCases = active?.data?.meta?.total_count ?? 0;

		// Overdue tasks = appointments with datetime < now
		const overdue = await api.get('items/appointments', {
			params: {
				limit: '0',
				meta: 'total_count',
				'filter[appointment_datetime][_lt]': nowIso(),
			},
		}) as any;
		stats.overdueTasks = overdue?.data?.meta?.total_count ?? 0;

		// Placeholder: completed this week = items updated in last 7 days (appointments)
		const completed = await api.get('items/appointments', {
			params: {
				limit: '0',
				meta: 'total_count',
				'filter[date_updated][_gte]': sevenDaysAgoIso(),
			},
		}) as any;
		stats.completedThisWeek = completed?.data?.meta?.total_count ?? 0;
	}

	async function fetchLists() {
		const casesRes = await api.get('items/cases', {
			params: {
				limit: '5',
				sort: '-date_updated',
				fields: 'id,case_number,date_updated',
			},
		}) as any;
		recentCases.value = casesRes?.data ?? [];

		const upcomingRes = await api.get('items/appointments', {
			params: {
				limit: '5',
				sort: 'appointment_datetime',
				'filter[appointment_datetime][_gte]': nowIso(),
				fields: 'id,appointment_datetime,case.id,case.case_number',
			},
		}) as any;
		upcomingTasks.value = upcomingRes?.data ?? [];
	}

		onMounted(async () => {
			try {
				await Promise.all([fetchStats(), fetchLists()]);
			} finally {
				loading.value = false;
			}
		});

		return { loading, stats, recentCases, upcomingTasks, formatRelative, formatDateTime, displayCaseTitle };
	},
});
</script>

<style scoped>
.dash-grid { display: grid; gap: 16px; }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.stat { padding: 16px; }
.stat-title { opacity: 0.8; font-size: 12px; }
.stat-value { font-size: 28px; font-weight: 600; margin-top: 4px; }
.stat-sub { opacity: 0.7; font-size: 11px; margin-top: 2px; }
.lists { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.list { padding: 8px 0; }
.list-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.title { font-weight: 600; font-size: 18px; }
.view-all { text-decoration: none; font-size: 13px; }
.pad { padding: 16px; }
.list-line { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 8px 16px; }
.item-title { font-weight: 600; }
.item-sub { opacity: 0.75; font-size: 12px; }
@media (max-width: 1100px) {
	.stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	.lists { grid-template-columns: 1fr; }
}
</style>
