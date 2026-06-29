<template>
  <div class="chapter-item">
    <h2 class="chapter-title">{{ chapter.title }}</h2>
    <!-- <p class="chapter-content">{{ chapter.content }}</p> -->
    <video v-if="props.chapter.contentType === 'video'" id="my-video" class="video-js vjs-big-play-centered"></video>

  </div>
</template>
<script lang="ts" setup>
import { getChapterProgressApi, learningChapterApi } from '@/api/chapterProgress';
import { ChapterProgress } from '@/api/chapterProgress/type';
import { endWatchApi, heartbeatApi } from '@/api/chapterWatchLog';
import { ChapterWatchLog, HeartbeatVO } from '@/api/chapterWatchLog/type';
import { CourseChapterVO } from '@/api/course/chapter/type';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';
import { de } from 'element-plus/es/locale';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const props = defineProps<{
  chapter: CourseChapterVO;
  courseEnrollmentId: string;
}>();

let isMounted = true;
const emits = defineEmits(['loadingCompleted']);
const minioUrl = import.meta.env.VITE_MINIO_API_URL;
const player = ref<any>(null);

const initPlayer = () => {
  // 安全機制：如果已經初始化過，先銷毀舊的
  if (player.value) {
    player.value.dispose();
    player.value = null;
  }

  // 使用 nextTick 確保 v-if 改變後的 DOM 已經完全渲染到畫面上
  nextTick(() => {
    const videoEl = document.getElementById('my-video');

    // 確定抓得到 DOM 元素才進行初始化
    if (videoEl) {
      player.value = videojs('my-video', {
        sources: [{ src: `${minioUrl}${props.chapter.videoUrl}`, type: 'video/mp4' }],
        loop: true,
        muted: true,
        fluid: true,
        controls: true
      });
    }
  });
}

watch(
  () => props.chapter,
  (newChapter) => {
    console.log("props.chapter", newChapter);
    if (newChapter.contentType === 'video') {
      initPlayer();
    } else {
      // 如果不是影片類型，銷毀播放器
      if (player.value) {
        player.value.dispose();
        player.value = null;
      }
    }
  },
  { immediate: true }
);

const chapterProgress = reactive<ChapterProgress>({} as ChapterProgress);
const getChapterProgress = async () => {
  if (!isMounted) {
    console.warn('Component is unmounted, skipping getChapterProgress');
    return;
  };
  console.log("getChapterProgress", props.courseEnrollmentId, props.chapter.courseChapterId);
  const { res, error }: any = await tryCatch(getChapterProgressApi(props.courseEnrollmentId, props.chapter.courseChapterId));
  console.log("getChapterProgress", res, error);
  if (error || res.code !== 200) {
    ElNotification.error({
      title: "錯誤",
      message: res?.message || "獲取章節進度失敗",
    });

    return;
  }
  Object.assign(chapterProgress, res.data);
  startLearning();
};

const courseWatchLog = ref<ChapterWatchLog>({} as ChapterWatchLog);
const startLearning = async () => {
  console.log("startLearning", chapterProgress.chapterProgressId);
  if (!isMounted) {
    console.warn('Component is unmounted, skipping startLearning');
    return;
  };

  const { res, error }: any = await tryCatch(learningChapterApi({ chapterProgressId: chapterProgress.chapterProgressId }));

  if (error || res.code !== 200) {
    ElNotification.error({
      title: "錯誤",
      message: res?.message || "開始學習章節失敗",
    });
    return;
  }
  courseWatchLog.value = res.data;
  console.log("courseWatchLog.value", courseWatchLog.value);

  if (courseWatchLog.value.chapterWatchLogId) {
    // 如果有新的 chapterWatchLogId，開始心跳
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value);
    }
    heartbeatInterval.value = setInterval(sendHeartbeat, 60000); // 每60 秒發送一次心跳
  } else {
    // 如果沒有 chapterWatchLogId，停止心跳
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value);
      heartbeatInterval.value = null;
    }
  }
  emits('loadingCompleted');
}

const heartbeat = reactive<HeartbeatVO>({} as HeartbeatVO);
const sendHeartbeat = async () => {

  console.log(courseWatchLog.value.chapterWatchLogId, "sendHeartbeat");
  const { res, error }: any = await tryCatch(heartbeatApi({ chapterWatchLogId: courseWatchLog.value.chapterWatchLogId }));
  if (error || res.code !== 200) {
    ElNotification.error({
      title: "錯誤",
      message: res?.message || "心跳失敗",
    });
    return;
  }
  Object.assign(heartbeat, res.data);
}

const heartbeatInterval = ref<ReturnType<typeof setInterval> | null>(null);
// watch(
//   () => courseWatchLog.value.chapterWatchLogId,
//   (newVal) => {
//     if (newVal) {
//       // 如果有新的 chapterWatchLogId，開始心跳
//       if (heartbeatInterval.value) {
//         clearInterval(heartbeatInterval.value);
//       }
//       heartbeatInterval.value = setInterval(sendHeartbeat, 60000); // 每60 秒發送一次心跳
//     } else {
//       // 如果沒有 chapterWatchLogId，停止心跳
//       if (heartbeatInterval.value) {
//         clearInterval(heartbeatInterval.value);
//         heartbeatInterval.value = null;
//       }
//     }
//   },
//   { immediate: true }
// );

const endHeartbeat = async () => {

  if (!isMounted) {
    console.warn('Component is unmounted, skipping endHeartbeat');
    return;
  };
  console.log(courseWatchLog.value)
  console.log(courseWatchLog.value.chapterWatchLogId, "endHeartbeat");
  const { res, error }: any = await tryCatch(endWatchApi({ chapterWatchLogId: courseWatchLog.value.chapterWatchLogId }));
  if (error || res.code !== 200) {
    ElNotification.error({
      title: "錯誤",
      message: res?.message || "結束心跳失敗",
    });
    return;
  }

  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value);
    heartbeatInterval.value = null;
  }
};

const handleWindowUnload = () => {
  if (courseWatchLog.value && courseWatchLog.value.chapterWatchLogId) {
    const targetId = courseWatchLog.value.chapterWatchLogId;

    // 注意：在頁面關閉時，一般的 fetch/axios 非同步請求可能會被瀏覽器直接中斷
    // 最安全的方法是使用 navigator.sendBeacon (如果是 POST 且純傳送 JSON)
    // 或者確保後端有針對「心跳逾時」做自動關閉的機制（最推薦，容錯率最高）
    endWatchApi({ chapterWatchLogId: targetId });
  }
};


onMounted(() => {
  console.log("開新組建")
  isMounted = true;
  getChapterProgress();
  window.addEventListener('beforeunload', handleWindowUnload);
});

onBeforeUnmount(() => {
  console.log(courseWatchLog.value, "onBeforeUnmount");
  console.log("關閉組建")
  if (player.value) {
    player.value.dispose();
    player.value = null;
  }
  console.log("onBeforeUnmount");
  // if (courseWatchLog.value.chapterWatchLogId) {
  endHeartbeat();
  window.removeEventListener('beforeunload', handleWindowUnload);
  // } else {
  //   console.log("沒有 chapterWatchLogId，不需要結束心跳");
  // }
  isMounted = false;
});
</script>
<style lang="scss" scoped>
.chapter-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>