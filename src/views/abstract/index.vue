<template>
  <section class="abstract-section">
    <el-card class="abstract-card">
      <h1>稿件列表</h1>

      <div class="function-bar">
        <div class="display-count">
          <div>當前查詢數量為： {{ paperList.total }} 件</div>
        </div>

        <div class="btn-box">

        </div>
      </div>

      <div class="search-bar">
        <div class="query-box">
          <el-input v-model="input" placeholder="輸入內容,Enter查詢" @input="getPaperList()" />
          <el-select v-model="filterAbsType" class="filter-abs-type" placeholder="請選擇投稿類型" @change="getPaperList()">
            <el-option value="Poster Presentation"></el-option>
            <el-option value="Video Presentation"></el-option>
            <el-option value="Young Investigator"></el-option>
            <el-option value="" label="All"></el-option>
          </el-select>
        </div>

        <div class="operate-btn-box">
          <el-button v-for="action in primaryActions" :key="action.label" :type="action.type || 'primary'"
            @click="action.action">
            {{ action.label }}
          </el-button>

          <el-dropdown placement="bottom-start" trigger="hover">
            <el-button><el-icon>
                <MoreFilled />
              </el-icon></el-button>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="action in overflowActions" :key="action.label" @click="action.action">
                  {{ action.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>


      <el-table :data="paperList.records" style="width: 100%">
        <el-table-column prop="absType" label="投稿類別" width="200"></el-table-column>
        <!-- <el-table-column prop="absProp" label="文章屬性" width="100"></el-table-column> -->
        <el-table-column prop="absTitle" label="稿件主題"></el-table-column>
        <el-table-column prop="tagSet" label="標籤" min-width="40" align="center">
          <template #default="scope">
            <el-popover v-if="scope.row.tagList.length > 0" placement="left-start" title="標籤" :width="200"
              trigger="hover">
              <template #reference>
                <el-tag v-if="findFirstVaildTag(scope.row.tagList)" size="large" round
                  :color="findFirstVaildTag(scope.row.tagList).color" effect="light">{{
                    findFirstVaildTag(scope.row.tagList).name }}</el-tag>
              </template>
              <template #default>
                <div v-for="tag in scope.row.tagList" :key="tag.tagId" class="tag-item">
                  <el-tag v-if="tag.status === 0" size="large" round :color="tag.color">{{
                    tag.name }}</el-tag>
                </div>
              </template>
            </el-popover>

          </template>
        </el-table-column>
        <el-table-column prop="firstAuthor" label="第一作者" width="150"></el-table-column>
        <el-table-column prop="memberPaymentStatus" label="繳費狀態" width="150">
          <template #default="scope">
            <span v-if="scope.row.memberPaymentStatus == '未付款'" style="color: red;">未付款</span>
            <span v-else style="color: black;">{{ scope.row.memberPaymentStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="審核狀態" width="100">
          <template #default="scope">
            <span :style="{ color: statusEnums.find(item => item.value === scope.row.status)?.color || 'black' }">
              {{statusEnums.find(item => item.value === scope.row.status)?.label || '未知狀態'}}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="" width="250">
          <template #default="scope">
            <el-button link type="success" @click="toggleEdit(scope.row)">
              Edit
            </el-button>
            <el-button link type="primary" @click="openAssignReviewerDialog(scope.row)">
              分配審稿委員
            </el-button>
            <el-button v-for="item in scope.row.paperFileUpload" type="primary" link @click="openFile(item.path)">下載{{
              item.type.split('_')[1] }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-box">
        <el-pagination layout="prev, pager, next" :page-count="Number(paperList.pages)"
          :default-page-size="Number(paperList.size)" v-model:current-page="currentPage" :hide-on-single-page="true" />
      </div>
    </el-card>
    <el-drawer v-model="isEdit" title="詳細資訊">
      <p>投稿類別 : {{ reviewPaper.absType }}</p>
      <el-divider></el-divider>
      <p>稿件主題 : {{ reviewPaper.absTitle }}</p>
      <el-divider></el-divider>
      <p>第一作者 : {{ reviewPaper.firstAuthor }}</p>
      <el-divider></el-divider>
      <p v-if="reviewPaper.absType === 'Young Investigator'">第一作者生日 : {{ reviewPaper.firstAuthorBirthday }}</p>
      <el-divider v-if="reviewPaper.absType === 'Young Investigator'"></el-divider>
      <p>主要講者 : {{ reviewPaper.speaker }}</p>
      <el-divider></el-divider>
      <p>講者單位 : {{ reviewPaper.speakerAffiliation }}</p>
      <el-divider></el-divider>
      <p>通訊作者 : {{ reviewPaper.correspondingAuthor }}</p>
      <el-divider></el-divider>
      <p>通訊作者Email : {{ reviewPaper.correspondingAuthorEmail }}</p>
      <el-divider></el-divider>
      <p>通訊作者電話 : {{ reviewPaper.correspondingAuthorPhone }}</p>
      <el-divider></el-divider>
      <p>所有作者 : {{ reviewPaper.allAuthor }}</p>
      <el-divider></el-divider>
      <p>所有作者單位 : {{ reviewPaper.allAuthorAffiliation }}</p>
      <el-divider></el-divider>

      <el-form :model-="updateForm">
        <el-form-item label="發表編號" prop="publicationNumber">
          <el-input v-model="updateForm.publicationNumber"></el-input>
        </el-form-item>
        <el-form-item label="發表組別" prop="publicationGroup">
          <el-input v-model="updateForm.publicationGroup"></el-input>
        </el-form-item>
        <el-form-item label="報告地點" prop="reportLocation">
          <el-input v-model="updateForm.reportLocation"></el-input>
        </el-form-item>
        <el-form-item label="報告時間" prop="reportTime">
          <el-input v-model="updateForm.reportTime"></el-input>
        </el-form-item>
        <el-form-item label="審稿通過" prop="status">
          <el-select v-model="updateForm.status" placeholder="請選擇">
            <el-option v-for="status in updateForm.statusList" :key="status.value" :label="status.label"
              :value="status.value" :disabled="status.isDisabled">

            </el-option>
          </el-select>

        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="updatePaper">更新</el-button>
          <el-button @click="isEdit = false">關閉</el-button>
        </el-form-item>
      </el-form>


    </el-drawer>


    <el-dialog v-model="isAssignReviewerVisible" title="分配審稿委員" width="50%">
      <div class="stage-btn-bar">
        <el-button class="first-stage" :class="{ 'is-active': reviewStage === 'first_review' }"
          @click="reviewStage = 'first_review'">一階</el-button>
        <el-button class="second-stage" :class="{ 'is-active': reviewStage === 'second_review' }"
          @click="reviewStage = 'second_review'">二階</el-button>
      </div>
      <el-transfer v-model="submitAssignData.targetPaperReviewerIdList" :data="assignPaperReviewData" filterable
        :titles="['可選審稿人', '已選審稿人']" />
      <el-button class="submit-btn" @click="submitAssignDataFn">
        確定
      </el-button>
    </el-dialog>

    <el-dialog v-model="isAutoAssignReviewerVisible" title="自動分配審稿委員" width="15%">
      <el-radio-group v-model="reviewStage">
        <el-radio value="first_review">一階審稿</el-radio>
        <el-radio value="second_review">二階審稿</el-radio>
      </el-radio-group>
      <el-button @click="autoAssignPaperReviewers">
        確定
      </el-button>
    </el-dialog>

    <el-dialog v-model="importExcelDialogState.isOpen" title="匯入 Excel 檔案">
      <div class="template-tips-content">
        <ul class="step-list" style="list-style-type: decimal;">
          <li>匯入稿件excel進行更新</li>
          <li>注意事項:
            <ul class="sub-list">
              <li>只允許「發表方式」、「發表群組」、「發表編號」、「演講時間」、「演講地點」、「審核狀態」等欄位更新，其餘欄位無效</li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="upload-excel-content">
        <el-upload ref="uploadRef" drag class="upload-demo" :limit="1" :on-change="handleUpload" :auto-upload="false"
          :on-remove="handleRemove">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
        </el-upload>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" plain @click="importExcelDialogState.closeDialog()">取消</el-button>
        <el-button type="success" plain @click="handleImportExcel">確定</el-button>
      </span>
    </el-dialog>

    <el-dialog v-model="importExcelResultDialogState.isOpen" title="匯入結果" width="30%">
      <div v-if="importExcelResultDialogState.resultData">
        <p>總共 {{ importExcelResultDialogState.resultData.totalCount }} 條數據</p>
        <p>成功 {{ importExcelResultDialogState.resultData.successCount }} 條</p>
        <p>失敗 {{ importExcelResultDialogState.resultData.failCount }} 條</p>
        <div v-if="importExcelResultDialogState.resultData.failCount > 0">
          <h3>失敗詳情：</h3>
          <ul>
            <li v-for="(fail, index) in importExcelResultDialogState.resultData.failList" :key="index">
              行 {{ fail.rows }}: {{ fail.message }}
            </li>
          </ul>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="importExcelResultDialogState.closeDialog()">確定</el-button>
      </span>

    </el-dialog>



  </section>


</template>
<script lang="ts" setup>
import { assignPaperReviewersApi, autoAssignPaperReviewersApi, downloadPaperScoreExcelApi, getPaperPageApi, importPaperScoreExcelApi, getDownloadAbstractsUrlApi, updatePaperApi } from '@/api/abstract';
import { tryCatch } from '@/utils/tryCatch';
import { UploadProps, UploadUserFile } from 'element-plus';



const currentPage = ref(1)

const input = ref('')
const filterStatus = ref()
const filterAbsType = ref('')
const filterAbsProp = ref('')

const paperList = reactive<any>([])
const getPaperList = async () => {
  const { res, error } = await tryCatch(getPaperPageApi(currentPage.value, 10, input.value, filterStatus.value, filterAbsType.value, filterAbsProp.value));
  if (error) {
    return;
  }
  console.log(res.data)

  res.data.records.forEach((item: any) => {
    item.paperFileUpload = item.paperFileUpload.filter((file: any) =>
      file.type !== 'supplementary_material'
    )
  })

  Object.assign(paperList, res.data)
}

watch(filterStatus, (value, oldValue) => {
  getPaperList()
})

watch(currentPage, (value, oldValue) => {
  getPaperList()
})

/**------------------------------------------------ */
const isAssignReviewerVisible = ref(false);

const assignPaper = reactive<any>({});

const reviewStage = ref('first_review');

const submitAssignData = reactive<any>({
  reviewStage: '',
  targetPaperReviewerIdList: [],
  paperId: '',
})

const assignPaperReviewData = reactive<any>([])
const assignPaperReviewTempList = ref<any>([]);


const openAssignReviewerDialog = (paper: any) => {
  submitAssignData.paperId = '';
  submitAssignData.targetPaperReviewerIdList = [];
  assignPaperReviewData.length = 0;
  Object.assign(assignPaper, paper);
  submitAssignData.paperId = paper.paperId;

  assignPaper.assignedPaperReviewers.forEach((paperReviewer: any) => {
    if (paperReviewer.reviewStage !== reviewStage.value) {
      return;
    }
    submitAssignData.targetPaperReviewerIdList.push(paperReviewer.paperReviewerId)
  })

  assignPaper.availablePaperReviewers.forEach((paperReviewer: any) => {
    assignPaperReviewData.push({
      label: paperReviewer.name,
      key: paperReviewer.paperReviewerId,
    })
  })



  isAssignReviewerVisible.value = true;
}

watch(() => reviewStage.value, (value, oldValue) => {
  if (!isAssignReviewerVisible.value) {
    return;
  }
  submitAssignData.targetPaperReviewerIdList.length = 0
  assignPaper.assignedPaperReviewers.forEach((paperReviewer: any) => {
    if (paperReviewer.reviewStage !== reviewStage.value) {
      return;
    }
    submitAssignData.targetPaperReviewerIdList.push(paperReviewer.paperReviewerId)
  });

  // submitAssignData.targetPaperReviewerIdList.filter((item: any) => {
  //   return item.reviewStage === submitAssignData.reviewStage;
  // })



}, { deep: true });

const submitAssignDataFn = async () => {
  submitAssignData.reviewStage = reviewStage.value;
  // if (submitAssignData.targetPaperReviewerIdList.length === 0) {
  //   isAssignReviewerVisible.value = false;
  //   return;
  // }
  const { res, error } = await tryCatch(assignPaperReviewersApi(submitAssignData));

  if (error) {
    return;
  }
  isAssignReviewerVisible.value = false;
  getPaperList();
}


const isAutoAssignReviewerVisible = ref(false);

const openAutoAssignReviewerDialog = () => {
  isAutoAssignReviewerVisible.value = true;
}

const autoAssignPaperReviewers = async () => {
  let submitData = {
    reviewStage: reviewStage.value,
  }
  const { res, error } = await tryCatch(autoAssignPaperReviewersApi(submitData));
  if (error) {
    return;
  }
  ElMessage.success('自動分配審稿委員成功');
  isAutoAssignReviewerVisible.value = false;
}



/**-------------------------------------------- */
const isEdit = ref(false);

const reviewPaper = reactive<any>({})
const toggleEdit = (paper: any) => {
  isEdit.value = !isEdit.value;
  Object.assign(reviewPaper, paper);
  // Object.assign(updateForm, paper);
  updateForm.paperId = paper.paperId;
  updateForm.status = paper.status;
  updateForm.publicationNumber = paper.publicationNumber;
  updateForm.publicationGroup = paper.publicationGroup;
  updateForm.reportLocation = paper.reportLocation;
  updateForm.reportTime = paper.reportTime;
  updateForm.statusList = statusListMap.value.get(paper.status) || [];
}

const openFile = async (filePath: string) => {
  const fileUrl = import.meta.env.VITE_MINIO_API_URL + filePath;
  const link = document.createElement('a');
  link.href = fileUrl;
  document.body.appendChild(link);
  link.setAttribute('download', '');
  window.open(fileUrl, '_blank');
  document.body.removeChild(link);
}
/**-------------------------------------------- */
const updateForm = reactive<any>({
  paperId: '',
  publicationNumber: '',
  publicationGroup: '',
  reportLocation: '',
  reportTime: '',
  status: ''
});

const updatePaper = async () => {
  await updatePaperApi(updateForm)
  ElMessage.success('更新成功');
  isEdit.value = false;
  getPaperList()
}


const findFirstVaildTag = (tagSet: any) => {
  for (let i = 0; i < tagSet.length; i++) {
    if (tagSet[i].status === 0) {
      return tagSet[i];
    }
  }
  return '';
}
/**--------------------------------------------------- */
const downloadExcel = async (reviewStage: string) => {
  let fileName = reviewStage === 'first_review' ? '一階評分.xlsx' : '二階評分.xlsx';
  let res = await downloadPaperScoreExcelApi(reviewStage)
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
}

const downloadAbstracts = async () => {
  const { res, error }: any = await tryCatch(getDownloadAbstractsUrlApi());
  if (error || res.code !== 200) {
    console.error('Error fetching download URL:', error || res.message);
    return;
  }
  window.open(import.meta.env.VITE_APP_BASE_API + res.data, '_blank');
}

const importExcelDialogState = ref({
  isOpen: false,
  openDialog: () => {
    importExcelDialogState.value.isOpen = true;
  },
  closeDialog: () => {
    importExcelDialogState.value.isOpen = false;
  }
})

interface ImportResult {
  failCount: number;
  failList: Array<{ rows: number, message: string }>;
  successCount: number;
  totalCount: number;
}

const importExcelResultDialogState = ref({
  isOpen: false,
  resultData: null as ImportResult | null,
  openDialog: (data: any) => {
    console.log('Import result data:', data);
    importExcelResultDialogState.value.resultData = data;
    importExcelResultDialogState.value.isOpen = true;
  },
  closeDialog: () => {
    importExcelResultDialogState.value.isOpen = false;
    importExcelResultDialogState.value.resultData = null;
    getPaperList();
    importExcelDialogState.value.closeDialog();

  }
})

const uploadRef = ref();
const uploadFileList = ref<any>([]);
const handleUpload: UploadProps['onChange'] = (file: UploadUserFile, uploadFiles) => {
  if (file.size == 0) {
    ElMessage.error('File is empty');
    return false;
  }

  if (file.status === 'ready' && file.size) {
    if (file.name.split('.').pop() !== 'xlsx' && file.name.split('.').pop() !== 'xls') {
      ElMessage.error('File must be xlsx');
      uploadFiles.pop();
      return;
    }
    uploadFileList.value.push(file);
  }
}

const handleRemove: UploadProps['onRemove'] = (file, fileList) => {
  uploadFileList.value = fileList;
}



const handleImportExcel = async () => {
  try {
    const data = new FormData();
    uploadFileList.value.forEach((file: any) => {
      data.append('file', file.raw);
    });
    let res = await importPaperScoreExcelApi(data);
    ElMessage.success("上傳成功");
    importExcelResultDialogState.value.openDialog(res.data);
    // getPaperList();
    // importExcelDialogState.value.closeDialog();
    // 清空組件內的文件列表
    uploadRef.value?.clearFiles();
    // 清空實際儲存的文件列表
    uploadFileList.value = [];
    console.log(res);
  } catch (error) {
    console.log(error);
    ElMessage.error("上傳失敗" + error)
  }
}

const statusEnums =
  [
    { label: '未審核', value: 0, color: 'gray' },
    { label: '入選', value: 1, color: 'green' },
    { label: '未入選', value: 2, color: 'red' },
    { label: '獲獎', value: 3, color: 'gold' },
    { label: '未獲獎(二階段)', value: 4, color: 'orange' },
  ]

const statusListMap = computed(() => {
  return new Map([
    [0, [{ label: '未審核', value: 0, isDisabled: true }, { label: '入選', value: 1, isDisabled: false }, { label: '未入選', value: 2, isDisabled: false }]],
    [1, [{ label: '入選', value: 1, isDisabled: true }, { label: '未審核', value: 0, isDisabled: false }, { label: '獲獎', value: 3, isDisabled: false }, { label: '未獲獎', value: 3, isDisabled: false }]],
    [2, [{ label: '未入選', value: 2, isDisabled: true }, { label: '未審核', value: 0, isDisabled: false }]],
    [3, [{ label: '獲獎', value: 3, isDisabled: true }, { label: '入選', value: 1, isDisabled: false }]],
    [4, [{ label: '未獲獎', value: 4, isDisabled: true }, { label: '入選', value: 1, isDisabled: false }]],

  ]);
})

const allActions = ref([
  { label: "自動分配審稿委員", action: () => openAutoAssignReviewerDialog(), type: 'warning' as any, isPrimary: true },
  { label: "下載摘要", action: () => downloadAbstracts(), type: 'primary' as any, isPrimary: true },
  { label: "下載一階評分表", action: () => downloadExcel('first_review'), type: 'success' as any, isPrimary: false },
  { label: "下載二階評分表", action: () => downloadExcel('second_review'), type: 'success' as any, isPrimary: false },
  { label: "Excel批量更新", action: () => importExcelDialogState.value.openDialog(), type: 'success' as any, isPrimary: false },
])

const primaryActions = computed(() => {
  return allActions.value.filter(action => action.isPrimary);
})

const overflowActions = computed(() => {
  return allActions.value.filter(action => !action.isPrimary);
})

onMounted(() => {
  getPaperList()
})

</script>

<style lang="scss" scoped>
.abstract-section {
  width: 95%;
  margin: 0 auto;

  .abstract-card {
    margin-top: 2%;
    margin-bottom: 2%;

    .pagination-box {
      margin-top: 2%;
      display: flex;
      justify-content: center;
    }
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin: 1% 0;
  }


}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .query-box {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-input,
    .el-select {
      width: 240px;
    }
  }

  .operate-btn-box {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-button {
      margin: 0;
    }
  }

}

:deep(.el-tag__content) {
  color: white;
  font-size: 14px;
}

:deep(.el-tag__close) {
  color: red;
}

.stage-btn-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;

  .el-button {
    margin: 0;

    &.is-active {
      background-color: #409eff;
      color: white;
    }

    &.first-stage {
      border-radius: 4px 0 0 4px;
    }

    &.second-stage {
      border-radius: 0 4px 4px 0;
    }
  }
}

.el-transfer {
  margin-top: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  // flex-direction: column;
}

.submit-btn {
  display: block;
  margin: 0 0 0 auto;

}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>