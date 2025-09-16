<template>
  <div class="separator-node">
    <div class="vertical-line"></div>
    <div 
      class="separator-text" 
      @click="startEditing"
      :class="{ 'editing': isEditing }"
    >
      <input 
        v-if="isEditing"
        ref="textInput"
        v-model="editText"
        @blur="saveText"
        @keyup.enter="saveText"
        @keyup.escape="cancelEdit"
        class="text-input"
      />
      <span v-else class="text-display">{{ displayText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted } from 'vue'

interface Props {
  data: {
    text?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['update-text'])

const isEditing = ref(false)
const editText = ref('')
const textInput = ref<HTMLInputElement | null>(null)

const displayText = computed(() => props.data.text || 'SIGNED SERVICE PLAN')

onMounted(() => {
  console.log('SeparatorNode mounted with data:', props.data)
})

const startEditing = async () => {
  if (isEditing.value) return
  
  isEditing.value = true
  editText.value = displayText.value
  
  await nextTick()
  if (textInput.value) {
    textInput.value.focus()
    textInput.value.select()
  }
}

const saveText = () => {
  if (!isEditing.value) return
  
  emit('update-text', editText.value.trim() || 'SIGNED SERVICE PLAN')
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  editText.value = ''
}
</script>

<style scoped>
.separator-node {
  position: relative;
  width: 8px;
  height: 450px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.vertical-line {
  position: absolute;
  width: 8px;
  height: 100%;
  background: #7c3aed;
  left: 0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.separator-text {
  position: absolute;
  top: 50%;
  left: -40px;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: center;
  white-space: nowrap;
  pointer-events: auto;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.separator-text:hover {
  background-color: rgba(124, 58, 237, 0.1);
}

.separator-text.editing {
  background-color: rgba(124, 58, 237, 0.2);
}

.text-display {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.5px;
}

.text-input {
  background: white;
  border: 2px solid #7c3aed;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.5px;
  min-width: 120px;
  text-align: center;
  outline: none;
}

.text-input:focus {
  border-color: #5b21b6;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}
</style>