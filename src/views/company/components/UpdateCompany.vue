<template>
  <div class="update-panel">
    <el-empty v-if="!hasData" description="請先選擇要編輯的用戶" :image-size="100" />

    <el-form v-else ref="updateFormRef" :model="formData" :rules="rules" label-width="92px" class="update-form"
      @submit.prevent status-icon>

      <el-form-item label="公司名稱" prop="name">
        <el-input v-model="formData.name" placeholder="請輸入公司名稱" clearable />
      </el-form-item>

      <el-form-item label="公司狀態" prop="status">
        <el-select v-model="formData.status" placeholder="請選擇公司狀態">
          <el-option label="啟用" value="enabled"></el-option>
          <el-option label="停用" value="disabled"></el-option>
          <el-option label="過期" value="expired"></el-option>
        </el-select>
      </el-form-item>


      <div class="action-row">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="props.submitting" @click="handleSubmit">儲存變更</el-button>
      </div>
    </el-form>
  </div>
</template>
<script setup lang='ts'>
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { computed, reactive, ref, watch } from 'vue';
import { tryCatch } from '@/utils/tryCatch';
import { Company, UpdateCompany } from '@/api/company/type';
import { updateCompanyApi } from '@/api/company';


const props = defineProps<{
  company: Company;
  submitting?: boolean;
}>();


const emit = defineEmits(['submit', 'cancel']);

const EMPTY_USER: UpdateCompany = {
  companyId: '',
  name: '',
  status: 'enabled',
};

const updateFormRef = ref<FormInstance>();
const formData = reactive<UpdateCompany>({ ...EMPTY_USER });

const hasData = computed(() => Boolean(props.company?.companyId));

const rules = reactive<FormRules<UpdateCompany>>({
  companyId: [{ required: true, message: '請輸入公司ID', trigger: 'blur' }],
  name: [{ required: true, message: '請輸入公司名稱', trigger: 'blur' }],
  status: [{ required: true, message: '請選擇公司狀態', trigger: 'change' }],
});

const syncFormData = (company: Company) => {
  formData.companyId = company.companyId;
  formData.name = company.name;
  formData.status = company.status;
};

watch(
  () => props.company,
  (value) => {
    syncFormData(value || ({} as Company));
    updateFormRef.value?.clearValidate();
  },
  { immediate: true, deep: true }

);

const handleCancel = () => {
  emit('cancel');
};

const handleSubmit = async () => {
  if (!updateFormRef.value) {
    return;
  }

  const valid = await updateFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const { res, error }: any = await tryCatch(updateCompanyApi(formData));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法更新企業資訊',
      type: 'error',
    });
    return;
  }

  updateFormRef.value.resetFields();
  ElNotification({
    title: '成功',
    message: '企業資訊已更新',
    type: 'success',
  });
  emit('submit');
};
</script>
<style lang='scss' scoped>
.update-panel {
  min-height: 220px;
}

.update-form {
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