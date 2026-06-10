<template>
  <div class="content">
    <BasicComponent title="課程分類" :totalCount="`${totalCount} 筆`">
      <template #search-box>
        <div class="search-box">
          <el-input v-model="queryText" placeholder="請輸入課程分類名稱（可留空）" clearable @keyup.enter="handleSearch" />
          <el-button type="primary" :loading="loading" @click="handleSearch">查詢</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </template>

      <template #option-box>
        <el-button @click="createDialogState.open">新增課程</el-button>
      </template>

      <template #data-table>
        <el-table v-loading="loading" :data="courseCategoryList" empty-text="暫無課程資料">
          <el-table-column prop="name" label="課程分類名稱" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column prop="description" label="課程分類描述" min-width="220" :show-overflow-tooltip="true" />
          <el-table-column label="課程分類時長(分鐘)" width="150" align="center">
            <template #default="{ row }">
              {{ displayTotalMinute(row.minRequiredMinutes) }}
            </template>
          </el-table-column>
          <el-table-column label="狀態" width="120" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" :active-value="1" :inactive-value="0"></el-switch>
            </template>
          </el-table-column>
          <el-table-column>
            <template #default="{ row }">
              <el-button type="primary" link @click="updateDialogState.open(row)">編輯</el-button>
              <el-button type="danger" link @click="deleteCategory(row.courseCategoryId)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template #pagination-box>
        <el-pagination layout="prev, pager, next" :current-page="currentPage" :total="Number(totalCount)"
          @current-change="handlePageChange" />
      </template>
    </BasicComponent>

    <el-dialog v-model="createDialogState.isOpen" title="新增課程分類" :width="device === 'mobile' ? '90%' : '40%'"
      @close="handleReset" :show-close="false" destroy-on-close>
      <CreateCourseCategoryForm @submit="fetchCourseCategoryList" @cancel="createDialogState.close" />
    </el-dialog>

    <el-dialog v-model="updateDialogState.isOpen" title="編輯課程分類" :width="device === 'mobile' ? '90%' : '40%'"
      @close="handleReset" :show-close="false" destroy-on-close>
      <UpdateCourseCategoryForm :courseCategory="updateCategory" @submit="fetchCourseCategoryList"
        @cancel="updateDialogState.close" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import BasicComponent from '@/layout/components/Basic/index.vue';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';
import { useAppStore } from '@/store';
import { deleteCourseCategoryApi, findCourseCategoryListByQueryTextAndPaginationApi } from '@/api/course/category';
import { CourseCategory } from '@/api/course/category/type';
import CreateCourseCategoryForm from './components/CreateCourseCategory.vue';
import UpdateCourseCategoryForm from './components/UpdateCourseCategory.vue';



const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const loading = ref(false);
const queryText = ref('');
const courseCategoryList = ref<CourseCategory[]>([]);
const device = useAppStore().device;

const displayTotalMinute = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }
  return value;
};

const fetchCourseCategoryList = async () => {
  loading.value = true;

  const { res, error }: any = await tryCatch(
    findCourseCategoryListByQueryTextAndPaginationApi(currentPage.value, pageSize.value, queryText.value.trim())
  );

  console.log('API Response:', res);

  loading.value = false;

  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法取得課程分類列表',
      type: 'error',
    });
    return;
  }

  console.log('課程分類資料:', res?.data);
  courseCategoryList.value = Array.isArray(res?.data?.records) ? res.data.records : [];
  totalCount.value = Number(res?.data?.total ?? 0);
  createDialogState.close();
  updateDialogState.close();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchCourseCategoryList();
};

const handleReset = () => {
  currentPage.value = 1;
  fetchCourseCategoryList();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchCourseCategoryList();
};

const createDialogState = reactive({
  isOpen: false,
  open: () => createDialogState.isOpen = true,
  close: () => createDialogState.isOpen = false,
})

const updateCategory = reactive({} as CourseCategory);
const updateDialogState = reactive({
  isOpen: false,
  open: (row: CourseCategory) => {
    updateDialogState.isOpen = true;
    Object.assign(updateCategory, row);
  },
  close: () => updateDialogState.isOpen = false,
})

const deleteCategory = (categoryId: string) => {
  ElMessageBox.confirm('確定要刪除這個課程分類嗎？', '警告', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    // 在這裡呼叫刪除 API
    const { res, error }: any = await tryCatch(deleteCourseCategoryApi(categoryId));
    if (error || res?.code !== 200) {
      ElNotification({
        title: '錯誤',
        message: '無法刪除課程分類',
        type: 'error',
      });
      return;
    }

    ElNotification({
      title: '成功',
      message: '課程分類已刪除',
      type: 'success',
    });

    // 刪除後重新載入列表
    fetchCourseCategoryList();
  }).catch(() => {
    // 使用者取消刪除
  });
}

onMounted(() => {
  fetchCourseCategoryList();
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
