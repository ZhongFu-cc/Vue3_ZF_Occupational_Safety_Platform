<template>
  <div class="update-panel">
    <el-empty v-if="!hasData" description="請先選擇要編輯的用戶" :image-size="100" />

    <el-form v-else ref="updateFormRef" :model="formData" :rules="rules" class="update-form" label-position="top"
      @submit.prevent status-icon>
      <el-form-item class="upload-box">
        <!-- <img class="cover-image" :src="minioAPI + props.course?.coverImage" alt=""> -->
        <el-upload class="thumbnail-uploader" :action="envAPI + '/upload/img'" :show-file-list="false"
          :on-success="handleImageUpload">
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="課程名稱" prop="title">
        <el-input v-model="formData.title" placeholder="請輸入課程名稱" />
      </el-form-item>

      <el-form-item label="課程描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="請輸入課程描述" />
      </el-form-item>

      <el-form-item label="課程時長(分鐘)" prop="totalMinutes">
        <el-input v-model.number="formData.totalMinutes" placeholder="請輸入課程時長" type="number" />
      </el-form-item>

      <el-form-item label="課程狀態">
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
import { ElNotification, UploadProps, UploadRawFile, type FormInstance, type FormRules } from 'element-plus';
import { computed, reactive, ref, watch } from 'vue';
import { tryCatch } from '@/utils/tryCatch';
import { Course, UpdateCourse } from '@/api/course/course/type';
import { updateCourseApi } from '@/api/course/course';


const props = defineProps<{
  course?: Course;
  submitting?: boolean;
}>();



const emit = defineEmits(['submit', 'cancel']);

const EMPTY_COURSE_CATEGORY: UpdateCourse = {
  courseId: '',
  courseCategoryId: '',
  title: '',
  description: '',
  totalMinutes: 0,
  isActive: 1,
};


const updateFormRef = ref<FormInstance>();
const formData = reactive<UpdateCourse>({ ...EMPTY_COURSE_CATEGORY });

const hasData = computed(() => Boolean(props.course?.courseId));

const rules = reactive<FormRules<UpdateCourse>>({
  title: [{ required: true, message: '請輸入課程名稱', trigger: 'blur' }],
  description: [{ required: true, message: '請輸入課程描述', trigger: 'blur' }],
  totalMinutes: [{ required: true, message: '請輸入課程時長', trigger: 'blur' }],
});

const syncFormData = (course: UpdateCourse) => {
  formData.courseId = course?.courseId ?? '';
  formData.courseCategoryId = course?.courseCategoryId ?? '';
  formData.title = course?.title ?? '';
  formData.description = course?.description ?? '';
  formData.totalMinutes = course?.totalMinutes ?? 0;
  formData.isActive = course?.isActive ?? 1;
};

watch(
  () => props.course,
  (value) => {
    syncFormData(value || ({} as UpdateCourse));
    updateFormRef.value?.clearValidate();
  },
  { immediate: true, deep: true }
);

const handleCancel = () => {
  emit('cancel');
};

const imageUrl = ref();
let imgFile = <UploadRawFile>{}
const envAPI = import.meta.env.VITE_APP_BASE_API;
const minioAPI = import.meta.env.VITE_MINIO_API_URL;
const handleImageUpload: UploadProps['onSuccess'] = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
  imgFile = uploadFile.raw!;
}

const handleSubmit = async () => {
  if (!updateFormRef.value) {
    return;
  }

  const valid = await updateFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const payload = new FormData();
  payload.append('data', JSON.stringify(formData));

  const { res, error }: any = await tryCatch(updateCourseApi(payload));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法更新課程資訊',
      type: 'error',
    });
    return;
  }

  updateFormRef.value.resetFields();
  ElNotification({
    title: '成功',
    message: '課程資訊已更新',
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

.cover-image {
  width: 178px;
  border-radius: 6px;
  margin-bottom: 16px;
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