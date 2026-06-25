<template>
  <div class="chapter-item">
    <h2 class="chapter-title">{{ chapter.title }}</h2>
    <!-- <p class="chapter-content">{{ chapter.content }}</p> -->
    <video v-if="props.chapter.contentType === 'video'" id="my-video" class="video-js vjs-big-play-centered"></video>

  </div>
</template>
<script lang="ts" setup>
import { CourseChapterVO } from '@/api/course/chapter/type';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const props = defineProps<{
  chapter: CourseChapterVO;
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

onUnmounted(() => {
  if (player.value) {
    player.value.dispose();
    player.value = null;
  }
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