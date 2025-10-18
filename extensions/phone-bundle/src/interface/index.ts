import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'phone',
	name: 'Phone Number',
	icon: 'phone',
	description: 'Input field for phone numbers with formatting and validation',
	component: InterfaceComponent,
	types: ['string'],
	recommendedDisplays: ['phone-display', 'formatted-value'],
	options: [
		{
			field: 'required',
			name: 'Required',
			type: 'boolean',
			meta: {
				interface: 'boolean',
				width: 'half',
				options: {
					label: 'Require valid phone number'
				}
			},
			schema: {
				default_value: true
			}
		},
		{
			field: 'format',
			name: 'Format',
			type: 'string',
			meta: {
				interface: 'select-dropdown',
				width: 'half',
				options: {
					choices: [
						{ text: 'US (XXX) XXX-XXXX', value: 'us' },
						{ text: 'International +X XXX XXX XXXX', value: 'international' }
					]
				}
			},
			schema: {
				default_value: 'us'
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
					placeholder: '(555) 555-5555'
				}
			},
			schema: {
				default_value: '(555) 555-5555'
			}
		}
	],
});
