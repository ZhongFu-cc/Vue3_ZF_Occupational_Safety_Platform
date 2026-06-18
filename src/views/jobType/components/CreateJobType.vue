<template>
  <div class="create-panel">
    <el-form ref="createFormRef" :model="formData" :rules="rules" label-width="92px" class="create-form" @submit.prevent
      status-icon label-position="top">
      <el-form-item label="作業類別名稱" prop="name">
        <el-input v-model="formData.name" placeholder="請輸入作業類別名稱" clearable />
      </el-form-item>

      <el-form-item label="作業類別描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="請輸入作業類別描述" clearable />
      </el-form-item>

      <el-form-item label="是否啟用" prop="isActive">
        <el-switch v-model="formData.isActive" active-color="#13ce66" inactive-color="#ff4949" :active-value="1"
          :inactive-value="0" />
      </el-form-item>



      <div class="action-row">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">新增職位類型</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { tryCatch } from '@/utils/tryCatch';
import { AddJobType } from '@/api/jobType/type';
import { createJobTypeApi } from '@/api/jobType';



const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();


const EMPTY_FORM: AddJobType = {
  name: '',
  description: '',
  isActive: 1,
};

const createFormRef = ref<FormInstance>();
const formData = reactive<AddJobType>({ ...EMPTY_FORM });

const rules = reactive<FormRules<AddJobType>>({
  name: [{ required: true, message: '請輸入作業類別名稱', trigger: 'blur' }],
  description: [{ required: true, message: '請輸入作業類別描述', trigger: 'blur' }]
});


const resetForm = () => {
  Object.assign(formData, EMPTY_FORM);
  createFormRef.value?.clearValidate();
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

const handleSubmit = async () => {
  if (!createFormRef.value) {
    return;
  }

  const valid = await createFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const { res, error }: any = await tryCatch(createJobTypeApi(formData));

  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法新增作業類別',
      type: 'error',
    });
    return;
  }

  ElNotification({
    title: '成功',
    message: '作業類別已新增',
    type: 'success',
  });

  resetForm();
  emit('submit');
};

</script>

<style lang="scss" scoped>
.create-panel {
  min-height: 220px;
}

.create-form {
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
