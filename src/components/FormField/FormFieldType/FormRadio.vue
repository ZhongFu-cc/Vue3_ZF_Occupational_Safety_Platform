<template>
  <el-radio-group v-model="model" value-key="id">
    <el-radio v-for="(opt, index) in field.options?.choices ?? []" :key="opt.id" :value="opt.label">
      {{ opt.label }}
    </el-radio>
  </el-radio-group>
</template>

<script setup lang="ts">
import type { FormField } from '@/api/formField/types'

const props = defineProps<{
  modelValue: any
  field: FormField
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()


const model = computed({
  get: () => props.modelValue?.label || '',  // set: v => emit('update:modelValue', v)
  set: v => {
    console.log("v: ", v)
    const selectedChoice = props.field.options?.choices?.find(choice => choice.label === v)
    emit('update:modelValue', selectedChoice)
  }
})
</script>

<style lang="scss" scoped>
.el-radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  :deep(.el-radio-group__label) {
    margin-bottom: 8px;
  }

  :deep(.el-radio__label) {
    font-size: 1rem;

  }
}
</style>
