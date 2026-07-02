<template>
  <div class="learning-record-page">
    <BasicComponent title="學習歷程" :total-count="`${totalRecords} 筆`">
      <template #search-box>
        <div class="search-box">
          <el-input v-model="queryText" placeholder="搜尋課程名稱" clearable @keyup.enter="handleSearch" />
          <el-select v-model="status" placeholder="學習狀態" clearable @change="handleSearch">
            <el-option v-for="item in COURSE_STATUS_OPTIONS" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查詢</el-button>
        </div>
      </template>

      <template #data-table>
        <el-table v-loading="isLoading" :data="recordList" stripe empty-text="目前沒有學習歷程資料"
          @cell-click="navigateToLearning($event)">
          <el-table-column prop="courseName" label="課程名稱" min-width="220" show-overflow-tooltip />
          <el-table-column label="狀態" width="120">
            <template #default="{ row }">
              <el-tag :type="getCourseStatusTagType(row.status)" @click="console.log(row)">
                {{ getCourseStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="進度" width="110" />
          <el-table-column label="章節完成" width="110">
            <template #default="{ row }">
              <el-tag :type="row.isChaptersDone === CommonStatusEnum.YES ? 'success' : 'info'">
                {{ row.isChaptersDone === CommonStatusEnum.YES ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="時數達標" width="110">
            <template #default="{ row }">
              <el-tag :type="row.isMinutesMet === CommonStatusEnum.YES ? 'success' : 'warning'">
                {{ row.isMinutesMet === CommonStatusEnum.YES ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="累積時數(分鐘)" width="130">
            <template #default="{ row }">
              {{ convertSecondsToMinutes(row.accumulatedSeconds) }}
            </template>
          </el-table-column>
          <el-table-column label="開始時間" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.startedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="完成時間" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.completedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="到期時間" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.expiredAt) }}
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template #pagination-box>
        <el-pagination layout="prev, pager, next" :current-page="currentPage" :page-size="pageSize"
          :total="Number(totalRecords)" @current-change="handlePageChange" />
      </template>
    </BasicComponent>
  </div>
</template>
<script lang="ts" setup>
import { getLearnRecordListApi } from "@/api/courseEnrollment";
import { LearningRecordVO } from "@/api/courseEnrollment/type";
import { CommonStatusEnum } from "@/constants/enums/CommonStatusEnum";
import { COURSE_STATUS_OPTIONS, CourseStatusEnum } from "@/constants/enums/CourseStatusEnum";
import BasicComponent from "@/layout/components/Basic/index.vue";
import { showError, tryCatch } from "@/utils/tryCatch";

const recordList = ref<LearningRecordVO[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const queryText = ref<string>("");
const totalRecords = ref(0);
const status = ref<CourseStatusEnum>();
const isLoading = ref(false);
const router = useRouter();

const courseStatusLabelMap = new Map<CourseStatusEnum, string>(
  COURSE_STATUS_OPTIONS.map((item) => [item.value, item.label])
);

const getCourseStatusLabel = (courseStatus: CourseStatusEnum) => {
  return courseStatusLabelMap.get(courseStatus) || "未知";
};

const getCourseStatusTagType = (courseStatus: CourseStatusEnum) => {
  switch (courseStatus) {
    case CourseStatusEnum.NOT_STARTED:
      return "info";
    case CourseStatusEnum.IN_PROGRESS:
      return "warning";
    case CourseStatusEnum.COMPLETED:
      return "success";
    case CourseStatusEnum.EXPIRED:
      return "danger";
    default:
      return "info";
  }
};

const convertSecondsToMinutes = (seconds?: number) => {
  if (!seconds) {
    return 0;
  }
  return Math.floor(seconds / 60);
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const findLearningRecordList = async () => {
  isLoading.value = true;
  const { res, error }: any = await tryCatch(
    getLearnRecordListApi(currentPage.value, pageSize.value, queryText.value, status.value)
  );
  isLoading.value = false;

  if (error || !res || res.code !== 200) {
    showError(res?.message || "獲取學習歷程列表失敗");
    return;
  }

  recordList.value = res.data.records || [];
  totalRecords.value = res.data.total || 0;
};

const handleSearch = () => {
  currentPage.value = 1;
  findLearningRecordList();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  findLearningRecordList();
};

const navigateToLearning = (row: any) => {
  router.push({
    name: "courseLearnPage",
    query: {
      courseId: row.courseId,
      courseEnrollmentId: row.courseEnrollmentId,
    },
  })
}

onMounted(() => {
  findLearningRecordList();
});
</script>
<style lang="scss" scoped>
.learning-record-page {
  .search-box {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-input {
      width: 260px;
    }

    .el-select {
      width: 160px;
    }

    @media screen and (max-width: 760px) {
      flex-direction: column;
      align-items: flex-start;

      .el-input,
      .el-select,
      .el-button {
        width: 100%;
      }
    }
  }

  :deep(.el-pagination) {

    .el-pager li,
    button {
      background: none !important;
    }
  }
}
</style>