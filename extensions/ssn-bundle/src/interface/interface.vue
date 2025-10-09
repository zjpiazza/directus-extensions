<template>
	<v-input
		ref="inputRef"
		:model-value="displayValue"
		:placeholder="placeholder"
		type="text"
		font-monospace
		maxlength="11"
		@update:model-value="handleInput"
		@focus="handleFocus"
		@blur="handleBlur"
	>
		<template v-if="hasError" #append>
			<v-icon name="error" color="var(--theme--danger)" />
		</template>
	</v-input>
	<span v-if="hasError" class="error-message">Invalid SSN format (must be 9 digits)</span>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

export default defineComponent({
	props: {
		value: {
			type: String,
			default: null,
		},
		masked: {
			type: Boolean,
			default: false,
		},
		placeholder: {
			type: String,
			default: '000-00-0000',
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const inputRef = ref<HTMLInputElement | null>(null);
		const isFocused = ref(false);
		const hasError = ref(false);

		const formatSSN = (value: string | null): string => {
			if (!value) return '';
			const digits = value.replace(/\D/g, '');
			
			if (digits.length <= 3) {
				return digits;
			} else if (digits.length <= 5) {
				return `${digits.slice(0, 3)}-${digits.slice(3)}`;
			} else {
				return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
			}
		};

		const maskSSN = (value: string | null): string => {
			if (!value) return '';
			const digits = value.replace(/\D/g, '');
			if (digits.length === 9) {
				return `XXX-XX-${digits.slice(5, 9)}`;
			}
			return formatSSN(value);
		};

		const validateSSN = (value: string | null): boolean => {
			if (!value) return true;
			const digits = value.replace(/\D/g, '');
			return digits.length === 0 || digits.length === 9;
		};

		const displayValue = computed(() => {
			if (!props.value) return '';
			
			if (props.masked && !isFocused.value) {
				return maskSSN(props.value);
			}
			
			return formatSSN(props.value);
		});

		const handleInput = (value: string | null): void => {
			if (!value) {
				hasError.value = false;
				emit('input', null);
				return;
			}
			
			const digits = value.replace(/\D/g, '');
			
			hasError.value = !validateSSN(digits);
			emit('input', digits);
		};

		const handleFocus = (): void => {
			isFocused.value = true;
		};

		const handleBlur = (): void => {
			isFocused.value = false;
			if (props.value) {
				hasError.value = !validateSSN(props.value);
			}
		};

		watch(() => props.value, (newValue) => {
			if (newValue && !isFocused.value) {
				hasError.value = !validateSSN(newValue);
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
