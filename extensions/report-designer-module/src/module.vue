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
				reportServerUrl: "http://localhost:8090/reporting/api/site/site1",
				serviceAuthorizationToken: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImE2Y2U0MTIyLTUzYTItNDkxYS1iZDEzLWEyMWNhYjgyMzI4ZiIsIm5hbWVpZCI6ImE2Y2U0MTIyLTUzYTItNDkxYS1iZDEzLWEyMWNhYjgyMzI4ZiIsInVwbiI6InpqcGlhenphIiwiZW1haWwiOiJ6YWNoQHBpYXp6YWNvbnN1bHRpbmcuY29tIiwiZmlyc3RfbmFtZSI6IlphY2hhcnkiLCJmYW1pbHlfbmFtZSI6IlBpYXp6YSIsImdpdmVuX25hbWUiOiJaYWNoYXJ5IFBpYXp6YSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiIiwiYXZhdGFyX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA5MC91c2VyL2F2YXRhcj9pZD1hNmNlNDEyMi01M2EyLTQ5MWEtYmQxMy1hMjFjYWI4MjMyOGYiLCJsYXN0X21vZGlmaWVkX2RhdGUiOiIxNzU5NDE2Mjg1IiwiaXNzdWVkX2RhdGUiOiIxNzU5NDI2MjkyIiwic3ViIjoiYTZjZTQxMjItNTNhMi00OTFhLWJkMTMtYTIxY2FiODIzMjhmIiwibmJmIjoxNzU5NDI2MjkyLCJleHAiOjE3NTk0Mjk4OTIsImlhdCI6MTc1OTQyNjI5MiwiaXNzIjoibG9jYWxob3N0In0._nyxF-Bb72bQnXy5N5SBbFnW9yGOG0wQxXmt-Hc2ezo"
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
