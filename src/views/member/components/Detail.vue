<template>
  <div class="detail-panel">
    <el-empty v-if="!hasData" description="暫無用戶資料" :image-size="100" />

    <template v-else>
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基本資料</span>
            <el-tag :type="statusType">{{ statusText }}</el-tag>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="用戶名稱">{{ displayValue(props.sysUser.realName) }}</el-descriptions-item>
          <el-descriptions-item label="登入帳號">{{ displayValue(props.sysUser.account) }}</el-descriptions-item>
          <el-descriptions-item label="電子信箱">{{ displayValue(props.sysUser.email) }}</el-descriptions-item>
          <el-descriptions-item label="聯絡電話">{{ displayValue(props.sysUser.phone) }}</el-descriptions-item>
          <el-descriptions-item label="公司名稱">{{ displayValue(props.sysUser.companyName) }}</el-descriptions-item>
          <el-descriptions-item label="所屬部門">{{ displayValue(props.sysUser.departmentName) }}</el-descriptions-item>
          <el-descriptions-item label="備註">{{ displayValue(props.sysUser.remark) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>系統資訊</span>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="用戶 ID">{{ displayValue(props.sysUser.sysUserId) }}</el-descriptions-item>
          <el-descriptions-item label="建立者">{{ displayValue(props.sysUser.createBy) }}</el-descriptions-item>
          <el-descriptions-item label="建立時間">{{ formatDateTime(props.sysUser.createDate) }}</el-descriptions-item>
          <el-descriptions-item label="最後更新者">{{ displayValue(props.sysUser.updateBy) }}</el-descriptions-item>
          <el-descriptions-item label="最後更新時間">{{ formatDateTime(props.sysUser.updateDate) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </template>
  </div>
</template>
<script setup lang='ts'>
import { computed } from 'vue';
import type { SysUser } from '@/api/system/type';

const props = defineProps<{
  sysUser: SysUser;
}>();


console.log('props.sysUser: ', props.sysUser);

const EMPTY_TEXT = '-';

const hasData = computed(() => Boolean(props.sysUser?.sysUserId));

const statusText = computed(() => props.sysUser?.isActive === 1 ? '啟用中' : '停用中');

const statusType = computed<'success' | 'info'>(() => props.sysUser?.isActive === 1 ? 'success' : 'info');

const displayValue = (value?: string) => {
  if (!value || !value.trim()) {
    return EMPTY_TEXT;
  }

  return value;
};

const formatDateTime = (value?: string) => {
  if (!value || !value.trim()) {
    return EMPTY_TEXT;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-TW', {
    hour12: false,
  });
};
</script>
<style lang='scss' scoped>
.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-card {
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
  }

  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 600;
}

:deep(.el-descriptions__label) {
  width: 10rem;
}

@media (max-width: 768px) {
  :deep(.el-descriptions__label) {
    width: 9rem;
  }
}
</style>