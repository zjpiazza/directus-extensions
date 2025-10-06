<template>
	<private-view title="Report Designer">
		<div id="designer" style="width: 100%; height: calc(100vh - 64px); position: relative;"></div>
	</private-view>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import $ from 'jquery';

export default defineComponent({
	setup() {
		onMounted(() => {
			$("#designer").boldReportDesigner({
				serviceUrl: "http://localhost:8090/reporting/reportservice/api/Designer",
				reportServerUrl: "http://localhost:6505/reporting/api/site/site1",
				serviceAuthorizationToken: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InphY2hAcGlhenphY29uc3VsdGluZy5jb20iLCJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJkMjZkZjM0MS0yMWY1LTQyNWUtYTNkZS01Yjc0ZTc5Njk4YWYiLCJJUCI6Ijo6MSIsImlzc3VlZF9kYXRlIjoiMTc1OTc2MzQwNCIsIm5iZiI6MTc1OTc2MzQwNCwiZXhwIjoxNzYwNDAwMDAwLCJpYXQiOjE3NTk3NjM0MDQsImlzcyI6Imh0dHA6Ly8xOTIuMTY4LjEuMjI1OjgwOTAvcmVwb3J0aW5nL3NpdGUvc2l0ZTEiLCJhdWQiOiJodHRwOi8vMTkyLjE2OC4xLjIyNTo4MDkwL3JlcG9ydGluZy9zaXRlL3NpdGUxIn0.Zn7_aC9T2tEv_llbx-azzmQncIOLzNMC-AxU0LGL8hE",
				configurePaneSettings: { showPane: false }
			});
		});
	}
});
</script>

<style>
#designer {
	display: block;
	height: inherit;
	width: inherit;
}
</style>
