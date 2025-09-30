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
				serviceUrl: "https://demos.boldreports.com/services/api/ReportingAPI"
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
