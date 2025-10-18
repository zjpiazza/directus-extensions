import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'email-input',
	name: 'Email',
	icon: 'email',
	description: 'Email input field with validation',
	component: InterfaceComponent,
	recommendedDisplays: ['email-display'],
	types: ['string'],
	group: 'standard',
	options: ({ field }) => [
		{
			field: 'placeholder',
			name: 'Placeholder',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					placeholder: 'Enter placeholder text...',
				},
			},
		},
		{
			field: 'iconLeft',
			name: 'Icon Left',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-icon',
			},
		},
		{
			field: 'required',
			name: 'Required',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
			},
			schema: {
				default_value: false,
			},
		},
	],
	validation: (value: string, options: any) => {
		if (options?.required && !value) {
			return 'Email is required';
		}

		if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			return 'Please enter a valid email address';
		}

		return true;
	},
});
