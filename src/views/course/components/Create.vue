<template>
  <div class="create-panel">
    <el-form ref="createFormRef" :model="formData" :rules="rules" class="create-form" label-position="top"
      @submit.prevent status-icon>
      <el-form-item class="upload-box">
        <el-upload class="thumbnail-uploader" :action="envAPI + '/upload/img'" :show-file-list="false"
          :on-success="handleImageUpload">
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="課程分類 ID" prop="courseCategoryId">
        <el-select v-model="formData.courseCategoryId" placeholder="請選擇課程分類" clearable
          @end-reached="fetchCourseCategoryList()">
          <el-option v-for="item in courseCategoryList" :key="item.courseCategoryId" :label="item.name"
            :value="item.courseCategoryId"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="課程名稱" prop="title">
        <el-input v-model="formData.title" placeholder="請輸入課程名稱" clearable maxlength="100" show-word-limit />
      </el-form-item>

      <el-form-item label="課程描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="請輸入課程描述" maxlength="500"
          show-word-limit />
      </el-form-item>

      <el-form-item label="課程時長(分鐘)" prop="totalMinute">
        <el-input-number v-model="formData.totalMinutes" :min="1" :step="10" controls-position="right" />
      </el-form-item>

      <el-form-item label="狀態" prop="isActive">
        <el-radio-group v-model="formData.isActive">
          <el-radio :value="1" border>啟用</el-radio>
          <el-radio :value="0" border>停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <div class="action-row">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="props.submitting" @click="handleSubmit">建立課程</el-button>
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
import { findCourseListByQueryTextAndPaginationApi } from '@/api/course/category';

import InfiniteScrollSelect from '@/components/InfiniteScrollingSelect/index.vue';

const props = defineProps<{
  submitting?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const INITIAL_FORM: AddCourse = {
  courseCategoryId: '',
  title: '',
  description: '',
  totalMinutes: 60,
  isActive: 1,
};

const createFormRef = ref<FormInstance>();
const formData = reactive<AddCourse>({ ...INITIAL_FORM });

watch(() => formData.courseCategoryId, (newVal) => {
  console.log('選擇的課程分類 ID:', newVal);
});

const rules = reactive<FormRules<AddCourse>>({
  courseCategoryId: [{ required: true, message: '請輸入課程分類 ID', trigger: 'blur' }],
  title: [{ required: true, message: '請輸入課程名稱', trigger: 'blur' }],
  description: [{ required: true, message: '請輸入課程描述', trigger: 'blur' }],
  totalMinutes: [
    { required: true, message: '請輸入課程時長', trigger: 'change' },
    {
      validator: (_, value, callback) => {
        if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
          callback(new Error('課程時長需為大於 0 的數字'));
          return;
        }
        callback();
      },
      trigger: 'change',
    },
  ],
  isActive: [{ required: true, message: '請選擇狀態', trigger: 'change' }],
});

const resetForm = () => {
  Object.assign(formData, INITIAL_FORM);
  createFormRef.value?.clearValidate();
};

const handleCancel = () => {
  resetForm();
  testList.value = 20;
  console.log('handleCancel')
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
  const payload = new FormData();
  payload.append('data', JSON.stringify(formData));
  if (imgFile) {
    payload.append('imgFile', imgFile);
  }

  const { res, error }: any = await tryCatch(createCourseApi(payload));
  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法建立課程',
      type: 'error',
    });
    return;
  }

  ElNotification({
    title: '成功',
    message: '課程已建立',
    type: 'success',
  });

  resetForm();
  emit('submit');

};

const currentPage = ref(1);
const courseCategoryList = ref<CourseCategory[]>([]);
const hasMore = ref(true)
const fetchCourseCategoryList = async (isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1;
    courseCategoryList.value = [];
  }
  if (!hasMore.value && !isRefresh) {
    console.log('沒有更多課程分類了')
    return;
  }
  const { res, error }: any = await tryCatch(
    findCourseListByQueryTextAndPaginationApi(currentPage.value, 20, '')
  );
  console.log('fetchCourseCategoryList res', res, 'error', error);
  console.log()

  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法取得課程分類列表',
      type: 'error',
    });
    return;
  }

  // courseCategoryList.value = res.data.records;
  courseCategoryList.value.push(...res.data.records);
  hasMore.value = courseCategoryList.value.length < res.data.total;
  console.log(hasMore.value, 'hasMore.value')
  if (hasMore.value) {
    currentPage.value++;
  }
};

interface CustomScrollElement extends Element {
  _hasScrollListener?: boolean;
}

const testList = ref<number>(20)



defineExpose({
  resetForm,
});

onMounted(() => {
  fetchCourseCategoryList(true)
})
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
