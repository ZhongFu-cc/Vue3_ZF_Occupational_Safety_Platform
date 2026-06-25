<template>
  <div>
    <el-upload ref="upload" class="upload-demo" :limit="1" :on-change="handleUpload" :auto-upload="false"
      :on-exceed="handleExceed">
      <el-button size="small" type="primary">Upload</el-button>
      <div slot="tip" class="el-upload__tip">only upload mp4 file with size less than 200MB</div>
    </el-upload>

    <el-progress :percentage="percentage" :stroke-width="15" striped striped-flow />

    <p>hashCode: {{ hashCode }}</p>


  </div>
</template>
<script lang="ts" setup>
import { type UploadProps, type UploadUserFile, type UploadFile, type UploadFiles, type UploadInstance, type UploadRawFile, genFileId, ElNotification } from 'element-plus';
import { hashFile, checkFileIsExist, fileUpload } from '@/utils/largeFileUpload';
import { hash } from 'crypto';

const props = defineProps<{
  courseChapterId: string;
}>();


const upload = ref<UploadInstance>()

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
    let res = await hashFile(file.raw)
    hashCode.value = res.hash;
    totalChunks.value = res.chunks.length;
    percentage.value += 9;
    let checkResult = await checkFileIsExist('/chapter-video/check', hashCode.value)
    await fileUpload(checkResult, res.file, res.hash, res.chunks, percentage, '/chapter-video', props.courseChapterId)
  }

}
</script>