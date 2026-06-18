<template>
  <div class="content">
    <BasicComponent title="課程管理" :totalCount="`${totalCount} 筆`">
      <template #search-box>
        <div class="search-box">
          <el-input v-model="queryText" placeholder="請輸入課程分類 ID（可留空）" clearable @keyup.enter="handleSearch" />
          <el-button type="primary" :loading="loading" @click="handleSearch">查詢</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </template>

      <template #option-box>
        <el-button @click="createDialogState.open">新增課程</el-button>
      </template>

      <template #data-table>
        <el-table v-loading="loading" :data="courseList" empty-text="暫無課程資料">
          <el-table-column prop="title" label="課程名稱" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column prop="description" label="課程描述" min-width="220" :show-overflow-tooltip="true" />
          <el-table-column label="課程時長(分鐘)" width="130" align="center">
            <template #default="{ row }">
              {{ displayTotalMinute(row.totalMinutes) }}
            </template>
          </el-table-column>
          <el-table-column label="狀態" width="120" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" :active-value="1" :inactive-value="0"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="() => updateDialogState.open(row)">編輯</el-button>
              <el-button type="warning" link @click="() => toChapter(row.courseId)">章節</el-button>
              <el-button type="danger" link @click="() => deleteCourse(row.courseId)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template #pagination-box>
        <el-pagination layout="prev, pager, next" :current-page="currentPage" :total="Number(totalCount)"
          @current-change="handlePageChange" />
      </template>
    </BasicComponent>

    <el-dialog v-model="createDialogState.isOpen" title="新增課程" :width="device === 'mobile' ? '90%' : '40%'"
      @close="handleReset" :show-close="false" destroy-on-close>
      <CreateCourseForm @submit="fetchCourseList" @cancel="createDialogState.close" />
    </el-dialog>
    <el-dialog v-model="updateDialogState.isOpen" title="更新課程" :width="device === 'mobile' ? '90%' : '40%'"
      @close="handleReset" :show-close="false" destroy-on-close>
      <UpdateCourseForm :course="updateCourseData" @submit="fetchCourseList" @cancel="updateDialogState.close" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import BasicComponent from '@/layout/components/Basic/index.vue';
import { deleteCourseApi, findCourseListByCategoryIdAndPaginationApi } from '@/api/course/course';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';
import { Course } from '@/api/course/course/type';
import CreateCourseForm from './components/CreateCourse.vue';
import UpdateCourseForm from './components/UpdateCourse.vue';
import { useAppStore } from '@/store';


const router = useRouter();
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const loading = ref(false);
const courseCategoryId = ref('');
const queryText = ref('');
const courseList = ref<Course[]>([]);
const device = useAppStore().device;

const displayTotalMinute = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }
  return value;
};

const fetchCourseList = async () => {
  loading.value = true;
  console.log(courseCategoryId.value, queryText.value);

  const { res, error }: any = await tryCatch(
    findCourseListByCategoryIdAndPaginationApi(currentPage.value, pageSize.value, courseCategoryId.value.trim(), queryText.value.trim())
  );

  console.log('API Response:', res);

  loading.value = false;

  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法取得課程列表',
      type: 'error',
    });
    return;
  }

  console.log('課程列表資料:', res?.data);
  courseList.value = Array.isArray(res?.data?.records) ? res.data.records : [];
  totalCount.value = Number(res?.data?.total ?? 0);

  createDialogState.close();
  updateDialogState.close();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchCourseList();
};

const handleReset = () => {
  courseCategoryId.value = '';
  currentPage.value = 1;
  fetchCourseList();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchCourseList();
};

const createDialogState = reactive({
  isOpen: false,
  open: () => createDialogState.isOpen = true,
  close: () => createDialogState.isOpen = false,
})

const updateCourseData = reactive({} as Course);
const updateDialogState = reactive({
  isOpen: false,
  open: (row: Course) => {
    updateDialogState.isOpen = true;
    Object.assign(updateCourseData, row);
  },
  close: () => updateDialogState.isOpen = false,
})

const deleteCourse = async (courseId: string) => {
  console.log('刪除課程', courseId);
  ElMessageBox.confirm('確定要刪除這門課程嗎？', '警告', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const { res, error }: any = await tryCatch(deleteCourseApi(courseId));

    if (error || res?.code !== 200) {
      ElNotification({
        title: '錯誤',
        message: '無法刪除課程',
        type: 'error',
      });
      return;
    }

    ElNotification({
      title: '成功',
      message: '課程已刪除',
      type: 'success',
    });
    fetchCourseList();
  }).catch(() => {
    // 使用者取消刪除
  });
}

const toChapter = (courseId: string) => {
  router.push(`/course-chapter-page/${courseId}`);
}

onMounted(() => {
  fetchCourseList();
});
</script>

<style scoped lang="scss">
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input {
    width: 280px;
  }

  @media screen and (max-width: 760px) {
    width: 100%;
    flex-wrap: wrap;

    .el-input {
      width: 100%;
    }
  }
}
</style>
