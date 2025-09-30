import './globals';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min.js';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.widgets.min.js';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-designer.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min';
import '@boldreports/javascript-reporting-controls/Content/v2.0/tailwind-light/bold.report-designer.min.css';

import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'report-designer',
	name: 'Report Designer',
	icon: 'description',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
	],
});
