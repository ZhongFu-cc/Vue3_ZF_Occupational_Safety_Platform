<template>
  <div class="update-panel">
    <el-empty v-if="!hasData" description="請先選擇要編輯的用戶" :image-size="100" />

    <el-form v-else ref="updateFormRef" :model="formData" :rules="rules" class="update-form" label-position="top"
      @submit.prevent status-icon>
      <el-form-item label="課程分類名稱" prop="name">
        <el-input v-model="formData.name" placeholder="請輸入課程分類名稱" clearable maxlength="100" show-word-limit />
      </el-form-item>
      <el-form-item label="課程分類描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="請輸入課程分類描述" maxlength="500"
          show-word-limit />
      </el-form-item>
      <el-form-item label="課程分類時長(分鐘)" prop="minRequiredMinutes">
        <el-input-number v-model="formData.minRequiredMinutes" :min="1" :step="10" controls-position="right" />
      </el-form-item>
      <el-form-item label="狀態" prop="isActive">
        <el-radio-group v-model="formData.isActive">
          <el-radio :value="1" border>啟用</el-radio>
          <el-radio :value="0" border>停用</el-radio>
        </el-radio-group>
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


const props = defineProps<{
  courseCategory?: UpdateCourseCategory;
  submitting?: boolean;
}>();


const emit = defineEmits(['submit', 'cancel']);

const EMPTY_COURSE_CATEGORY: UpdateCourseCategory = {
  courseCategoryId: '',
  name: '',
  description: '',
  minRequiredMinutes: 0,
  isActive: 1,
};


const updateFormRef = ref<FormInstance>();
const formData = reactive<UpdateCourseCategory>({ ...EMPTY_COURSE_CATEGORY });

const hasData = computed(() => Boolean(props.courseCategory?.courseCategoryId));

const rules = reactive<FormRules<UpdateCourseCategory>>({
  name: [{ required: true, message: '請輸入課程分類名稱', trigger: 'blur' }],
  description: [{ required: true, message: '請輸入課程分類描述', trigger: 'blur' }],
  minRequiredMinutes: [{ required: true, message: '請輸入最少所需分鐘數', trigger: 'blur' }],
});

const syncFormData = (courseCategory: UpdateCourseCategory) => {
  formData.courseCategoryId = courseCategory?.courseCategoryId ?? '';
  formData.name = courseCategory?.name ?? '';
  formData.description = courseCategory?.description ?? '';
  formData.minRequiredMinutes = courseCategory?.minRequiredMinutes ?? 0;
  formData.isActive = courseCategory?.isActive ?? 1;
};

watch(
  () => props.courseCategory,
  (value) => {
    syncFormData(value || ({} as UpdateCourseCategory));
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

  const { res, error }: any = await tryCatch(updateCourseCategoryApi(formData));
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