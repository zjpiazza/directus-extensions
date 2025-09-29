import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'directus-labs-address-completion-interface',
	name: 'Address completion',
	icon: 'box',
	description: 'Use Smarty US Autocomplete API as an Address Completion interface!',
	component: InterfaceComponent,
	options: [
		{
			field: 'iconLeft',
			name: '$t:icon_left',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-icon',
			},
		},
		{
			field: 'iconRight',
			name: '$t:icon_right',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-icon',
			},
		},
		{
			field: 'maxResults',
			name: 'Max Results',
			type: 'integer',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'Maximum number of address suggestions to return (1-10)',
			},
			schema: {
				default_value: 10,
			},
		},
		{
			field: 'includeOnlyStates',
			name: 'Include Only States',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				note: 'Limit results to specific states (e.g., "CA;NY;TX"). See Smarty documentation for filtering options.',
			},
		},
		{
			field: 'includeOnlyCities',
			name: 'Include Only Cities',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				note: 'Limit results to specific cities and states (e.g., "DENVER,AURORA,CO;OMAHA,NE")',
			},
		},
	],
	types: ['json'],
});
