<template>
  <div class="update-panel">
    <el-empty v-if="!hasData" description="請先選擇要編輯的用戶" :image-size="100" />

    <el-form v-else ref="updateFormRef" :model="formData" :rules="rules" class="update-form" label-position="top"
      @submit.prevent status-icon>
      <el-form-item label="章節名稱" prop="title">
        <el-input v-model="formData.title" placeholder="請輸入章節名稱" clearable maxlength="100" show-word-limit />
      </el-form-item>
      <el-form-item label="上層章節" prop="parentId">
        <el-tree-select v-model="formData.parentId" :data="props.chapterList" :render-after-expand="false"
          style="width: 240px" node-key="courseChapterId" :props="{ label: 'title', children: 'children' }"
          :clearable="true" placeholder="選擇父級章節" check-strictly>
        </el-tree-select>
      </el-form-item>

      <el-form-item label="章節類別" prop="contentType">
        <el-select v-model="formData.contentType" placeholder="請選擇章節類別">
          <el-option label="章節" value="directory"></el-option>
          <el-option label="影片" value="video"></el-option>
          <el-option label="測驗" value="quiz"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="章節順序(數字越小越靠前)" prop="chapterOrder">
        <el-input-number v-model="formData.chapterOrder" :min="0" :step="1" controls-position="right" />
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
import { UpdateCourseCategory } from '@/api/course/category/type';
import { updateCourseCategoryApi } from '@/api/course/category';
import { UpdateCourseChapter } from '@/api/course/chapter/type';
import { updateCourseChapterApi } from '@/api/course/chapter';


const props = defineProps<{
  courseChapter: UpdateCourseChapter;
  submitting?: boolean;
  chapterList?: UpdateCourseChapter[];
}>();



const emit = defineEmits(['submit', 'cancel']);

const EMPTY_COURSE_CHAPTER: UpdateCourseChapter = {
  courseChapterId: '',
  title: '',
  chapterOrder: 0,
  contentType: '',
  parentId: '',
  courseId: '',
};


const updateFormRef = ref<FormInstance>();
const formData = reactive<UpdateCourseChapter>({ ...EMPTY_COURSE_CHAPTER });

const hasData = computed(() => Boolean(props.courseChapter?.courseChapterId));

const rules = reactive<FormRules<UpdateCourseChapter>>({
  title: [{ required: true, message: '請輸入章節名稱', trigger: 'blur' }],
  chapterOrder: [{ required: true, message: '請輸入章節順序', trigger: 'blur' }],
  contentType: [{ required: true, message: '請選擇章節類型', trigger: 'blur' }],
});

const syncFormData = (courseChapter: UpdateCourseChapter) => {
  formData.courseChapterId = courseChapter?.courseChapterId ?? '';
  formData.title = courseChapter?.title ?? '';
  formData.chapterOrder = courseChapter?.chapterOrder ?? 0;
  formData.contentType = courseChapter?.contentType ?? '';
  formData.parentId = courseChapter?.parentId ?? '';
  formData.courseId = courseChapter?.courseId ?? '';
};

watch(
  () => props.courseChapter,
  (value) => {
    syncFormData(value || ({} as UpdateCourseChapter));
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

  const { res, error }: any = await tryCatch(updateCourseChapterApi(formData));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法更新用戶資訊',
      type: 'error',
    });
    return;
  }

  updateFormRef.value.resetFields();
  ElNotification({
    title: '成功',
    message: '用戶資訊已更新',
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