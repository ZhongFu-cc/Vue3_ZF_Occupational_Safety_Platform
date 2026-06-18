<template>
  <div>
    <BasicComponent title="企業管理">
      <template #search-box>
        <el-input v-model="queryText" placeholder="請輸入企業名稱" @keyup.enter="findCompanyList"></el-input>
        <el-button @click="findCompanyList" type="primary">搜尋</el-button>
      </template>

      <template #option-box>
        <el-button type="primary" @click="createDialogState.open">新增企業</el-button>
      </template>

      <template #data-table>
        <el-table v-if="hasData" :data="companyList">
          <el-table-column prop="name" label="企業名稱"></el-table-column>
          <el-table-column width="200">
            <template #default="{ row }: { row: Company }">
              <el-select v-model="row.status" placeholder="請選擇企業狀態" @change="updateStatus(row)">
                <el-option label="啟用" value="enabled"></el-option>
                <el-option label="停用" value="disabled"></el-option>
                <el-option label="過期" value="expired"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column width="150" label="操作">
            <template #default="{ row }: { row: Company }">
              <el-button link type="primary" @click="updateDialogState.open(row)">編輯</el-button>
              <!-- <el-button link type="danger" @click="deleteCompany(row.companyId)">刪除</el-button> -->
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else></el-empty>
      </template>
    </BasicComponent>

    <el-dialog v-model="createDialogState.isOpen" title="新增企業" width="30%">
      <CreateForm @submit="findCompanyList" @cancel="createDialogState.close" />
    </el-dialog>
    <el-dialog v-model="updateDialogState.isOpen" title="編輯企業" width="30%">
      <UpdateForm :company="updateCompany" @submit="findCompanyList" @cancel="updateDialogState.close" />
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { findCompanyListByQueryTextAndPaginationApi, updateCompanyApi } from '@/api/company';
import { Company, UpdateCompany } from '@/api/company/type';
import BasicComponent from '@/layout/components/Basic/index.vue'
import CreateForm from './components/CreateCompany.vue';
import UpdateForm from './components/UpdateCompany.vue';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';

const currentPage = ref<number>(1);
const queryText = ref<string>('');
const hasData = computed(() => companyList.value.length > 0);

const companyList = ref<Company[]>([]);
const findCompanyList = async () => {
  const { res, error }: any = await tryCatch(findCompanyListByQueryTextAndPaginationApi(currentPage.value, 10, queryText.value));
  console.log('res', res);
  if (error || res.code !== 200) {
    ElNotification.error({
      title: '錯誤',
      message: '獲取企業列表失敗',
    });
    return;
  }

  createDialogState.close();
  updateDialogState.close();
  companyList.value = res.data.records;
}

const updateStatus = async (company: Company) => {
  const payload: UpdateCompany = {
    companyId: company.companyId,
    name: company.name,
    status: company.status,
  }
  const { res, error }: any = await tryCatch(updateCompanyApi(payload))

  if (error || res.code !== 200) {
    ElNotification.error({
      title: '錯誤',
      message: '更新企業狀態失敗',
    });
    return;
  }
  ElNotification.success({
    title: '成功',
    message: '更新企業狀態成功',
  });
  findCompanyList();
}

const createDialogState = reactive({
  isOpen: false,
  open: () => {
    createDialogState.isOpen = true;
  },
  close: () => {
    createDialogState.isOpen = false;
  },
})

const updateCompany = reactive<Company>({} as Company);
const updateDialogState = reactive({
  isOpen: false,
  open: (company: Company) => {
    updateDialogState.isOpen = true;
    Object.assign(updateCompany, company);
  },
  close: () => {
    updateDialogState.isOpen = false;
  },
})


onMounted(() => {
  findCompanyList();
});
</script>
<style lang="scss" scoped>
.el-select {
  width: 5rem;
}
</style>