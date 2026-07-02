<template>
  <div class="chapter-item">
    <h2 class="chapter-title">
      {{ chapter.title }}
    </h2>

    <component :is="currentComponent" v-if="currentComponent" :key="chapter.courseChapterId" :chapter="chapter"
      :chapter-progress="chapterProgress" :course-enrollment-id="courseEnrollmentId" :quiz-result="quizResult"
      @submit-success="handleSubmitSuccess" @retry="handleRetry" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from "vue";
import { ElNotification } from "element-plus";

import {
  getChapterProgressApi,
  learningChapterApi,
} from "@/api/chapterProgress";

import {
  heartbeatApi,
  endWatchApi,
} from "@/api/chapterWatchLog";

import type { ChapterProgress } from "@/api/chapterProgress/type";

import type {
  ChapterWatchLog,
  HeartbeatVO,
} from "@/api/chapterWatchLog/type";

import type { CourseChapterVO } from "@/api/course/chapter/type";

import { tryCatch } from "@/utils/tryCatch";

import ChapterQuiz from "./ChapterQuiz.vue";
import ChapterVideo from "./ChapterVideo.vue";
import ChapterQuizResult from "./ChapterQuizResult.vue";

const props = defineProps<{
  chapter: CourseChapterVO;
  courseEnrollmentId: string;
}>();

const emits = defineEmits<{
  loadingCompleted: [];
  loadingFailed: [];
}>();

const showError = (message: string) => {
  ElNotification.error({
    title: "錯誤",
    message,
  });
};

const chapterProgress = reactive<ChapterProgress>(
  {} as ChapterProgress
);

const courseWatchLog = ref<ChapterWatchLog>(
  {} as ChapterWatchLog
);

const heartbeat = reactive<HeartbeatVO>(
  {} as HeartbeatVO
);

const quizResult = ref<Record<string, any> | null>(
  null
);

const isLoaded = ref(false);

const heartbeatInterval = ref<
  ReturnType<typeof setInterval> | null
>(null);

const currentComponent = computed(() => {
  if (quizResult.value) {
    return ChapterQuizResult;
  }

  switch (props.chapter.contentType) {
    case "quiz":
      return ChapterQuiz;

    case "video":
      return ChapterVideo;

    default:
      return null;
  }
});

const startHeartbeat = () => {
  stopHeartbeat();

  heartbeatInterval.value = setInterval(() => {
    sendHeartbeat();
  }, 60000);
};

const stopHeartbeat = () => {
  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value);
    heartbeatInterval.value = null;
  }
};

const getChapterProgress = async () => {
  const { res, error }: any = await tryCatch(
    getChapterProgressApi(
      props.courseEnrollmentId,
      props.chapter.courseChapterId
    )
  );

  if (error || res?.code !== 200) {
    showError(
      res?.message || "獲取章節進度失敗"
    );

    emits("loadingFailed");
    return;
  }

  if (!res?.data) {
    emits("loadingFailed");
    return;
  }

  Object.assign(chapterProgress, res.data);

  await startLearning();
};

const startLearning = async () => {
  const { res, error }: any = await tryCatch(
    learningChapterApi({
      chapterProgressId:
        chapterProgress.chapterProgressId,
    })
  );

  if (error || res?.code !== 200) {
    showError(
      res?.message || "開始學習章節失敗"
    );

    emits("loadingFailed");
    return;
  }

  courseWatchLog.value = res.data;

  if (courseWatchLog.value?.chapterWatchLogId) {
    startHeartbeat();
  } else {
    stopHeartbeat();
  }

  isLoaded.value = true;

  emits("loadingCompleted");
};

const sendHeartbeat = async () => {
  const watchLogId =
    courseWatchLog.value?.chapterWatchLogId;

  if (!watchLogId) return;

  const { res, error }: any = await tryCatch(
    heartbeatApi({
      chapterWatchLogId: watchLogId,
    })
  );

  if (error || res?.code !== 200) {
    showError(res?.message || "心跳失敗");
    return;
  }

  Object.assign(heartbeat, res.data);
};

const endHeartbeat = async () => {
  const watchLogId =
    courseWatchLog.value?.chapterWatchLogId;

  if (!watchLogId || !isLoaded.value) {
    stopHeartbeat();
    return;
  }

  const { res, error }: any = await tryCatch(
    endWatchApi({
      chapterWatchLogId: watchLogId,
    })
  );

  if (error || res?.code !== 200) {
    showError(
      res?.message || "結束學習紀錄失敗"
    );
  }

  stopHeartbeat();
};

const handleWindowUnload = () => {
  const watchLogId =
    courseWatchLog.value?.chapterWatchLogId;

  if (!watchLogId) return;

  try {
    navigator.sendBeacon(
      "/api/chapterWatchLog/end",
      JSON.stringify({
        chapterWatchLogId: watchLogId,
      })
    );
  } catch (error) {
    console.error(error);
  }
};

const handleSubmitSuccess = (
  data: Record<string, any>
) => {
  quizResult.value = data;
};

const handleRetry = () => {
  quizResult.value = null;
};

const init = async () => {
  isLoaded.value = false;
  quizResult.value = null;

  await getChapterProgress();
};

onMounted(() => {
  init();

  window.addEventListener(
    "beforeunload",
    handleWindowUnload
  );
});

onBeforeUnmount(async () => {
  stopHeartbeat();

  await endHeartbeat();

  window.removeEventListener(
    "beforeunload",
    handleWindowUnload
  );
});
</script>

<style lang="scss" scoped>
.chapter-item {
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.chapter-title {
  margin-bottom: 1rem;
}
</style>