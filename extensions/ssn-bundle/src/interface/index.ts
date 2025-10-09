import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'ssn',
	name: 'Social Security Number',
	icon: 'badge',
	description: 'Input field for Social Security Numbers with formatting and validation',
	component: InterfaceComponent,
	types: ['string'],
	recommendedDisplays: ['formatted-value'],
	options: [
		{
			field: 'required',
			name: 'Required',
			type: 'boolean',
			meta: {
				interface: 'boolean',
				width: 'half',
				options: {
					label: 'Require valid SSN'
				}
			},
			schema: {
				default_value: true
			}
		},
		{
			field: 'masked',
			name: 'Masked Display',
			type: 'boolean',
			meta: {
				interface: 'boolean',
				width: 'half',
				options: {
					label: 'Show as XXX-XX-XXXX when not focused'
				}
			},
			schema: {
				default_value: false
			}
		},
		{
			field: 'placeholder',
			name: 'Placeholder',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'half',
				options: {
					placeholder: '000-00-0000'
				}
			},
			schema: {
				default_value: '000-00-0000'
			}
		}
	],
});
