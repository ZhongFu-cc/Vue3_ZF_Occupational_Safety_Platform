<template>
  <div>
    <!-- <el-dialog title="新增課程" v-model="dialogState.isOpen" :width="device === 'mobile' ? '100%' : '70%'"> -->
    <el-select v-model="selectCategoryId" filterable @end-reached="fetchCourseCategoryList()" clearable
      placeholder="請選擇課程" @change="findCourseList">
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
            :disabled="existCompanyCourseIdList.includes(row.courseId)">新增</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-box">
      <el-pagination layout="prev, pager, next" :total="Number(total)" @current-change="handlePageChange" />
    </div>
    <!-- </el-dialog> -->

    <el-dialog v-model="openAddDialogState.isOpen" title="確認新增課程" width="30%">
      <p>確定要納入此課程？</p>
      <!-- <el-form-item label="是否為必要課程">
        <el-switch v-model="isMandatory" :active-value="1" :inactive-value="0" active-text="是"
          inactive-text="否"></el-switch>
      </el-form-item> -->
      <el-button type="primary" @click="addCourseToCompany(addCourseId)">確認新增</el-button>
      <el-button @click="openAddDialogState.close">取消</el-button>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { createCompanyCourseApi, findAllCompanyCourseListApi } from '@/api/companyCourseManagement';
import { findCourseCategoryListByQueryTextAndPaginationApi } from '@/api/course/category';
import { CourseCategory } from '@/api/course/category/type';
import { findCourseListByCategoryIdAndPaginationApi } from '@/api/course/course';
import { Course } from '@/api/course/course/type';
import { useAppStore, useUserStore } from '@/store';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';



const emit = defineEmits(['submit']);

const hasData = ref<boolean>(false);
const device = useAppStore().device

const existCompanyCourseIdList = ref<String[]>([])
const findAllCompanyCourseList = async () => {
  const { res, error }: any = await tryCatch(findAllCompanyCourseListApi());
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取公司課程列表失敗',
      type: 'error',
    })

    return
  }
  console.log('res.data', res.data)
  existCompanyCourseIdList.value = res.data.map((course: any) => course.courseId)
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
// ------------------------------------------------------------
const addCourseToCompany = async (courseId: string) => {
  const payload = {
    courseId
  }
  const { res, error }: any = await tryCatch(createCompanyCourseApi(payload));

  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '新增公司課程失敗',
      type: 'error',
    })

    return
  }

  ElNotification({
    title: '成功',
    message: '公司課程已新增',
    type: 'success',
  });

  emit('submit');
}


onMounted(() => {
  fetchCourseCategoryList(true)
  findAllCompanyCourseList()
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