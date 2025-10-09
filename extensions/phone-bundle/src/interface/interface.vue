<template>
	<v-input
		ref="inputRef"
		:model-value="displayValue"
		:placeholder="placeholder"
		type="text"
		font-monospace
		:maxlength="format === 'us' ? 14 : 20"
		@update:model-value="handleInput"
		@focus="handleFocus"
		@blur="handleBlur"
	>
		<template v-if="hasError" #append>
			<v-icon name="error" color="var(--theme--danger)" />
		</template>
	</v-input>
	<span v-if="hasError" class="error-message">Invalid phone number format</span>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

export default defineComponent({
	props: {
		value: {
			type: String,
			default: null,
		},
		format: {
			type: String,
			default: 'us',
		},
		placeholder: {
			type: String,
			default: '(555) 555-5555',
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const inputRef = ref<HTMLInputElement | null>(null);
		const isFocused = ref(false);
		const hasError = ref(false);

		const formatUSPhone = (value: string | null): string => {
			if (!value) return '';
			const digits = value.replace(/\D/g, '');
			
			if (digits.length <= 3) {
				return digits;
			} else if (digits.length <= 6) {
				return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
			} else {
				return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
			}
		};

		const formatInternationalPhone = (value: string | null): string => {
			if (!value) return '';
			const digits = value.replace(/\D/g, '');
			
			if (digits.length <= 1) {
				return digits;
			} else if (digits.length <= 4) {
				return `+${digits.slice(0, 1)} ${digits.slice(1)}`;
			} else if (digits.length <= 7) {
				return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
			} else {
				return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
			}
		};

		const formatPhone = (value: string | null): string => {
			if (props.format === 'international') {
				return formatInternationalPhone(value);
			}
			return formatUSPhone(value);
		};

		const validatePhone = (value: string | null): boolean => {
			if (!value) return true;
			const digits = value.replace(/\D/g, '');
			
			if (props.format === 'international') {
				return digits.length === 0 || (digits.length >= 10 && digits.length <= 15);
			}
			return digits.length === 0 || digits.length === 10;
		};

		const displayValue = computed(() => {
			if (!props.value) return '';
			return formatPhone(props.value);
		});

		const handleInput = (value: string | null): void => {
			if (!value) {
				hasError.value = false;
				emit('input', null);
				return;
			}
			
			const digits = value.replace(/\D/g, '');
			
			hasError.value = !validatePhone(digits);
			emit('input', digits);
		};

		const handleFocus = (): void => {
			isFocused.value = true;
		};

		const handleBlur = (): void => {
			isFocused.value = false;
			if (props.value) {
				hasError.value = !validatePhone(props.value);
			}
		};

		watch(() => props.value, (newValue) => {
			if (newValue && !isFocused.value) {
				hasError.value = !validatePhone(newValue);
			}
		});

		return {
			inputRef,
			displayValue,
			hasError,
			handleInput,
			handleFocus,
			handleBlur,
		};
	},
});
</script>

<style scoped>
.error-message {
	display: block;
	margin-top: 4px;
	font-size: 12px;
	color: var(--theme--danger);
}
</style>
