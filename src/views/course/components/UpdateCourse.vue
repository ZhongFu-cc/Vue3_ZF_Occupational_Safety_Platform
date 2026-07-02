<template>
  <div class="update-panel">
    <el-empty v-if="!hasData" description="請先選擇要編輯的課程" :image-size="100" />

    <el-form v-else ref="updateFormRef" :model="formData" :rules="rules" class="update-form" label-position="top"
      status-icon @submit.prevent>
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
        <el-input v-model.number="formData.totalMinutes" type="number" placeholder="請輸入課程時長" />
      </el-form-item>

      <el-form-item label="課程狀態">
        <el-switch v-model="formData.isActive" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <div class="action-row">
        <el-button @click="handleCancel">
          取消
        </el-button>

        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          儲存變更
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {
  ElNotification,
  type FormInstance,
  type FormRules,
  type UploadProps,
  type UploadRawFile,
} from "element-plus";

import {
  computed,
  reactive,
  ref,
  watch,
} from "vue";

import {
  updateCourseApi,
} from "@/api/course/course";

import type {
  Course,
  UpdateCourse,
} from "@/api/course/course/type";

import { tryCatch } from "@/utils/tryCatch";

const props = defineProps<{
  course?: Course;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "cancel"): void;
}>();

const envAPI = import.meta.env.VITE_APP_BASE_API;
const minioAPI = import.meta.env.VITE_MINIO_API_URL;

const EMPTY_COURSE: UpdateCourse = {
  courseId: "",
  courseCategoryId: "",
  title: "",
  description: "",
  totalMinutes: 0,
  isActive: 1,
};

const updateFormRef = ref<FormInstance>();

const imageUrl = ref<string>();

const imgFile = ref<UploadRawFile>();

const formData = reactive<UpdateCourse>({
  ...EMPTY_COURSE,
});

const hasData = computed(
  () => !!props.course?.courseId
);

const rules = reactive<FormRules<UpdateCourse>>({
  title: [
    {
      required: true,
      message: "請輸入課程名稱",
      trigger: "blur",
    },
  ],

  description: [
    {
      required: true,
      message: "請輸入課程描述",
      trigger: "blur",
    },
  ],

  totalMinutes: [
    {
      required: true,
      message: "請輸入課程時長",
      trigger: "blur",
    },
  ],
});

const showError = (message: string) => {
  ElNotification({
    title: "錯誤",
    message,
    type: "error",
  });
};

const showSuccess = (message: string) => {
  ElNotification({
    title: "成功",
    message,
    type: "success",
  });
};

const syncFormData = (
  course?: Course
) => {
  Object.assign(formData, {
    courseId: course?.courseId ?? "",
    courseCategoryId:
      course?.courseCategoryId ?? "",
    title: course?.title ?? "",
    description:
      course?.description ?? "",
    totalMinutes:
      course?.totalMinutes ?? 0,
    isActive: course?.isActive ?? 1,
  });
};

const handleImageUpload: UploadProps["onSuccess"] =
  (_, uploadFile) => {
    if (!uploadFile.raw) {
      return;
    }

    imageUrl.value = URL.createObjectURL(
      uploadFile.raw
    );

    imgFile.value = uploadFile.raw;
  };

const handleCancel = () => {
  updateFormRef.value?.resetFields();

  imageUrl.value = undefined;
  imgFile.value = undefined;

  emit("cancel");
};

const handleSubmit = async () => {
  if (!updateFormRef.value) {
    return;
  }

  const valid =
    await updateFormRef.value
      .validate()
      .catch(() => false);

  if (!valid) {
    return;
  }

  const payload = new FormData();

  payload.append(
    "data",
    JSON.stringify(formData)
  );

  if (imgFile.value) {
    payload.append(
      "imgFile",
      imgFile.value
    );
  }

  const { res, error }: any =
    await tryCatch(
      updateCourseApi(payload)
    );

  if (error || res?.code !== 200) {
    showError(
      res?.message || "無法更新課程資訊"
    );
    return;
  }

  showSuccess("課程資訊已更新");

  emit("submit");
};

watch(
  () => props.course,
  (course) => {
    syncFormData(course);

    updateFormRef.value?.clearValidate();

    imgFile.value = undefined;

    imageUrl.value =
      course?.coverImage
        ? minioAPI + course.coverImage
        : undefined;
  },
  {
    immediate: true,
  }
);

onBeforeMount(() => {
  if (imageUrl.value?.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl.value);
  }
})
</script>

<style lang="scss" scoped>
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

.upload-box {
  :deep(.el-form-item__content) {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
  }
}

.el-icon.avatar-uploader-icon {
  width: 178px;
  height: 178px;

  font-size: 28px;
  color: #8c939d;

  text-align: center;
}

.thumbnail-uploader {
  .avatar {
    width: 100%;
    height: 100%;

    object-fit: cover;
  }

  :deep(.el-upload) {
    display: flex;
    align-items: center;
    justify-content: center;

    max-width: 400px;
    height: 220px;

    overflow: hidden;

    border: 2px dashed #ccc;
    border-radius: 8px;

    aspect-ratio: 16 / 9;
  }

  .el-upload:hover {
    border-color: var(--el-color-primary);
  }
}

@media (max-width: 768px) {
  .action-row {
    justify-content: space-between;
  }
}
</style>