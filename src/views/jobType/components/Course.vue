<template>
  <div>
    <BasicComponent title="課程選擇">
      <template #search-box>
        <el-input v-model="queryText" placeholder="請輸入課程名稱" @keydown.enter="findJobCourseList" />
        <el-button type="primary" @click="findJobCourseList">搜尋</el-button>
      </template>

      <template #option-box>
        <el-button type="primary" @click="dialogState.open">新增課程</el-button>
      </template>

      <template #data-table>
        <el-table v-if="hasData" :data="jobCourseList">
          <el-table-column width="150">
            <template #default="{ row }">
              <el-image :src="minioEnv + row.coverImage" fit="cover"></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="課程名稱"></el-table-column>
          <el-table-column prop="description" label="課程描述"></el-table-column>
          <el-table-column label="是否必要課程">
            <template #default="{ row }">
              <el-switch v-model="row.isMandatory" :active-value="1" :inactive-value="0" active-text="是"
                inactive-text="否" @click="handleUpdate(row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="danger" link @click="deleteCourse(row.jobCourseId)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-else description="暫無課程"></el-empty>

        <div class="pagination-box">
          <el-pagination layout="prev, pager, next" :total="Number(jobCourseTotal)"
            @current-change="handleJobCoursePageChange" />
        </div>
      </template>
    </BasicComponent>

    <el-dialog title="新增課程" v-model="dialogState.isOpen" :width="device === 'mobile' ? '100%' : '70%'">
      <el-select v-model="selectCategoryId" filterable clearable placeholder="請選擇課程"
        @end-reached="fetchCourseCategoryList()" @change="findCourseList">
        <el-option v-for="category in courseCategoryList" :key="category.courseCategoryId" :label="category.name"
          :value="category.courseCategoryId"></el-option>
      </el-select>
      <el-table ref="tableRef" :data="courseList">
        <el-table-column width="150">
          <template #default="{ row }">
            <el-image :src="minioEnv + row.coverImage" fit="cover"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="課程名稱"></el-table-column>
        <el-table-column prop="description" label="課程描述"></el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" @click="openAddDialogState.open(row.courseId)"
              :disabled="existingCourseIds.includes(row.courseId)">新增</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box">
        <el-pagination layout="prev, pager, next" :total="Number(total)" @current-change="handlePageChange" />
      </div>
    </el-dialog>

    <el-dialog v-model="openAddDialogState.isOpen" title="確認新增課程" width="30%">
      <span>確定要將此課程新增到作業類別嗎？</span>
      <el-form-item label="是否為必要課程">
        <el-switch v-model="isMandatory" :active-value="1" :inactive-value="0" active-text="是"
          inactive-text="否"></el-switch>
      </el-form-item>
      <el-button type="primary" @click="addCourseToJobType">確認新增</el-button>
      <el-button @click="openAddDialogState.close">取消</el-button>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { findCourseCategoryListByQueryTextAndPaginationApi } from '@/api/course/category';
import { CourseCategory } from '@/api/course/category/type';
import { findCourseListByCategoryIdAndPaginationApi } from '@/api/course/course';
import { Course } from '@/api/course/course/type';
import { createTypeCategoryApi, deleteTypeCategoryByIdApi, findAllJobCourseListApi, findJobTypeCourseCategoryByJobTypeIdApi, updateTypeCategoryApi } from '@/api/jobTypeCourse';
import { AddTypeCategory, JobCourseVO, UpdateTypeCategory } from '@/api/jobTypeCourse/type';
import BasicComponent from '@/layout/components/Basic/index.vue'
import { useAppStore } from '@/store';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';

const jobTypeId = ref<string>(useRoute().params.jobTypeId as string)

const hasData = ref<boolean>(false);
const device = useAppStore().device

const jobCourseList = ref<JobCourseVO[]>([])
const currentPage = ref<number>(1)
const queryText = ref<string>('')
const existingCourseIds = ref<string[]>([])

const jobCourseTotal = ref<number>(0)
const findJobCourseList = async () => {
  const { res, error }: any = await tryCatch(findJobTypeCourseCategoryByJobTypeIdApi(jobTypeId.value, currentPage.value, 10, queryText.value))
  console.log('findJobCourseList res', res, 'error', error);
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取課程列表失敗',
      type: 'error',
    })

    return
  }
  jobCourseList.value = res.data.records
  hasData.value = jobCourseList.value.length > 0
}

const findAllJobCourseList = async () => {
  const { res, error }: any = await tryCatch(findAllJobCourseListApi(jobTypeId.value))
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取課程列表失敗',
      type: 'error',
    })

    return
  }
  existingCourseIds.value = res.data.map((item: JobCourseVO) => item.courseId)
  console.log('existingCourseIds', existingCourseIds.value);
}

const handleJobCoursePageChange = (page: number) => {
  currentPage.value = page
  findJobCourseList()
}

// ------------------------------------------------------------

const dialogState = reactive({
  isOpen: false,
  open: () => {
    dialogState.isOpen = true
  },
  close: () => {
    dialogState.isOpen = false
  }
})
const courseList = ref<Course[]>([])
const coursePage = ref<number>(1)
const courseQueryText = ref<string>('')
const total = ref<number>(0)
const minioEnv = import.meta.env.VITE_MINIO_API_URL

const handlePageChange = (page: number) => {
  coursePage.value = page
  findCourseList()
}
const findCourseList = async () => {
  courseList.value = []
  const { res, error }: any = await tryCatch(findCourseListByCategoryIdAndPaginationApi(coursePage.value, 10, selectCategoryId.value, courseQueryText.value));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取課程列表失敗',
      type: 'error',
    })

    return
  }

  courseList.value = res.data.records
  total.value = res.data.total
}
// ------------------------------------------------------------

const addCourseId = ref<string>('')
const isMandatory = ref<number>(0)
const openAddDialogState = reactive({
  isOpen: false,
  open: (courseId: string) => {
    addCourseId.value = courseId
    openAddDialogState.isOpen = true
  },
  close: () => {
    openAddDialogState.isOpen = false
  }
})

const addCourseToJobType = async () => {
  const payload: AddTypeCategory = {
    jobTypeId: jobTypeId.value,
    courseId: addCourseId.value,
    isMandatory: isMandatory.value
  }

  const { res, error }: any = await tryCatch(createTypeCategoryApi(payload))
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '新增課程失敗',
      type: 'error',
    })
    return;
  }

  ElNotification({
    title: '成功',
    message: '新增課程成功',
    type: 'success',
  })

  await findJobCourseList()
  openAddDialogState.close()
  dialogState.close()
}
// ------------------------------------------------------------
const handleUpdate = async (row: JobCourseVO) => {
  const payload: UpdateTypeCategory = {
    jobCourseId: row.jobCourseId,
    isMandatory: row.isMandatory
  }

  const { res, error }: any = await tryCatch(updateTypeCategoryApi(payload))
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '更新課程失敗',
      type: 'error',
    })
    return;
  }

  ElNotification({
    title: '成功',
    message: '更新課程成功',
    type: 'success',
  })

  await findJobCourseList()
}

// ------------------------------------------------------------

const selectCategoryId = ref<string>('')
const categoryPage = ref(1);
const courseCategoryList = ref<CourseCategory[]>([]);
const hasMore = ref(true)
const fetchCourseCategoryList = async (isRefresh = false) => {
  if (isRefresh) {
    categoryPage.value = 1;
    courseCategoryList.value = [];
  }
  if (!hasMore.value && !isRefresh) {
    ElNotification({
      title: '提示',
      message: '沒有更多課程類別了',
      type: 'info',
    });
    return;
  }
  const { res, error }: any = await tryCatch(
    findCourseCategoryListByQueryTextAndPaginationApi(categoryPage.value, 20, '')
  );

  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法取得課程分類列表',
      type: 'error',
    });
    return;
  }

  courseCategoryList.value.push(...res.data.records);
  hasMore.value = courseCategoryList.value.length < res.data.total;
  if (hasMore.value) {
    categoryPage.value++;
  }
};

const deleteCourse = async (jobCourseId: string) => {
  ElMessageBox.confirm('確定要刪除這個課程嗎？', '警告', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    // 在這裡調用刪除 API
    const { res, error }: any = await tryCatch(deleteTypeCategoryByIdApi(jobCourseId));
    if (error || res.code !== 200) {
      ElNotification({
        title: '錯誤',
        message: '刪除課程失敗',
        type: 'error',
      });
      return;
    }

    ElNotification({
      title: '成功',
      message: '刪除課程成功',
      type: 'success',
    });

    // 刪除成功後重新獲取列表
    await findJobCourseList();
  }).catch(() => {
    // 使用者取消刪除
  });

}
onMounted(() => {
  findJobCourseList()
  fetchCourseCategoryList()
  findAllJobCourseList()
})
</script>
<style lang="scss" scoped>
.pagination-box {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.el-image {
  border-radius: 8px;
  width: 100px;
  height: 80px;
}
</style>