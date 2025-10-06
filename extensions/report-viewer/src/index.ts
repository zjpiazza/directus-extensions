import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'report-viewer',
	name: 'Reports',
	icon: 'analytics',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
		{
			path: ':reportId',
			component: ModuleComponent,
		},
	],
});
