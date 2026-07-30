<template>
  <BasicComponent v-if="course.title" :title="course.title">
    <template #main-section>
      <div class="main-box">
        <el-menu class="menu" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
          <MenuItem v-for="(chapter, index) in courseChapterList" :key="chapter.courseChapterId" :item="chapter"
            :current-index="String(index)" v-loading.fullscreen.lock="loading"
            element-loading-background="rgba(122, 122, 122, 0.8)" element-loading-text="載入中..." />
        </el-menu>

        <div class="content">
          <ChapterItem v-if="clickedChapter" :key="clickedChapter.courseChapterId" :chapter="clickedChapter"
            :courseEnrollmentId="courseEnrollmentId" @loading-completed="endLoading" @loading-failed="loadingFail" />
        </div>
      </div>
    </template>
  </BasicComponent>
</template>
<script lang="ts" setup>
import { CourseChapterVO } from "@/api/course/chapter/type";
import { findCourseByIdApi } from "@/api/course/course";
import { Course } from "@/api/course/course/type";
import BasicComponent from "@/layout/components/Basic/index.vue";
import { tryCatch } from "@/utils/tryCatch";
import { ElNotification } from "element-plus";
import MenuItem from "./components/MenuItem.vue";
import ChapterItem from "./components/ChapterItem.vue";
import { getChapterByEnrollmentIdApi } from "@/api/chapterProgress/index.js";

const route = useRoute();
const courseId = ref<string>(route.query.courseId as string);
const courseEnrollmentId = ref<string>(route.query.courseEnrollmentId as string);

const loading = ref<boolean>(false);
const endLoading = () => {
  loading.value = false;
};

const loadingFail = () => {
  loading.value = false;
  ElNotification.error({
    title: "錯誤",
    message: "獲取章節資訊失敗",
  });
  clickedChapter.value = null;
};

const course = reactive<Course>({} as Course);
const findCorseById = async () => {
  const { res, error }: any = await tryCatch(findCourseByIdApi(courseId.value));
  if (error || res.code !== 200) {
    ElNotification.error({
      title: "錯誤",
      message: res?.message || "獲取課程資訊失敗",
    });
    return;
  }
  Object.assign(course, res.data);
};

const courseChapterList = ref<CourseChapterVO[]>([]);
const findCourseChapterListByCourseId = async () => {
  const { res, error }: any = await tryCatch(getChapterByEnrollmentIdApi(courseEnrollmentId.value));
  if (error || res.code !== 200) {
    ElNotification.error({
      title: "錯誤",
      message: res?.message || "獲取課程章節列表失敗",
    });
    return;
  }
  console.log("findCourseChapterListByCourseId", res.data);
  courseChapterList.value = res.data;
};



const clickedChapter = ref<CourseChapterVO | null>(null);
const handleItemClick = (item: any) => {
  if (item.courseChapterId === clickedChapter.value?.courseChapterId) {
    return;
  }
  loading.value = true;
  clickedChapter.value = item;
};

// 2. 把這個函式「廣播」給所有子孫組件，鑰匙叫做 'onChapterClick'
provide('onChapterClick', handleItemClick);

onMounted(() => {
  findCorseById();
  findCourseChapterListByCourseId();
});

</script>

<style lang="scss" scoped>
.main-box {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  padding: 0.3rem;
  display: flex;

  .content {
    width: 75%;
    padding: 1rem;
  }
}

.menu {
  width: 25%;
  min-height: 90vh;
  padding: 1rem;
  border-radius: 8px;
}

.is-completed-tag {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  color: #fff;
  font-size: 0.9rem;
}
</style>