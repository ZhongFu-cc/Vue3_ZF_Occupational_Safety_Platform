<template>
  <div class="update-panel">
    <el-empty v-if="!hasData" description="請先選擇要編輯的用戶" :image-size="100" />

    <el-form v-else ref="updateFormRef" :model="formData" :rules="rules" class="update-form" label-position="top"
      @submit.prevent status-icon>


      <el-form-item label="部門名稱" prop="name">
        <el-input v-model="formData.name" placeholder="請輸入部門名稱" />
      </el-form-item>



      <el-form-item label="部門狀態">
        <el-switch v-model="formData.isActive" :active-value="1" :inactive-value="0"></el-switch>
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
import { computed, reactive, ref, watch } from 'vue';
import { tryCatch } from '@/utils/tryCatch';
import { Department, UpdateDepartment } from '@/api/department/type';
import { updateDepartmentApi } from '@/api/department';


const props = defineProps<{
  department?: Department;
  submitting?: boolean;
}>();



const emit = defineEmits(['submit', 'cancel']);

const EMPTY_DEPARTMENT: UpdateDepartment = {
  departmentId: '',
  name: '',
  isActive: 1,
};


const updateFormRef = ref<FormInstance>();
const formData = reactive<UpdateDepartment>({ ...EMPTY_DEPARTMENT });

const hasData = computed(() => Boolean(props.department?.departmentId));

const rules = reactive<FormRules<Department>>({
  name: [{ required: true, message: '請輸入部門名稱', trigger: 'blur' }],
});





const syncFormData = (department: UpdateDepartment) => {
  formData.departmentId = department?.departmentId ?? '';
  formData.name = department?.name ?? '';
  formData.isActive = department?.isActive ?? 1;
};

watch(
  () => props.department,
  (value) => {
    syncFormData(value || ({} as UpdateDepartment));
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

  const { res, error }: any = await tryCatch(updateDepartmentApi(formData));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法更新部門資訊',
      type: 'error',
    });
    return;
  }

  updateFormRef.value.resetFields();
  ElNotification({
    title: '成功',
    message: '部門資訊已更新',
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

.upload-box {
  :deep(.el-form-item__content) {
    display: flex;
    justify-content: center;
    padding: 1rem 0;

  }
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}


.thumbnail-uploader {
  .avatar {
    width: 100%;
    display: block;
  }

  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    height: 178px;
    aspect-ratio: 16/9;

    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
  }

  .el-upload:hover {
    border-color: var(--el-color-primary);
  }

}
</style>