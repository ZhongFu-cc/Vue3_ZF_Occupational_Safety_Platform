<template>
  <div class="create-panel">
    <el-form ref="createFormRef" :model="formData" :rules="rules" label-width="92px" class="create-form" @submit.prevent
      status-icon label-position="top">
      <el-form-item label="企業名稱" prop="name">
        <el-input v-model="formData.name" placeholder="請輸入企業名稱" clearable />
      </el-form-item>

      <el-form-item label="企業狀態" prop="status">
        <el-select v-model="formData.status" placeholder="請選擇企業狀態">
          <el-option label="啟用" value="enabled"></el-option>
          <el-option label="停用" value="disabled"></el-option>
          <el-option label="過期" value="expired"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="相關職位類型" prop="jobTypeIds">
        <el-checkbox-group v-model="formData.jobTypeIds">
          <el-checkbox v-for="jobType in jobTypeList" :key="jobType.jobTypeId" :label="jobType.name"
            :value="jobType.jobTypeId" />
        </el-checkbox-group>

      </el-form-item>


      <div class="action-row">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">新增企業</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { tryCatch } from '@/utils/tryCatch';
import { AddCompany } from '@/api/company/type';
import { createCompanyApi } from '@/api/company';
import { JobType } from '@/api/jobType/type';
import { findJobTypeListApi } from '@/api/jobType';



const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();

const jobTypeList = ref<JobType[]>([]);
const findJobTypeList = async () => {
  const { res, error }: any = await tryCatch(findJobTypeListApi());
  if (error || res.code !== 200) {
    ElNotification.error({
      title: '錯誤',
      message: '獲取職位類型列表失敗',
    });
    return;
  }

  jobTypeList.value = res.data;
};


const EMPTY_FORM: AddCompany = {
  name: '',
  status: 'enabled',
  jobTypeIds: [],
};

const createFormRef = ref<FormInstance>();
const formData = reactive<AddCompany>({ ...EMPTY_FORM });

const validJobTypeIds = (rule: any, value: any, callback: any) => {
  if (formData.jobTypeIds.length === 0) {
    callback(new Error('請至少選擇一個職位類型'));
  } else {
    callback();
  }
}
const rules = reactive<FormRules<AddCompany>>({
  name: [{ required: true, message: '請輸入企業名稱', trigger: 'blur' }],
  status: [{ required: true, message: '請選擇企業狀態', trigger: 'change' }],
  jobTypeIds: [{ validator: validJobTypeIds, trigger: 'change' }],
});


const resetForm = () => {
  Object.assign(formData, EMPTY_FORM);
  createFormRef.value?.clearValidate();
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

const handleSubmit = async () => {
  if (!createFormRef.value) {
    return;
  }

  const valid = await createFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const { res, error }: any = await tryCatch(createCompanyApi(formData));

  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法新增企業',
      type: 'error',
    });
    return;
  }

  ElNotification({
    title: '成功',
    message: '企業已新增',
    type: 'success',
  });

  resetForm();
  emit('submit');
};

onMounted(() => {
  findJobTypeList();
});
</script>

<style lang="scss" scoped>
.create-panel {
  min-height: 220px;
}

.create-form {
  padding-top: 8px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .action-row {
    justify-content: space-between;
  }
}
</style>
