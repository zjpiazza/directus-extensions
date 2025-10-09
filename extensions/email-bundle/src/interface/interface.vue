<template>
	<v-input
		:model-value="value"
		:placeholder="placeholder"
		:disabled="disabled"
		type="email"
		@update:model-value="handleInput"
		@blur="handleBlur"
	>
		<template v-if="iconLeft" #prepend>
			<v-icon :name="iconLeft" />
		</template>
		<template v-if="hasError" #append>
			<v-icon name="error" color="var(--theme--danger)" />
		</template>
	</v-input>
	<span v-if="hasError" class="error-message">{{ errorMessage }}</span>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
	props: {
		value: {
			type: String,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		placeholder: {
			type: String,
			default: 'Enter email address...',
		},
		iconLeft: {
			type: String,
			default: 'email',
		},
		required: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const hasError = ref(false);
		const errorMessage = ref('');

		const isValidEmail = (email: string): boolean => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(email);
		};

		const validateEmail = (value: string | null): void => {
			if (!value) {
				if (props.required) {
					hasError.value = true;
					errorMessage.value = 'Email is required';
				} else {
					hasError.value = false;
					errorMessage.value = '';
				}
				return;
			}

			if (!isValidEmail(value)) {
				hasError.value = true;
				errorMessage.value = 'Please enter a valid email address';
			} else {
				hasError.value = false;
				errorMessage.value = '';
			}
		};

		const handleInput = (newValue: string | null): void => {
			validateEmail(newValue);
			emit('input', newValue);
		};

		const handleBlur = (): void => {
			validateEmail(props.value);
		};

		watch(() => props.value, (newValue) => {
			validateEmail(newValue);
		});

		return {
			hasError,
			errorMessage,
			handleInput,
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
