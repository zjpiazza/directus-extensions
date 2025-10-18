import { defineDisplay } from '@directus/extensions-sdk';
import DisplayComponent from './display.vue';

function formatUS(digits: string) {
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
	return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function formatInternational(digits: string) {
	if (digits.length === 0) return '';
	if (digits.length <= 1) return `+${digits}`;
	if (digits.length <= 4) return `+${digits.slice(0, 1)} ${digits.slice(1)}`;
	if (digits.length <= 7) return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
	return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
}

export default defineDisplay({
	id: 'phone-display',
	name: 'Phone',
	icon: 'phone',
	description: 'Format phone numbers for display',
	component: DisplayComponent,
	types: ['string'],
	options: [
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
						{ text: 'International +X XXX XXX XXXX', value: 'international' },
					],
				},
			},
			schema: { default_value: 'us' },
		},
	],
	handler: (value: string | null, options: any) => {
		if (!value) return '';
		const digits = String(value).replace(/\D/g, '');
		const fmt = options?.format === 'international' ? 'international' : 'us';
		return fmt === 'international' ? formatInternational(digits) : formatUS(digits);
	},
});
