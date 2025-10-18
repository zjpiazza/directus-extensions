<template>
	<span>{{ displayed }}</span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

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

export default defineComponent({
	props: {
		value: { type: String, default: null },
		format: { type: String, default: 'us' },
	},
	setup(props) {
		const displayed = computed(() => {
			if (!props.value) return '';
			const digits = String(props.value).replace(/\D/g, '');
			return props.format === 'international' ? formatInternational(digits) : formatUS(digits);
		});

		return { displayed };
	},
});
</script>
