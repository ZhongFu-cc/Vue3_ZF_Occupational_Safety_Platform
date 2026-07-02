<template>
  <div>
    <!-- <el-segmented v-model="selectMethod" :options="options" block /> -->


    <el-upload ref="upload" class="upload-demo" :limit="1" :on-change="handleUpload" :auto-upload="false"
      :on-exceed="handleExceed">
      <el-button size="small" type="primary">Upload</el-button>
      <div slot="tip" class="el-upload__tip">only upload mp4 file with size less than 200MB</div>
    </el-upload>

    <el-progress :percentage="percentage" :stroke-width="15" striped striped-flow />

    <video v-if="videoUrl" id="my-video" class="video-js vjs-big-play-centered"></video>


    <p>hashCode: {{ hashCode }}</p>


  </div>
</template>
<script lang="ts" setup>
import { type UploadProps, type UploadUserFile, type UploadFile, type UploadFiles, type UploadInstance, type UploadRawFile, genFileId, ElNotification } from 'element-plus';
import { hashFile, checkFileIsExist, fileUpload } from '@/utils/largeFileUpload';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { tryCatch } from '@/utils/tryCatch';
import { findChapterVideoByCourseChapterIdApi } from '@/api/chapterVideo';
import { ChapterVideo } from '@/api/chapterVideo/type';

const minioUrl = import.meta.env.VITE_MINIO_API_URL as string
const selectMethod = ref<string>('post')
// const options = [
//   { label: '上傳影片', value: 'post' },
//   { label: '更新影片', value: 'put' },
// ]

// const options = computed(() => {
//   if (chapterVideo.chapterVideoId) {
//     return [
//       { label: '更新影片', value: 'put' },
//     ]
//   } else {
//     return [
//       { label: '上傳影片', value: 'post' },
//     ]
//   }
// })

const payload = reactive<any>({})
// watch(selectMethod, (newVal) => {
//   console.log('選擇的上傳方式:', newVal);
//   videoUrl.value = ''
// });


const props = defineProps<{
  courseChapterId: string;
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
        sources: [{ src: `${videoUrl.value}`, type: 'video/mp4' }],
        loop: true,
        muted: true,
        fluid: true,
        controls: true
      });
    }
  });
}


const upload = ref<UploadInstance>()

const videoUrl = ref<string>('')


const chapterVideo = reactive<ChapterVideo>({} as ChapterVideo)
const findChapterVideoByCourseChapterId = async () => {
  const { res, error }: any = await tryCatch(findChapterVideoByCourseChapterIdApi(props.courseChapterId))

  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取章節影片失敗',
      type: 'error',
    })
    return
  }

  Object.assign(chapterVideo, res.data)
  console.log('chapterVideo', chapterVideo)
  if (chapterVideo.chapterVideoId) {
    selectMethod.value = 'put'
    videoUrl.value = minioUrl + chapterVideo.path
    console.log('videoUrl', videoUrl.value)
    initPlayer();
  } else {
    selectMethod.value = 'post'
  }
};

/**-------------------------------------------------------------- */
const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

/**-------------------------------------------------------------- */
const hashCode = ref<string>('')
const totalChunks = ref<number>(0)
const percentage = ref<number>(0)


const FILE_SIZE_LIMIT = 200 * 1024 * 1024; // 200MB
const FILE_TYPE = 'video/mp4'



const handleUpload: UploadProps['onChange'] = async (file: UploadUserFile, uploadFiles) => {
  if (file.size == 0) {
    ElNotification.error({
      title: 'Error',
      message: 'File size cannot be 0',
    });
    return false;
  }

  if (file.status === 'ready' && file.size && file.raw) {
    if (file.raw.size > FILE_SIZE_LIMIT) {
      ElNotification.error({
        title: 'Error',
        message: 'File size exceeds the limit of 200MB',
      });
      return false;
    }

    if (file.raw.type !== FILE_TYPE) {
      ElNotification.error({
        title: 'Error',
        message: 'File type must be mp4',
      });
      return false;
    }

    percentage.value = 0;
    percentage.value += 1;
    console.log(selectMethod.value)
    let res = await hashFile(file.raw)
    hashCode.value = res.hash;
    totalChunks.value = res.chunks.length;
    percentage.value += 9;
    await checkFileIsExist('/chapter-video/check', hashCode.value)
    if (selectMethod.value === 'put') {
      payload.chapterVideoId = chapterVideo.chapterVideoId;
    } else {
      payload.courseChapterId = props.courseChapterId;
    }
    console.log('payload', payload)
    await fileUpload(res.file, res.hash, res.chunks, percentage, '/chapter-video', selectMethod.value, payload)

    ElNotification.success({
      title: selectMethod.value === 'post' ? '上傳成功' : '更新成功',
      message: selectMethod.value === 'post' ? '影片上傳成功' : '影片更新成功',
    });
    findChapterVideoByCourseChapterId()

    // 
  }

}

onMounted(() => {
  findChapterVideoByCourseChapterId();
})

onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose();
    player.value = null;
  }
})
</script>