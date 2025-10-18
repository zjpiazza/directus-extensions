import { defineDisplay } from '@directus/extensions-sdk';
import DisplayComponent from './display.vue';

function formatSSN(digits: string) {
	if (digits.length <= 3) return digits;
	if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
	return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
}

function maskSSN(digits: string) {
	if (digits.length !== 9) return formatSSN(digits);
	return `XXX-XX-${digits.slice(5, 9)}`;
}

export default defineDisplay({
	id: 'ssn-display',
	name: 'SSN',
	icon: 'badge',
	description: 'Format and optionally mask SSN',
	component: DisplayComponent,
	types: ['string'],
	options: [
		{
			field: 'masked',
			name: 'Masked',
			type: 'boolean',
			meta: {
				interface: 'boolean',
				width: 'half',
				options: { label: 'Show as XXX-XX-1234' },
			},
			schema: { default_value: true },
		},
	],
	handler: (value: string | null, options: any) => {
		if (!value) return '';
		const digits = String(value).replace(/\D/g, '');
		return options?.masked !== false ? maskSSN(digits) : formatSSN(digits);
	},
});
