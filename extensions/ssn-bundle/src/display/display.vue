<template>
	<span>{{ displayed }}</span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

function formatSSN(digits: string) {
	if (digits.length <= 3) return digits;
	if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
	return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
}

function maskSSN(digits: string) {
	if (digits.length !== 9) return formatSSN(digits);
	return `XXX-XX-${digits.slice(5, 9)}`;
}

export default defineComponent({
	props: {
		value: { type: String, default: null },
		masked: { type: Boolean, default: true },
	},
	setup(props) {
		const displayed = computed(() => {
			if (!props.value) return '';
			const digits = String(props.value).replace(/\D/g, '');
			return props.masked ? maskSSN(digits) : formatSSN(digits);
		});

		return { displayed };
	},
});
</script>
