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

      <el-form-item v-if="props.role === 'company'" label="部門" prop="departmentId">
        <el-select @end-reached="findDepartmentList(false)" v-model="formData.departmentId" filterable remote clearable
          placeholder="請選擇部門">
          <el-option v-for="department in departmentList" :key="department.departmentId" :label="department.name"
            :value="department.departmentId" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="props.role === 'admin'" label="公司名稱" prop="companyId">
        <el-select v-model="formData.companyId" placeholder="請選擇公司" clearable filterable>
          <el-option v-for="company in companyList" :key="company.companyId" :label="company.name"
            :value="company.companyId" />
        </el-select>
      </el-form-item>

      <!-- <el-form-item label="公司" prop="companyId">
        <el-select @end-reached="findCompanyList(false)" v-model="formData.companyId" filterable remote clearable
          placeholder="請選擇公司" :remote-method="remoteMethod">
          <el-option v-for="company in companyList" :key="company.companyId" :label="company.name"
            :value="company.companyId" />
        </el-select>
      </el-form-item> -->

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
import { findCompanyListByQueryTextAndPaginationApi, findAllCompanyListApi } from '@/api/company';
import { Company } from '@/api/company/type';
import { useUserStore } from '@/store';
import { findDepartmentListByQueryTextAndPaginationApi } from '@/api/department';
import { Department } from '@/api/department/type';

const props = defineProps<{
  role: 'admin' | 'company';
  submitting?: boolean;
}>();



const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();

const userService = useUserService(props.role);
const user = useUserStore().user;

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
  companyId: [{ required: true, message: '請選擇公司', trigger: 'change' }],
  departmentId: [{ required: true, message: '請選擇部門', trigger: 'change' }],
});

const resetForm = () => {
  Object.assign(formData, EMPTY_FORM);
  createFormRef.value?.clearValidate();
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

const selectCompany = ref<Company>({} as Company);

const handleSubmit = async () => {
  if (!createFormRef.value) {
    return;
  }

  const valid = await createFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  if (props.role === 'admin') {
    formData.companyName = companyList.value.find(c => c.companyId === formData.companyId)?.name || '';
    // formData.companyId is already set by v-model
  } else if (props.role === 'company') {
    formData.companyName = user.companyName;
    formData.companyId = user.companyId;
  }

  const { res, error }: any = await tryCatch(userService.createUser({
    account: formData.account.trim(),
    password: formData.password,
    realName: formData.realName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    companyName: formData.companyName,
    companyId: formData.companyId,
    remark: formData.remark.trim(),
    departmentId: formData.departmentId,
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

const companyList = ref<Company[]>([]);
const findCompanyList = async () => {

  const { res, error }: any = await tryCatch(findAllCompanyListApi());
  console.log('findAllCompanyListApi res', res, 'error', error);
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法獲取公司列表',
      type: 'error',
    });
    return;
  }
  companyList.value = res.data;
};

const departmentList = ref<Department[]>([]);
const departmentCurrentPage = ref(1);
const departmentHasMore = ref(true);
const findDepartmentList = async (isRefresh = false) => {
  if (isRefresh) {
    departmentCurrentPage.value = 1;
    departmentList.value = [];
  }

  if (!departmentHasMore.value && !isRefresh) {
    console.log('沒有更多部門了')
    return;
  }

  const { res, error }: any = await tryCatch(findDepartmentListByQueryTextAndPaginationApi(departmentCurrentPage.value, 10, ''));
  console.log('findDepartmentListByQueryTextAndPaginationApi res', res, 'error', error);
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法獲取部門列表',
      type: 'error',
    });
    return;
  }
  departmentList.value = res.data.records;
  departmentHasMore.value = departmentList.value.length < res.data.total;

  if (departmentHasMore.value) {
    departmentCurrentPage.value++;
  }
}


watch(() => props.role, () => {
  if (props.role === 'admin') {
    findCompanyList();
  } else if (props.role === 'company') {
    findDepartmentList(true);
  }
}, { immediate: true });

onMounted(() => {
  // findCompanyList(true);
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
