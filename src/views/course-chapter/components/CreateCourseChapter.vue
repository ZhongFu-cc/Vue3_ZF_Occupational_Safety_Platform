<template>
  <div class="create-panel">
    <el-form ref="createFormRef" :model="formData" :rules="rules" class="create-form" label-position="top"
      @submit.prevent status-icon>
      <el-form-item label="章節名稱" prop="title">
        <el-input v-model="formData.title" placeholder="請輸入章節名稱" @input="console.log(formData)" />
      </el-form-item>

      <el-form-item label="上層章節" prop="parentId">
        <el-tree-select v-model="formData.parentId" :data="props.chapterList" :render-after-expand="false"
          style="width: 240px" value-key="courseChapterId" label="title"
          :props="{ label: 'title', children: 'children' }" :clearable="true" placeholder="選擇父級章節">
        </el-tree-select>
      </el-form-item>

      <el-form-item label="章節類別" prop="contentType">
        <el-select v-model="formData.contentType" placeholder="請選擇章節類別">
          <el-option label="章節" value="directory"></el-option>
          <el-option label="影片" value="video"></el-option>
          <el-option label="測驗" value="quiz"></el-option>
        </el-select>
      </el-form-item>

      <div class="action-row">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">建立課程分類</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, type FormInstance, type FormRules, type UploadProps, type UploadRawFile, type UploadUserFile } from 'element-plus';
import { reactive, ref } from 'vue';
import { createCourseChapterApi } from '@/api/course/chapter';
import type { AddCourseChapter, CourseChapterVO } from '@/api/course/chapter/type';
import { tryCatch } from '@/utils/tryCatch';
import { findCourseCategoryListByQueryTextAndPaginationApi } from '@/api/course/category';

const props = defineProps<{
  courseId: string;
  chapterList: CourseChapterVO[];
  parentId?: string;
}>();

const parentId = ref(props.parentId || '')

const emit = defineEmits(['submit', 'cancel']);

const INITIAL_FORM: AddCourseChapter = {
  courseId: props.courseId,
  parentId: props.parentId || '',
  formId: '',
  title: '',
  chapterOrder: 100,
  contentType: '',
};

const createFormRef = ref<FormInstance>();
const formData = reactive<AddCourseChapter>({ ...INITIAL_FORM });


const rules = reactive<FormRules<AddCourseChapter>>({
  title: [
    { required: true, message: '請輸入課程分類名稱', trigger: 'blur' },
    { min: 2, max: 100, message: '課程分類名稱長度應為 2-100 字', trigger: 'blur' },
  ],
  parentId: [
    { required: true, message: '請選擇父級章節', trigger: 'change' },
  ],
  contentType: [
    { required: true, message: '請選擇章節類別', trigger: 'change' },
  ],
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


  const { res, error }: any = await tryCatch(createCourseChapterApi(formData));
  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法建立課程分類',
      type: 'error',
    });
    return;
  }

  ElNotification({
    title: '成功',
    message: '課程分類已建立',
    type: 'success',
  });

  resetForm();
  emit('submit');

};



interface CustomScrollElement extends Element {
  _hasScrollListener?: boolean;
}

const testList = ref<number>(20)



defineExpose({
  resetForm,
});

onMounted(() => {
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
