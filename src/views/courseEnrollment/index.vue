<template>
  <div>
    <BasicComponent title="已報名課程">
      <template #data-table>
        <div v-if="hasData" class="course-box">
          <el-card v-for="course in courseEnrollmentList" class="course-card" @click="headToCourseLearn(course)">
            <template #header>
              <div class="image-box">
                <el-image class="cover-image" :src="`${minioEnv}${course.courseCoverImage}`"></el-image>
              </div>
            </template>
            <template #default>
              <div class="course-info">
                <h2 class="course-title">{{ course.courseName }}</h2>
                <div class="course-detail">
                  <p>總章節數: {{ course.totalChapters }}</p>
                </div>
              </div>
            </template>
          </el-card>
        </div>
        <el-empty v-else description="沒有已報名的課程"></el-empty>
      </template>
    </BasicComponent>
  </div>
</template>
<script lang="ts" setup>
import { findCourseEnrollmentByOwnerAndPaginationApi } from "@/api/courseEnrollment";
import { CourseEnrollmentVO } from "@/api/courseEnrollment/type";
import BasicComponent from "@/layout/components/Basic/index.vue";
import { tryCatch } from "@/utils/tryCatch";
import { ElNotification } from "element-plus";

const minioEnv = import.meta.env.VITE_MINIO_API_URL;

const courseEnrollmentList = ref<CourseEnrollmentVO[]>([]);
const currentPage = ref(1);
const status = ref<'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | undefined>();
const hasData = computed(() => courseEnrollmentList.value.length > 0);


const getCourseEnrollmentList = async () => {
  const { res, error }: any = await tryCatch(findCourseEnrollmentByOwnerAndPaginationApi(currentPage.value, 10, status.value));
  if (error || res.code !== 200) {
    ElNotification.error({
      title: "錯誤",
      message: res?.message || "獲取已報名課程列表失敗",
    });
    return;
  }

  courseEnrollmentList.value = res.data.records;

};

const router = useRouter();
const headToCourseLearn = (course: any) => {
  router.push({
    path: "/course-learn-page",
    query: {
      courseId: course.courseId,
      courseEnrollmentId: course.courseEnrollmentId,
    },
  })
};

onMounted(() => {
  getCourseEnrollmentList();
});
</script>
<style lang="scss" scoped>
.course-box {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.course-card {
  width: 20rem;
  border-radius: 8px;
  overflow: hidden;

  :deep(.el-card__header) {
    padding: 0.2rem;
  }
}

.image-box {
  aspect-ratio: 16/9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .el-image {
    width: 100%;
    height: 100%;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    :deep(.el-image__inner) {
      object-fit: cover;
    }
  }
}

.course-info {
  // padding: 0.5rem;

  .course-title {
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }

  .course-detail {
    color: rgb(158, 154, 154);
  }
}
</style>