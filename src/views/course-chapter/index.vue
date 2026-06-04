<template>
  <div>
    <BasicComponent title="課程章節">
      <template #option-box>
        <el-button type="primary" @click="createDialogState.open('0')">新增章節</el-button>
      </template>

      <template #data-table>
        <el-table :data="courseChapterList" :tree-props="{ checkStrictly: false, }" row-key="courseChapterId"
          :default-expand-all="false" :key="courseChapterList.length">
          <el-table-column label="名稱" prop="title" />
          <el-table-column label="章節順序" prop="chapterOrder"></el-table-column>
          <el-table-column label="章節類別" prop="chapterType">
            <template #default="{ row }">
              <span>{{ contentTypeMap[row.contentType as keyof typeof contentTypeMap] }}</span>
            </template>
          </el-table-column>
          <el-table-column>
            <template #default="{ row }">
              <el-button type="primary" link @click="createDialogState.open(row.courseChapterId)">
                <el-icon>
                  <Plus />
                </el-icon>
                <span>新增</span>
              </el-button>
              <el-button type="primary" link @click="updateDialogState.open(row)"><el-icon>
                  <Edit />
                </el-icon><span>編輯</span></el-button>
              <el-button type="danger" link><el-icon>
                  <Delete />
                </el-icon><span>刪除</span></el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </BasicComponent>

    <el-dialog v-model="createDialogState.isOpen" title="新增章節" destroy-on-close>
      <CreateForm @submit="createDialogState.close" @cancel="createDialogState.close" :course-id="courseId"
        :chapter-list="courseChapterSelectList" :parent-id="selectParentId" />
    </el-dialog>

    <el-dialog v-model="updateDialogState.isOpen" title="編輯章節" destroy-on-close>
      <UpdateForm @submit="updateDialogState.close" @cancel="updateDialogState.close" :course-id="courseId"
        :chapter-list="courseChapterSelectList" :course-chapter="updateChapter" />
    </el-dialog>
  </div>
</template>
<script setup lang='ts'>
import { findCourseChapterListByCourseIdApi } from '@/api/course/chapter';
import BasicComponent from '@/layout/components/Basic/index.vue';
import CreateForm from './components/Create.vue';
import UpdateForm from './components/Update.vue';
import type { CourseChapterVO, UpdateCourseChapter } from '@/api/course/chapter/type';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';
const courseId = useRoute().params.courseId as string


const courseChapterList = ref<CourseChapterVO[]>([])

const courseChapterSelectList = reactive<CourseChapterVO[]>([
  {
    courseChapterId: '0',
    courseId: courseId,
    parentId: '',
    title: '上層章節',
    chapterOrder: 0,
    contentType: 'directory',
    formId: '',
    videoUrl: '',
    children: [],
  }
])

const getCourseChapterList = async () => {
  const { res, error }: any = await tryCatch(findCourseChapterListByCourseIdApi(courseId))

  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取課程章節列表失敗',
      type: 'error',
    })
    return
  }

  courseChapterList.value = res.data
  res.data.forEach((chapter: CourseChapterVO) => {
    console.log('chapter', typeof chapter.parentId)
  })
  courseChapterSelectList[0].children = res.data
  console.log(courseChapterList.value)
}

const contentTypeMap = {
  'directory': '章節',
  'video': '影片',
  'quiz': '測驗',
}

const selectParentId = ref<string | undefined>(undefined)
const createDialogState = reactive({
  isOpen: false,
  open: (parentId: string | undefined) => {
    selectParentId.value = parentId
    createDialogState.isOpen = true
  },
  close: () => {
    createDialogState.isOpen = false;
    getCourseChapterList()
  },
})

const updateChapter = reactive<UpdateCourseChapter>({} as UpdateCourseChapter)
const updateDialogState = reactive({
  isOpen: false,
  open: (row: UpdateCourseChapter) => {
    Object.assign(updateChapter, row)
    console.log('updateChapter', updateChapter)
    updateDialogState.isOpen = true
  },
  close: () => {
    updateDialogState.isOpen = false;
    getCourseChapterList()
  },
})

onMounted(() => {
  getCourseChapterList()
})
</script>