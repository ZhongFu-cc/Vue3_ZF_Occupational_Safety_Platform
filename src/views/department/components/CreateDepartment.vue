<template>
  <div class="create-panel">
    <el-form ref="createFormRef" :model="formData" :rules="rules" class="create-form" label-position="top"
      @submit.prevent status-icon>


      <el-form-item label="部門名稱" prop="name">
        <el-input v-model="formData.name" placeholder="請輸入部門名稱" clearable maxlength="100" show-word-limit />
      </el-form-item>


      <el-form-item label="狀態" prop="isActive">
        <el-radio-group v-model="formData.isActive">
          <el-radio :value="1" border>啟用</el-radio>
          <el-radio :value="0" border>停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <div class="action-row">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="props.submitting" @click="handleSubmit">建立部門</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, type FormInstance, type FormRules, type UploadProps, type UploadRawFile, type UploadUserFile } from 'element-plus';
import { reactive, ref } from 'vue';
import type { AddCourse } from '@/api/course/course/type';
import type { CourseCategory } from '@/api/course/category/type';
import { createCourseApi } from '@/api/course/course';
import { tryCatch } from '@/utils/tryCatch';
import { findCourseCategoryListByQueryTextAndPaginationApi } from '@/api/course/category';

import { AddDepartment } from '@/api/department/type';
import useStore from 'element-plus/es/components/table/src/store';
import { useUserStore } from '@/store';
import { createDepartmentApi } from '@/api/department';

const props = defineProps<{
  submitting?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);
const userStore = useUserStore();

const INITIAL_FORM: AddDepartment = {
  companyId: userStore.user?.companyId || '',
  name: '',
  isActive: 1,
};

const createFormRef = ref<FormInstance>();
const formData = reactive<AddDepartment>({ ...INITIAL_FORM });


const rules = reactive<FormRules<AddDepartment>>({
  name: [
    { required: true, message: '請輸入部門名稱', trigger: 'change' },
    { max: 100, message: '部門名稱不能超過 100 字', trigger: 'change' },
  ],
  isActive: [{ required: true, message: '請選擇部門狀態', trigger: 'change' }],
});

const resetForm = () => {
  Object.assign(formData, INITIAL_FORM);
  createFormRef.value?.clearValidate();
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

const imageUrl = ref();
let imgFile = <UploadRawFile>{}
const envAPI = import.meta.env.VITE_APP_BASE_API;
const handleImageUpload: UploadProps['onSuccess'] = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
  imgFile = uploadFile.raw!;
}

const handleSubmit = async () => {
  if (!createFormRef.value) {
    return;
  }

  const valid = await createFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }


  const { res, error }: any = await tryCatch(createDepartmentApi(formData));
  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法建立部門',
      type: 'error',
    });
    return;
  }

  ElNotification({
    title: '成功',
    message: '部門已建立',
    type: 'success',
  });

  resetForm();
  emit('submit');

};

const currentPage = ref(1);



defineExpose({
  resetForm,
});

</script>

<style scoped lang="scss">
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
