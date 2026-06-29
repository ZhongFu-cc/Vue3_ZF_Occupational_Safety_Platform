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
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const props = defineProps<{
  chapter: CourseChapterVO;
  courseEnrollmentId: string;
}>();



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
        sources: [{ src: "http://www.html5videoplayer.net/videos/toystory.mp4" }],
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
  const { res, error }: any = await tryCatch(getChapterProgressApi(props.courseEnrollmentId, props.chapter.courseChapterId));

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
  const { res, error }: any = await tryCatch(learningChapterApi({ chapterProgressId: chapterProgress.chapterProgressId }));

  if (error || res.code !== 200) {
    ElNotification.error({
      title: "錯誤",
      message: res?.message || "開始學習章節失敗",
    });
    return;
  }
  Object.assign(courseWatchLog.value, res.data);
}

const heartbeat = reactive<HeartbeatVO>({} as HeartbeatVO);
const sendHeartbeat = async () => {
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
watch(
  () => courseWatchLog.value.chapterWatchLogId,
  (newVal) => {
    if (newVal) {
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
  },
  { immediate: true }
);

const endHeartbeat = async () => {
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


onMounted(() => {
  getChapterProgress();
});

onUnmounted(() => {
  if (player.value) {
    player.value.dispose();
    player.value = null;
  }
  console.log("onUnmounted");
  endHeartbeat();
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