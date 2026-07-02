<!-- 章節影片組件 -->
<template>
  <div class="video-box">
    <video v-if="props.chapter" id="my-video" ref="videoRef" class="video-js vjs-big-play-centered"></video>
  </div>
</template>
<script lang="ts" setup>
import { CourseChapterVO } from '@/api/course/chapter/type';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const props = defineProps<{
  chapter: CourseChapterVO;
}>();

const minioUrl = import.meta.env.VITE_MINIO_API_URL;
const player = ref<any>(null);
const videoRef = ref<HTMLVideoElement | null>(null);

const initPlayer = () => {
  if (player.value) {
    player.value.dispose();
    player.value = null;
  }

  nextTick(() => {
    if (videoRef.value) {
      player.value = videojs(videoRef.value, {
        sources: [{ src: `${minioUrl}${props.chapter.videoUrl}`, type: 'video/mp4' }],
        loop: true,
        muted: false,
        fluid: true,
        controls: true
      })
    }
  })
}

watch(() => props.chapter, (newVal) => {
  if (newVal) {
    console.log('videoUrl changed:', newVal);
    initPlayer();
  }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('beforeunload', () => {
    if (player.value) {
      player.value.dispose();
      player.value = null;
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', () => {
    if (player.value) {
      player.value.dispose();
      player.value = null;
    }
  });
});
</script>
<style lang="scss" scoped>
.video-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>