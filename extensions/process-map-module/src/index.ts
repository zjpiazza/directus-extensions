import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'process-map-module',
	name: 'Process Map',
	icon: 'account_tree',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
	],
});
