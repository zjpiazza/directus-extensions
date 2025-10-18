<template>
	<span>{{ displayed }}</span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

function obfuscateEmail(value: string): string {
	const [local, domain] = value.split('@');
	if (!domain) return value;
	if (local.length <= 1) return `*@${domain}`;
	return `${local[0]}${'*'.repeat(Math.max(1, local.length - 1))}@${domain}`;
}

export default defineComponent({
	props: {
		value: { type: String, default: null },
		obfuscate: { type: Boolean, default: false },
	},
	setup(props) {
		const displayed = computed(() => {
			if (!props.value) return '';
			return props.obfuscate ? obfuscateEmail(props.value) : String(props.value);
		});

		return { displayed };
	},
});
</script>
