import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'workflow',
	name: 'Workflow',
	icon: 'bolt',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
		{
			path: ':id',
			component: ModuleComponent,
		},
	],
	options: [
		{
			field: 'collection',
			type: 'string',
			name: 'Workflows Collection',
			meta: {
				interface: 'system-collection',
				options: {
					includeSystem: false,
					includeSingleton: false,
				},
				width: 'full',
			},
		},
	],
});
