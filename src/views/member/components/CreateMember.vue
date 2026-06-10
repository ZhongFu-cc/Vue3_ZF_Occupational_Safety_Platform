<template>
  <div class="create-panel">
    <el-form ref="createFormRef" :model="formData" :rules="rules" label-width="92px" class="create-form" @submit.prevent
      status-icon>
      <el-form-item label="登入帳號" prop="account">
        <el-input v-model="formData.account" placeholder="請輸入登入帳號" clearable />
      </el-form-item>

      <el-form-item label="密碼" prop="password">
        <el-input v-model="formData.password" type="password" show-password placeholder="請輸入密碼" clearable
          autocomplete="new-password" />
      </el-form-item>

      <el-form-item label="用戶名稱" prop="realName">
        <el-input v-model="formData.realName" placeholder="請輸入用戶名稱" clearable />
      </el-form-item>

      <el-form-item label="電子信箱" prop="email">
        <el-input v-model="formData.email" placeholder="請輸入電子信箱" clearable />
      </el-form-item>

      <el-form-item label="聯絡電話" prop="phone">
        <el-input v-model="formData.phone" placeholder="請輸入聯絡電話" clearable />
      </el-form-item>

      <!-- <el-form-item label="公司名稱" prop="companyName">
        <el-input v-model="formData.companyName" placeholder="請輸入公司名稱" clearable />
      </el-form-item> -->

      <el-form-item label="公司" prop="companyId">
        <el-select @end-reached="findCompanyList(false)" v-model="formData.companyId" filterable remote clearable
          placeholder="請選擇公司" :remote-method="remoteMethod">
          <el-option v-for="company in companyList" :key="company.companyId" :label="company.name"
            :value="company.companyId" />
        </el-select>
      </el-form-item>

      <el-form-item label="備註" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" maxlength="200" show-word-limit
          placeholder="請輸入備註" />
      </el-form-item>

      <div class="action-row">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="props.submitting" @click="handleSubmit">新增用戶</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { reactive, ref } from 'vue';
import type { AddSysUser } from '@/api/system/type';
import { useUserService } from '@/service/UserService';
import { tryCatch } from '@/utils/tryCatch';
import { findCompanyListByQueryTextAndPaginationApi } from '@/api/company';
import { Company } from '@/api/company/type';

const props = defineProps<{
  role: 'admin' | 'company';
  submitting?: boolean;
}>();

const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();

const userService = useUserService(props.role);

const EMPTY_FORM: AddSysUser = {
  account: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  companyName: '',
  remark: '',
  companyId: '',
  departmentId: '',
};

const createFormRef = ref<FormInstance>();
const formData = reactive<AddSysUser>({ ...EMPTY_FORM });

const rules = reactive<FormRules<AddSysUser>>({
  account: [{ required: true, message: '請輸入登入帳號', trigger: 'blur' }],
  password: [{ required: true, message: '請輸入密碼', trigger: 'blur' },
  { min: 6, message: '密碼至少需要6個字元', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '請輸入用戶名稱', trigger: 'blur' }],
  email: [
    { required: true, message: '請輸入電子信箱', trigger: 'blur' },
    { type: 'email', message: '電子信箱格式錯誤', trigger: ['blur', 'change'] },
  ],
  phone: [{ required: true, message: '請輸入聯絡電話', trigger: 'blur' }],
  companyName: [{ required: true, message: '請輸入公司名稱', trigger: 'blur' }],
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

  const { res, error }: any = await tryCatch(userService.createUser({
    account: formData.account.trim(),
    password: formData.password,
    realName: formData.realName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    companyName: formData.companyName.trim(),
    remark: formData.remark.trim(),
  }));

  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法新增用戶',
      type: 'error',
    });
    return;
  }

  ElNotification({
    title: '成功',
    message: '用戶已新增',
    type: 'success',
  });

  resetForm();
  emit('submit');
};

const currentPage = ref(1);
const queryText = ref('');
const companyList = ref<Company[]>([]);
const hasMore = ref(true);
const findCompanyList = async (isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1;
    companyList.value = [];
  }

  if (!hasMore.value && !isRefresh) {
    console.log('沒有更多公司了')
    return;
  }

  const { res, error }: any = await tryCatch(findCompanyListByQueryTextAndPaginationApi(currentPage.value, 10, queryText.value));
  console.log('findCompanyListByQueryTextAndPaginationApi res', res, 'error', error);
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法獲取公司列表',
      type: 'error',
    });
    return;
  }
  companyList.value = res.data.records;
  hasMore.value = companyList.value.length < res.data.total;

  if (hasMore.value) {
    currentPage.value++;
  }
}

const remoteMethod = (query: string) => {
  queryText.value = query;
  findCompanyList(true);
};

onMounted(() => {
  findCompanyList(true);
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
