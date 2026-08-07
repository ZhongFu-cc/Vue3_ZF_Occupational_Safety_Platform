<template>
  <div class="import-notice">

    <el-alert title="請依照指定格式上傳 Excel 檔案" type="warning" :closable="false" show-icon />

    <p class="tip-title">
      上傳一份 Excel 檔，欄位如下（第一列是表頭，名稱必須完全一致）：
    </p>

    <el-table :data="excelExample" border style="width: 100%">
      <el-table-column prop="department" label="部門" />
      <el-table-column prop="realName" label="姓名" />
      <el-table-column prop="account" label="帳號" />
      <el-table-column prop="password" label="密碼" />
      <el-table-column prop="email" label="信箱" />
      <el-table-column prop="phone" label="電話號碼" />
    </el-table>

    <div class="upload-area">
      <!-- <el-upload :show-file-list="true" :auto-upload="false" :limit="1" accept=".xlsx,.xls"
        :on-change="handleExcelChange">
        <el-button type="primary">
          選擇 Excel 檔案
        </el-button>
      </el-upload> -->

      <el-upload class="upload-demo" drag :show-file-list="true" :auto-upload="false" :limit="1" accept=".xlsx,.xls"
        :on-change="handleExcelChange">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖曳 Excel 檔案 <em>點擊上傳</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            僅支援 Excel 檔案
          </div>
        </template>
      </el-upload>
    </div>

    <div class="btn-box">
      <!-- <el-button type="primary" @click="handleImport()" :disabled="!file">匯入 Excel 檔案</el-button> -->
      <el-button type="danger" disabled>開發中</el-button>

    </div>

  </div>
</template>

<script lang="ts" setup>
import { importExcelApi } from '@/api/system/company';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification, UploadFile } from 'element-plus';

const emits = defineEmits(['importSuccess']);

const excelExample = ref([
  {
    department: '工務部',
    realName: '陳大文',
    account: 'emp001',
    password: 'Pa55word',
    email: 'emp001@example.com',
    phone: '0912345678',
  },
  {
    department: '品保部',
    realName: '林小美',
    account: 'emp002',
    password: 'Pa55word',
    email: 'emp002@example.com',
    phone: '0922333444',
  }
]);


let file = ref<any>(null);

const handleExcelChange = async (newFile: UploadFile) => {
  console.log('handleExcelChange', newFile);
  file.value = newFile.raw;
}

const handleImport = async () => {
  const formData = new FormData();
  console.log('handleImport', file);

  if (!file.value) {
    ElNotification.error({
      title: '匯入失敗',
      message: '請先選擇 Excel 檔案',
    });
    return;
  }
  formData.append('file', file.value);
  console.log('formData', formData.get('file'));

  const { res, error }: any = await tryCatch(importExcelApi(formData));
  if (error || res.code !== 200) {
    ElNotification.error({
      title: '匯入失敗',
      message: res?.message || '請檢查 Excel 檔案格式是否正確',
    });
    return;
  }

  ElNotification.success({
    title: '匯入成功',
    message: '已成功匯入用戶資料',
  });

  emits('importSuccess');
};
</script>