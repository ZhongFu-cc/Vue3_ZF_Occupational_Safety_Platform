<template>
  <div>
    <BasicComponent title="作業類別管理">
      <template #option-box>
        <el-button type="primary" @click="createDialogState.open">新增作業類別</el-button>
      </template>
      <template #data-table>
        <el-table :data="jobTypeList">
          <el-table-column prop="name" label="作業類別名稱" :show-overflow-tooltip="true" />
          <el-table-column prop="description" label="作業類別描述" />
          <el-table-column label="是否啟用">
            <template #default="{ row }">
              <el-tag :type="row.isActive === 1 ? 'success' : 'danger'">{{ row.isActive === 1 ? '啟用' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column>
            <template #default="{ row }">
              <el-button type="primary" link @click="updateDialogState.open(row)">編輯</el-button>
              <el-button type="danger" link @click="deleteJobTypeById(row.id)">刪除</el-button>
              <el-button type="warning" link @click="goToCourseType(row.jobTypeId)">課程</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </BasicComponent>

    <el-dialog v-model="createDialogState.isOpen" title="新增作業類別">
      <CreateForm @close="createDialogState.close" @created="findAllJobTypeByQueryTextAndPagination" />
    </el-dialog>

    <el-drawer v-model="updateDialogState.isOpen" title="編輯作業類別">
      <UpdateForm :jobType="updateJobType" :submitting="updateDialogState.submitting" @cancel="updateDialogState.close"
        @submit="findAllJobTypeByQueryTextAndPagination" />
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { deleteJobTypeByIdApi, findJobTypeByQueryTextAndPaginationApi } from '@/api/jobType';
import { JobType, UpdateJobType } from '@/api/jobType/type';
import BasicComponent from '@/layout/components/Basic/index.vue'
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';

import CreateForm from './components/CreateJobType.vue'
import UpdateForm from './components/UpdateJobType.vue'

const router = useRouter()

const jobTypeList = ref<JobType[]>([])

const queryText = ref<string>('')
const currentPage = ref<number>(1)

const findAllJobTypeByQueryTextAndPagination = async () => {
  const { res, error }: any = await tryCatch(findJobTypeByQueryTextAndPaginationApi(currentPage.value, 10, queryText.value))
  console.log(res, error)
  if (error || res.code !== 200) {
    ElNotification({
      type: 'error',
      message: '獲取作業類別列表失敗',
      duration: 5000
    })
    return
  }

  jobTypeList.value = res.data.records
  createDialogState.close()
  updateDialogState.close()
}

const deleteJobTypeById = async (id: string) => {
  ElMessageBox.confirm('確定要刪除該作業類別嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const { res, error }: any = await tryCatch(deleteJobTypeByIdApi(id))
    if (error || res.code !== 200) {
      ElNotification({
        type: 'error',
        message: '刪除作業類別失敗',
        duration: 5000
      })
      return
    }

    ElNotification({
      type: 'success',
      message: '刪除作業類別成功',
      duration: 5000
    })
    findAllJobTypeByQueryTextAndPagination()
  }).catch(() => {
    // 取消刪除
  })
}

const createDialogState = reactive({
  isOpen: false,
  open: () => {
    createDialogState.isOpen = true;
  },
  close: () => {
    createDialogState.isOpen = false;
  }
})

const updateJobType = reactive<UpdateJobType>({} as UpdateJobType);
const updateDialogState = reactive({
  isOpen: false,
  submitting: false,
  open: (jobType: UpdateJobType) => {
    Object.assign(updateJobType, jobType);
    updateDialogState.isOpen = true;
  },
  close: () => {
    updateDialogState.isOpen = false;
    Object.assign(updateJobType, {} as UpdateJobType);
    updateDialogState.submitting = false;
  }
})

const goToCourseType = (jobTypeId: string) => {
  router.push(`/job-type-course/${jobTypeId}`);
}

onMounted(() => {
  findAllJobTypeByQueryTextAndPagination()
})
</script>
<style lang="less" scoped></style>