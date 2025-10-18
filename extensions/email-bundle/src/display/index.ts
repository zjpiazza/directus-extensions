import { defineDisplay } from '@directus/extensions-sdk';
import DisplayComponent from './display.vue';

export default defineDisplay({
	id: 'email-display',
	name: 'Email',
	icon: 'email',
	description: 'Format and optionally obfuscate email addresses',
	component: DisplayComponent,
	types: ['string'],
	options: [
		{
			field: 'obfuscate',
			name: 'Obfuscate',
			type: 'boolean',
			meta: {
				interface: 'boolean',
				width: 'half',
				options: { label: 'Mask local part (j***@domain.com)' },
			},
			schema: { default_value: false },
		},
	],
	handler: (value: string | null, options: any) => {
		if (!value) return '';
		const str = String(value);
		if (options?.obfuscate) {
			const [local, domain] = str.split('@');
			if (!domain) return str;
			const maskedLocal = local.length <= 1 ? '*' : local[0] + '*'.repeat(Math.max(1, local.length - 1));
			return `${maskedLocal}@${domain}`;
		}
		return str;
	},
});
