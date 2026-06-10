<template>
  <div class="update-panel">
    <el-empty v-if="!hasData" description="請先選擇要編輯的職位類型" :image-size="100" />

    <el-form v-else ref="updateFormRef" :model="formData" :rules="rules" label-width="92px" class="update-form"
      @submit.prevent status-icon label-position="top">

      <el-form-item label="請輸入職位類型名稱" prop="name">
        <el-input v-model="formData.name" placeholder="請輸入職位類型名稱" clearable />
      </el-form-item>

      <el-form-item label="請輸入職位類型描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="請輸入職位類型描述" clearable />
      </el-form-item>

      <el-form-item label="請選擇是否啟用" prop="isActive">
        <el-switch v-model="formData.isActive" active-color="#13ce66" inactive-color="#ff4949" :active-value="1"
          :inactive-value="0" />
      </el-form-item>

      <div class="action-row">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="props.submitting" @click="handleSubmit">儲存變更</el-button>
      </div>
    </el-form>
  </div>
</template>
<script setup lang='ts'>
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { tryCatch } from '@/utils/tryCatch';
import { UpdateJobType } from '@/api/jobType/type';
import { updateJobTypeApi } from '@/api/jobType';


const props = defineProps<{
  jobType: UpdateJobType;
  submitting?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const EMPTY_FORM: UpdateJobType = {
  jobTypeId: '',
  name: '',
  description: '',
  isActive: 1,
};

const updateFormRef = ref<FormInstance>();
const formData = reactive<UpdateJobType>({ ...EMPTY_FORM });

const hasData = computed(() => Boolean(props.jobType?.jobTypeId));

const rules = reactive<FormRules<UpdateJobType>>({
  name: [{ required: true, message: '請輸入職位類型名稱', trigger: 'blur' }],
  description: [{ required: true, message: '請輸入職位類型描述', trigger: 'blur' }],
  isActive: [{ required: true, message: '請選擇是否啟用', trigger: 'change' }]
});

const syncFormData = (jobType: UpdateJobType) => {
  Object.assign(formData, jobType);
};

watch(
  () => props.jobType,
  (value) => {
    syncFormData(value || ({} as UpdateJobType));
    updateFormRef.value?.clearValidate();
  },
  { immediate: true, deep: true }
);

const handleCancel = () => {
  emit('cancel');
};

const handleSubmit = async () => {
  if (!updateFormRef.value) {
    return;
  }

  const valid = await updateFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const { res, error }: any = await tryCatch(updateJobTypeApi(formData));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法更新職位類型資訊',
      type: 'error',
    });
    return;
  }

  updateFormRef.value.resetFields();
  ElNotification({
    title: '成功',
    message: '職位類型資訊已更新',
    type: 'success',
  });
  emit('submit');
};
</script>
<style lang='scss' scoped>
.update-panel {
  min-height: 220px;
}

.update-form {
  padding-top: 8px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .action-row {
    justify-content: space-between;
  }
}
</style>