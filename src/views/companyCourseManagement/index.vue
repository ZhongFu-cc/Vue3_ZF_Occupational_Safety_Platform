<template>
  <div class="content">
    <BasicComponent title="公司課程管理" :totalCount="`${totalCount} 筆`">
      <template #search-box>
        <div class="search-box">
          <el-input v-model="queryText" placeholder="請輸入公司課程名稱（可留空）" clearable @keyup.enter="handleSearch" />
          <el-button type="primary" :loading="loading" @click="handleSearch">查詢</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </template>

      <template #option-box>
        <el-button type="primary" @click="createDialogState.open">選取課程</el-button>
      </template>

      <template #data-table>
        <el-table v-loading="loading" :data="companyCourseList" empty-text="暫無公司課程資料">
          <el-table-column>
            <template #default="{ row }">
              <el-image :src="minioEnv + row.coverImage" fit="cover"></el-image>

            </template>
          </el-table-column>
          <el-table-column prop="title" label="公司課程名稱" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column prop="description" label="描述" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column prop="totalMinutes" label="課程時數(分鐘)" min-width="80" :show-overflow-tooltip="true" />
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button type="danger" link @click="deleteCourse(row.companyCourseId)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template #pagination-box>
        <el-pagination layout="prev, pager, next" :current-page="currentPage" :total="Number(totalCount)"
          @current-change="handlePageChange" />
      </template>
    </BasicComponent>

    <el-dialog v-model="createDialogState.isOpen" title="新增公司課程" :width="device === 'mobile' ? '90%' : '50%'"
      @close="handleReset" :show-close="false" destroy-on-close>
      <AddCompanyCourse @submit="fetchCompanyCourseList" @cancel="createDialogState.close" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import BasicComponent from '@/layout/components/Basic/index.vue';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';
import AddCompanyCourse from './components/AddCompanyCourse.vue';
import { useAppStore } from '@/store';
import { deleteCompanyCourseByIdApi, findCompanyCourseListByQueryTextAndPaginationApi } from '@/api/companyCourseManagement/index.js';
import { CompanyCourseVO } from '@/api/companyCourseManagement/type.js';


const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const loading = ref(false);
const queryText = ref('');
const companyCourseList = ref<CompanyCourseVO[]>([]);
const device = useAppStore().device;

const minioEnv = import.meta.env.VITE_MINIO_API_URL;

const fetchCompanyCourseList = async () => {
  loading.value = true;

  const { res, error }: any = await tryCatch(
    findCompanyCourseListByQueryTextAndPaginationApi(currentPage.value, pageSize.value, queryText.value.trim())
  );


  loading.value = false;

  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法取得公司課程列表',
      type: 'error',
    });
    return;
  }


  companyCourseList.value = Array.isArray(res?.data?.records) ? res.data.records : [];
  totalCount.value = Number(res?.data?.total ?? 0);
  createDialogState.close();
  // updateDialogState.close();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchCompanyCourseList();
};

const handleReset = () => {
  queryText.value = '';
  currentPage.value = 1;
  fetchCompanyCourseList();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchCompanyCourseList();
};

const createDialogState = reactive({
  isOpen: false,
  open: () => createDialogState.isOpen = true,
  close: () => createDialogState.isOpen = false,
})

const deleteCourse = async (companyCourseId: string) => {
  console.log('刪除公司課程', companyCourseId);
  ElMessageBox.confirm('確定要刪除這個公司課程嗎？', '警告', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const { res, error }: any = await tryCatch(deleteCompanyCourseByIdApi(companyCourseId));

    if (error || res?.code !== 200) {
      ElNotification({
        title: '錯誤',
        message: '無法刪除公司課程',
        type: 'error',
      });
      return;
    }

    ElNotification({
      title: '成功',
      message: '公司課程已刪除',
      type: 'success',
    });
    fetchCompanyCourseList();
  }).catch(() => {
    // 使用者取消刪除
  });
}

onMounted(() => {
  fetchCompanyCourseList();
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


.el-image {
  border-radius: 8px;
  width: 100px;
  height: 80px;
}
</style>
