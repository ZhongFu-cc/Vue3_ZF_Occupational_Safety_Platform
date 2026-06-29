<template>
  <div class="update-panel">
    <el-empty v-if="!hasData" description="請先選擇要編輯的用戶" :image-size="100" />

    <el-form v-else ref="updateFormRef" :model="formData" :rules="rules" label-width="92px" class="update-form"
      @submit.prevent status-icon>
      <el-form-item label="登入帳號" prop="account">
        <el-input v-model="formData.account" placeholder="請輸入登入帳號" clearable />
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

      <el-form-item label="公司名稱" prop="companyName">
        <el-input v-model="formData.companyName" placeholder="請輸入公司名稱" clearable />
      </el-form-item>

      <el-form-item v-if="props.role === 'company'" label="部門" prop="departmentId">
        <el-select @end-reached="findDepartmentList(false)" v-model="formData.departmentId" filterable remote clearable
          placeholder="請選擇部門">
          <el-option v-for="department in departmentList" :key="department.departmentId" :label="department.name"
            :value="department.departmentId" />
        </el-select>
      </el-form-item>

      <el-form-item label="密碼" prop="password">
        <el-input v-model="formData.password" type="password" show-password placeholder="請輸入密碼" clearable
          autocomplete="new-password" />
      </el-form-item>

      <el-form-item label="備註" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" maxlength="200" show-word-limit
          placeholder="請輸入備註" />
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
import type { PutSysUser, SysUser } from '@/api/system/type';
import { useUserService } from '@/service/UserService';
import { tryCatch } from '@/utils/tryCatch';
import { findDepartmentListByQueryTextAndPaginationApi } from '@/api/department';
import { Department } from '@/api/department/type';


const props = defineProps<{
  sysUser: SysUser;
  submitting?: boolean;
  role: 'admin' | 'company';
}>();

const userService = useUserService(props.role);

const emit = defineEmits(['submit', 'cancel']);

const EMPTY_USER: PutSysUser = {
  sysUserId: '',
  account: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  companyName: '',
  remark: '',
  departmentId: '',
};

const updateFormRef = ref<FormInstance>();
const formData = reactive<PutSysUser>({ ...EMPTY_USER });

const hasData = computed(() => Boolean(props.sysUser?.sysUserId));

const rules = reactive<FormRules<PutSysUser>>({
  account: [{ required: true, message: '請輸入登入帳號', trigger: 'blur' }],
  realName: [{ required: true, message: '請輸入用戶名稱', trigger: 'blur' }],
  email: [
    { required: true, message: '請輸入電子信箱', trigger: 'blur' },
    { type: 'email', message: '電子信箱格式錯誤', trigger: ['blur', 'change'] },
  ],
  phone: [{ required: true, message: '請輸入聯絡電話', trigger: 'blur' }],
  companyName: [{ required: true, message: '請輸入公司名稱', trigger: 'blur' }],
  password: [{ required: true, message: '請輸入密碼', trigger: 'blur' }],
});

const syncFormData = (user: SysUser) => {
  formData.sysUserId = user?.sysUserId ?? '';
  formData.account = user?.account ?? '';
  formData.password = user?.password ?? '';
  formData.realName = user?.realName ?? '';
  formData.email = user?.email ?? '';
  formData.phone = user?.phone ?? '';
  formData.companyName = user?.companyName ?? '';
  formData.remark = user?.remark ?? '';
  formData.departmentId = user?.departmentId ?? '';
};

watch(
  () => props.sysUser,
  (value) => {
    syncFormData(value || ({} as SysUser));
    updateFormRef.value?.clearValidate();
  },
  { immediate: true, deep: true }
);

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

  const { res, error }: any = await tryCatch(userService.updateUser(formData));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法更新用戶資訊',
      type: 'error',
    });
    return;
  }

  updateFormRef.value.resetFields();
  ElNotification({
    title: '成功',
    message: '用戶資訊已更新',
    type: 'success',
  });
  emit('submit');
};

onMounted(() => {
  if (props.role === 'company') {
    findDepartmentList(true);
  }
});
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