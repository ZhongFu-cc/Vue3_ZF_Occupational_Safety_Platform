<!--  -->
<template>
  <div class="content">

    <BasicComponent title="成員管理" :totalCount="totalCount + ' 人'">
      <template #search-box>
        <el-input v-model="queryText" placeholder="搜尋用戶"
          @input="findChildUserByQueryTextAndPagination(currentPage, pageSize, queryText)"></el-input>
      </template>

      <template #option-box>
        <el-button type="primary" @click="createDialogState.open">新增用戶</el-button>
      </template>

      <template #data-table>
        <el-table :data="userList">
          <el-table-column v-if="role === 'admin'" prop="companyName" label="公司名稱" width="200"></el-table-column>
          <el-table-column prop="realName" label="用戶名" width="180" />
          <el-table-column prop="email" label="信箱" :show-overflow-tooltip="true" />
          <el-table-column prop="phone" label="電話號碼" width="160" />
          <el-table-column label="是否啟用" width="120">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" :active-value="1" :inactive-value="0"
                @change="handleChangeUserStatus(row.sysUserId, row.isActive)" />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="success" @click="detailDrawerState.open(row.sysUserId)">查看詳情</el-button>
              <el-button link type="primary" @click="updateDialogState.open(row.sysUserId)">更新</el-button>
              <el-button link type="danger" @click="handleDeleteUser(row.sysUserId)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

    </BasicComponent>

    <el-drawer v-model="detailDrawerState.isOpen" title="用戶詳情" :size="device === 'mobile' ? '90%' : '40%'">
      <template #default>
        <Detail :sysUser="sysUser" />
      </template>
    </el-drawer>

    <el-dialog v-model="updateDialogState.isOpen" title="更新用戶資訊">
      <Update :sysUser="sysUser" :role="role" @submit="updateDialogState.close" @cancel="updateDialogState.close" />
    </el-dialog>

    <el-dialog v-model="createDialogState.isOpen" title="新增用戶">
      <Create :role="role" @submit="createDialogState.close" @cancel="createDialogState.close" />
    </el-dialog>

  </div>
</template>

<script setup lang='ts'>
import BasicComponent from '@/layout/components/Basic/index.vue'
import Detail from './components/Detail.vue';
import Update from './components/Update.vue';
import Create from './components/Create.vue';
import type { SysUser, UpdateUserStatus } from '@/api/system/type';
import { useUserService } from '@/service/UserService';
import { useAppStore, useUserStore } from '@/store';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';

const userStore = useUserStore();
const device = useAppStore().device;

const role = computed(() => {
  if (userStore.user.roleList.includes('super-admin')) {
    return 'admin';
  } else if (userStore.user.roleList.includes('company_manager')) {
    return 'company';
  } else {
    ElNotification({
      title: '權限錯誤',
      message: '您沒有訪問成員管理頁面的權限',
      type: 'error',
    });
    throw new Error('Unauthorized access to member management page');
  }
})

const currentPage = ref<number>(1);
const pageSize = ref<number>(10);
const queryText = ref<string>('');

const totalCount = ref<number>(0);
const userService = useUserService(role.value);
const userList = ref<SysUser[]>([]);

const findChildUserByQueryTextAndPagination = async (page: number, size: number, queryText: string) => {
  const { res, error }: any = await tryCatch(userService.fetchChildUsers(page, size, queryText));
  console.log(res, error)
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法獲取用戶列表',
      type: 'error',
    });
    return;
  }

  userList.value = res.data.records;
  totalCount.value = res.data.total;
}

const sysUser = ref<SysUser>({} as SysUser);
const findUserById = async (sysUserId: string) => {
  const { res, error }: any = await tryCatch(userService.fetchUserById(sysUserId));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法獲取用戶信息',
      type: 'error',
    });
    return;
  }

  sysUser.value = res.data;
}

const handleChangeUserStatus = async (sysUserId: string, isActive: number) => {
  const payload: UpdateUserStatus = {
    sysUserId: sysUserId,
    status: isActive,
  }
  const { res, error }: any = await tryCatch(userService.updateUserStatus(payload));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法更新用戶狀態',
      type: 'error',
    });
    findChildUserByQueryTextAndPagination(currentPage.value, pageSize.value, queryText.value);
    return;
  }

  ElNotification({
    title: '成功',
    message: '用戶狀態已更新',
    type: 'success',
  });

  // 刷新用戶列表
  findChildUserByQueryTextAndPagination(currentPage.value, pageSize.value, queryText.value);
}

const detailDrawerState = reactive({
  isOpen: false,
  open: (id: string) => {
    detailDrawerState.isOpen = true;
    findUserById(id);
  },
  close: () => {
    detailDrawerState.isOpen = false;
  }
})

const updateDialogState = reactive({
  isOpen: false,
  open: (id: string) => {
    updateDialogState.isOpen = true;
    findUserById(id);
  },
  close: () => {
    updateDialogState.isOpen = false;
    findChildUserByQueryTextAndPagination(currentPage.value, pageSize.value, queryText.value);
  }
})

const createDialogState = reactive({
  isOpen: false,
  open: () => {
    createDialogState.isOpen = true;
  },
  close: () => {
    createDialogState.isOpen = false;
    findChildUserByQueryTextAndPagination(currentPage.value, pageSize.value, queryText.value);
  }
})

const handleDeleteUser = async (sysUserId: string) => {
  ElMessageBox.confirm('確定要刪除該用戶嗎？', '警告', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const { res, error }: any = await tryCatch(userService.deleteUser(sysUserId));
    if (error || res.code !== 200) {
      ElNotification({
        title: '錯誤',
        message: '無法刪除用戶',
        type: 'error',
      });
      return;
    }

    ElNotification({
      title: '成功',
      message: '用戶已刪除',
      type: 'success',
    });

    // 刷新用戶列表
    findChildUserByQueryTextAndPagination(currentPage.value, pageSize.value, queryText.value);
  }).catch(() => {
    // 用戶取消刪除操作
  });
}

onMounted(() => {
  findChildUserByQueryTextAndPagination(currentPage.value, pageSize.value, queryText.value);
})


</script>

<style scoped lang="scss">
.member-section {
  width: 95%;
  margin: 0 auto;

  .member-card {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin: 1% 0;
  }
}




.function-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1%;

  .total-count {
    font-weight: 600;
  }



}

.search-box {
  display: flex;
  align-items: center;
  gap: 1rem;

  .el-input,
  .el-select {
    width: 15rem;
  }

  @media screen and (max-width: 760px) {
    flex-direction: column;
  }
}

.member-table {
  width: 100%;
  height: auto;
}


.member-pagination {
  margin-top: 1%;
  margin-bottom: 1%;
}

.gender-other {
  width: 100px;
  margin-left: 1rem;
}

.transfer-box {
  display: flex;
  justify-content: center;
}

.tag-item {
  display: flex;
}

/**
  使用Vue3 element plus 專屬的改變UI組件CSS 寫法 '深層覆蓋'
  分頁組件引入盒子,重置分頁組件CSS */
:deep(.el-pagination) {

  justify-content: center;

  //重製將分頁組件背景色調為 '無'
  .el-pager li {
    background: none !important;
  }

  //按鈕背景色改成 '無'
  button {
    background: none !important;
  }

  &+& {
    margin-top: 10px;
  }

  .example-demonstration {
    margin-bottom: 16px;
  }

}

:deep(.el-tag__content) {
  color: white;
  font-size: 14px;
}

:deep(.el-tag__close) {
  color: red;
}

.insert-form {
  padding: 2rem;
  width: 80%;
  margin-inline: auto;

  .el-select {
    width: 100%;
  }

  .el-input {
    width: 100%;
  }

  .category {

    :deep(.el-radio-group) {
      flex-direction: column;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
    }

    :deep(.el-form-item__error) {
      position: absolute;
      top: 0.5rem;
      left: 10rem;
      width: 20rem;

      @media screen and (max-width: 768px) {
        left: 13rem;
      }
    }

    :deep(.el-select) {
      width: 150px;
    }

  }

  .phone-section {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;

    .country-code {
      width: 30%;
    }

    .phone {
      width: 70%;
    }
  }

  .title-form-item {
    width: 100%;

    .title-radio-group {
      width: 100%
    }
  }


}

// 設置 transfer 面板寬度
:deep(.el-transfer-panel) {
  width: 300px;

  .el-transfer-panel__body {
    overflow: hidden;
  }

}

// 設置 transfer 面板內列表為 column 並設置間距
:deep(.el-transfer-panel__list) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(.el-transfer__buttons) {
  @media screen and (max-width: 760px) {
    display: flex;
    justify-content: center;
    margin: 1rem 0;

    .el-button {
      &:first-child {
        .el-icon {
          transform: rotate(90deg);
        }
      }

      &:last-child {
        .el-icon {
          transform: rotate(90deg);
        }
      }
    }
  }

}


// 設置 table 內的標籤顯示為可滑動區塊
.tag-popover-box {
  overflow: scroll !important;
}
</style>
