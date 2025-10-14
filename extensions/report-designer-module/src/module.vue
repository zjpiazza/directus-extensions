<template>
	<private-view title="Report Designer">
		<div id="designer" style="width: 100%; height: calc(100vh - 64px); position: relative;"></div>
	</private-view>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
import $ from 'jquery';

export default defineComponent({
	setup() {
		let resizeObserver: ResizeObserver | null = null;
		let resizeTimeout: number | null = null;

		const handleResize = () => {
			if (resizeTimeout) {
				clearTimeout(resizeTimeout);
			}

			resizeTimeout = window.setTimeout(() => {
				const designerObj = $("#designer").data("boldReportDesigner");
				if (designerObj && designerObj.refreshLayout) {
					designerObj.refreshLayout();
				}
			}, 250);
		};

		onMounted(() => {
			if (window.location.pathname.includes("/report-designer")) {
				document.body.classList.add("hide-sidebar-view");
			}

			$("#designer").boldReportDesigner({
				serviceUrl: "http://localhost:8090/reporting/reportservice/api/Designer",
				reportServerUrl: "http://localhost:6505/reporting/api/site/site1",
				serviceAuthorizationToken: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRlbW9AYm9sZHJlcG9ydHMuY29tIiwibmFtZWlkIjoiMSIsInVuaXF1ZV9uYW1lIjoiOTJjNjQ1MmQtZGUzNi00N2U0LThhOTYtMzdkOThhNDQ4NTBkIiwiSVAiOiI6OjEiLCJpc3N1ZWRfZGF0ZSI6IjE3NjAxMDM2MzIiLCJuYmYiOjE3NjAxMDM2MzIsImV4cCI6MTc2MDc0NTYwMCwiaWF0IjoxNzYwMTAzNjMyLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwOTAvcmVwb3J0aW5nL3NpdGUvc2l0ZTEiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjgwOTAvcmVwb3J0aW5nL3NpdGUvc2l0ZTEifQ.6LYhohyFOg22-SuRnbQEXnRBbn2QkuWChaXWr9soWYI",
				configurePaneSettings: { showPane: false }
			});

			window.addEventListener('resize', handleResize);

			const sidebar = document.querySelector('aside#sidebar');
			if (sidebar) {
				resizeObserver = new ResizeObserver(handleResize);
				resizeObserver.observe(sidebar);
			}
		});

		onBeforeUnmount(() => {
			document.body.classList.remove("hide-sidebar-view");

			window.removeEventListener('resize', handleResize);

			if (resizeObserver) {
				resizeObserver.disconnect();
			}

			if (resizeTimeout) {
				clearTimeout(resizeTimeout);
			}
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

body.hide-sidebar-view aside#sidebar {
	display: none !important;
}

span.e-rptdesigner-itempanel-textitem {
	line-height: normal;
	width: 80%;
}
</style>
