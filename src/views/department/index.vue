<template>
  <div class="content">
    <BasicComponent title="部門管理" :totalCount="`${totalCount} 筆`">
      <template #search-box>
        <div class="search-box">
          <el-input v-model="queryText" placeholder="請輸入部門名稱（可留空）" clearable @keyup.enter="handleSearch" />
          <el-button type="primary" :loading="loading" @click="handleSearch">查詢</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </template>

      <template #option-box>
        <div>
          <el-button type="primary" @click="createDialogState.open">新增部門</el-button>
          <el-button type="success" @click="oneClickDialogState.open">一鍵分發</el-button>
        </div>
      </template>

      <template #data-table>
        <el-table v-loading="loading" :data="departmentList" empty-text="暫無部門資料">
          <el-table-column prop="name" label="部門名稱" min-width="180" :show-overflow-tooltip="true" />

          <el-table-column label="狀態" width="120" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" :active-value="1" :inactive-value="0"
                @change="handleUpdateStatus(row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="updateDialogState.open(row)">更新</el-button>
              <el-button type="danger" link @click="deleteDepartment(row.departmentId)">刪除</el-button>
              <el-button type="warning" link @click="headToCourseManagement(row.departmentId)">課程</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template #pagination-box>
        <el-pagination layout="prev, pager, next" :current-page="currentPage" :total="Number(totalCount)"
          @current-change="handlePageChange" />
      </template>
    </BasicComponent>

    <el-dialog v-model="createDialogState.isOpen" title="新增部門" :width="device === 'mobile' ? '90%' : '30%'"
      @close="handleReset" :show-close="false" destroy-on-close>
      <CreateDepartmentForm @submit="fetchDepartmentList" @cancel="createDialogState.close" />
    </el-dialog>
    <el-dialog v-model="updateDialogState.isOpen" title="更新部門" :width="device === 'mobile' ? '90%' : '40%'"
      @close="handleReset" :show-close="false" destroy-on-close>
      <UpdateDepartmentForm :department="updateDepartmentData" @submit="fetchDepartmentList"
        @cancel="updateDialogState.close" />
    </el-dialog>

    <el-dialog v-model="oneClickDialogState.isOpen" title="一鍵分發" :width="device === 'mobile' ? '90%' : '30%'"
      destroy-on-close>
      <div>
        <p>此功能會為 未報名課程 的 企業員工 以及 上完課但證書過期的 企業員工 報名所屬部門的課程</p>
        <el-button type="primary" @click="oneClickEnrollment">確定</el-button>
        <el-button @click="oneClickDialogState.close">取消</el-button>
      </div>
    </el-dialog>

    <!-- <el-dialog v-model="addCourseDialogState.isOpen" title="部門課程管理" :width="device === 'mobile' ? '100%' : '70%'"
      destroy-on-close> -->
    <!-- <AddCourse :departmentId="selectDepartmentId" @update="fetchDepartmentList" @close="addCourseDialogState.close" /> -->
    <!-- </el-dialog> -->
  </div>
</template>

<script setup lang="ts">
import BasicComponent from '@/layout/components/Basic/index.vue';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';
import CreateDepartmentForm from './components/CreateDepartment.vue';
import UpdateDepartmentForm from './components/UpdateDepartment.vue';
import { useAppStore } from '@/store';
import { Department } from '@/api/department/type';
import { deleteDepartmentByIdApi, findDepartmentListByQueryTextAndPaginationApi, oneClickEnrollmentApi, updateDepartmentApi } from '@/api/department';
import { use } from 'echarts';


const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const loading = ref(false);
const queryText = ref('');
const departmentList = ref<Department[]>([]);
const device = useAppStore().device;

const fetchDepartmentList = async () => {
  loading.value = true;

  const { res, error }: any = await tryCatch(
    findDepartmentListByQueryTextAndPaginationApi(currentPage.value, pageSize.value, queryText.value.trim())
  );


  loading.value = false;

  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法取得部門列表',
      type: 'error',
    });
    return;
  }


  departmentList.value = Array.isArray(res?.data?.records) ? res.data.records : [];
  totalCount.value = Number(res?.data?.total ?? 0);
  createDialogState.close();
  updateDialogState.close();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchDepartmentList();
};

const handleReset = () => {
  queryText.value = '';
  currentPage.value = 1;
  fetchDepartmentList();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchDepartmentList();
};

const createDialogState = reactive({
  isOpen: false,
  open: () => createDialogState.isOpen = true,
  close: () => createDialogState.isOpen = false,
})

const updateDepartmentData = reactive({} as Department);
const updateDialogState = reactive({
  isOpen: false,
  open: (row: any) => {
    updateDialogState.isOpen = true;
    Object.assign(updateDepartmentData, row);
  },
  close: () => updateDialogState.isOpen = false,
})

const selectDepartmentId = ref<string>('')
const addCourseDialogState = reactive({
  isOpen: false,
  open: (row: any) => {
    addCourseDialogState.isOpen = true;
    selectDepartmentId.value = row.departmentId
  },
  close: () => addCourseDialogState.isOpen = false,
})

const deleteDepartment = async (departmentId: string) => {
  console.log('刪除部門', departmentId);
  ElMessageBox.confirm('確定要刪除這個部門嗎？', '警告', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const { res, error }: any = await tryCatch(deleteDepartmentByIdApi(departmentId));

    if (error || res?.code !== 200) {
      ElNotification({
        title: '錯誤',
        message: '無法刪除部門',
        type: 'error',
      });
      return;
    }

    ElNotification({
      title: '成功',
      message: '部門已刪除',
      type: 'success',
    });
    fetchDepartmentList();
  }).catch(() => {
    // 使用者取消刪除
  });
}

const handleUpdateStatus = async (department: Department) => {
  const payload = {
    departmentId: department.departmentId,
    name: department.name,
    isActive: department.isActive,
  };

  const { res, error }: any = await tryCatch(updateDepartmentApi(payload));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法更新部門狀態',
      type: 'error',
    });
    return;
  }

  ElNotification({
    title: '成功',
    message: '部門狀態已更新',
    type: 'success',
  });

  fetchDepartmentList();
};

const router = useRouter();
const headToCourseManagement = (departmentId: string) => {
  // 跳轉到部門課程管理頁面，並傳遞 departmentId
  // 這裡可以使用 Vue Router 的 push 方法來實現跳轉
  router.push(`/department-course-page/${departmentId}`);
};

const oneClickDialogState = reactive({
  isOpen: false,
  open: () => oneClickDialogState.isOpen = true,
  close: () => oneClickDialogState.isOpen = false,
})

const oneClickEnrollment = async () => {
  const { res, error }: any = await tryCatch(oneClickEnrollmentApi());

  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '一鍵分發失敗',
      type: 'error',
    });
    return;
  }

  ElNotification({
    title: '成功',
    message: '一鍵分發成功',
    type: 'success',
  });
  fetchDepartmentList();
  oneClickDialogState.close();
}

onMounted(() => {
  fetchDepartmentList();
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
