import { defineModule } from '@directus/extensions-sdk';
import DashboardView from './components/DashboardView.vue';
import CatalogView from './components/CatalogView.vue';
import GlossaryView from './components/GlossaryView.vue';
import TagsView from './components/TagsView.vue';
import DomainsView from './components/DomainsView.vue';

export default defineModule({
	id: 'datahub',
	name: 'DataHub',
	icon: 'storage',
	routes: [
		{
			path: '',
			redirect: '/datahub/dashboard',
		},
		{
			path: 'dashboard',
			name: 'DataHub Dashboard',
			component: DashboardView,
		},
		{
			path: 'catalog',
			name: 'Data Catalog',
			component: CatalogView,
		},
		{
			path: 'glossary',
			name: 'Business Glossary',
			component: GlossaryView,
		},
		{
			path: 'tags',
			name: 'Tag Management',
			component: TagsView,
		},
		{
			path: 'domains',
			name: 'Domain Governance',
			component: DomainsView,
		},
	],
	navigation: [
		{
			name: 'Dashboard',
			icon: 'dashboard',
			to: '/datahub/dashboard',
		},
		{
			name: 'Catalog',
			icon: 'table_chart',
			to: '/datahub/catalog',
		},
		{
			name: 'Glossary',
			icon: 'library_books',
			to: '/datahub/glossary',
		},
		{
			name: 'Tags',
			icon: 'local_offer',
			to: '/datahub/tags',
		},
		{
			name: 'Domains',
			icon: 'domain',
			to: '/datahub/domains',
		},
	],
});
