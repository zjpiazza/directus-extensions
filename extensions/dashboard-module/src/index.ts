import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'dashboard',
	name: 'Dashboard',
	icon: 'dashboard',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
	],
});
