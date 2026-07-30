<template>
  <div class="learning-record-page">
    <!-- 頂部統計卡片 -->
    <div class="stats-header" style="margin-bottom: 20px">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ summaryData.totalEnrolled }}</div>
          <div class="stat-label">已報名課程</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #67c23a">{{ summaryData.completedCount }}</div>
          <div class="stat-label">已完成課程</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #e6a23c">{{ summaryData.inProgressCount }}</div>
          <div class="stat-label">進行中課程</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ summaryData.averageProgress }}%</div>
          <div class="stat-label">平均進度</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #f56c6c">{{ summaryData.expiredCount }}</div>
          <div class="stat-label">逾期課程</div>
        </div>
      </div>
    </div>

    <!-- 提示警告框 -->
    <el-alert v-if="summaryData.expiredCount > 0" :title="`您有 ${summaryData.expiredCount} 門課程已逾期，請盡快完成`" type="warning"
      :closable="false" style="margin-bottom: 20px" />

    <!-- 圖表和表格區域 -->
    <div class="content-area">
      <!-- 左側餅圖 -->
      <div class="chart-section">
        <el-card shadow="never">
          <template #header>
            <div style="font-weight: bold; font-size: 14px">學習進度分佈</div>
          </template>
          <div ref="chartRef" style="width: 100%; height: 280px"></div>
        </el-card>
      </div>

      <!-- 右側表格 -->
      <div class="table-section">
        <el-card shadow="never">
          <template #header>
            <div style="font-weight: bold; font-size: 14px">課程進度詳情</div>
          </template>

          <div class="search-box" style="margin-bottom: 16px">
            <el-input v-model="queryText" placeholder="搜尋課程名稱" clearable style="width: 200px"
              @keyup.enter="handleSearch" />
            <el-select v-model="status" placeholder="學習狀態" clearable style="width: 140px" @change="handleSearch">
              <el-option v-for="item in COURSE_STATUS_OPTIONS" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
            <el-button type="primary" @click="handleSearch">查詢</el-button>
          </div>

          <el-table v-loading="isLoading" :data="recordList" stripe empty-text="目前沒有學習歷程資料"
            @cell-click="navigateToLearning($event)" style="cursor: pointer">
            <el-table-column prop="courseName" label="課程名稱" min-width="200" show-overflow-tooltip />
            <el-table-column label="狀態" width="100">
              <template #default="{ row }">
                <el-tag :type="getCourseStatusTagType(row.status)">
                  {{ getCourseStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="進度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="parseInt(row.progress) || 0" />
              </template>
            </el-table-column>
            <el-table-column label="時數(分)" width="100">
              <template #default="{ row }">
                {{ convertSecondsToMinutes(row.accumulatedSeconds) }}
              </template>
            </el-table-column>
            <el-table-column label="開始日期" min-width="130">
              <template #default="{ row }">
                {{ formatDate(row.startedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="到期日期" min-width="130">
              <template #default="{ row }">
                {{ formatDate(row.expiredAt) }}
              </template>
            </el-table-column>
          </el-table>

          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
            :total="Number(totalRecords)" layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 16px; text-align: right" @change="findLearningRecordList" />
        </el-card>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";
import { getLearnRecordListApi, getLearnRecordSummatyByOwnerApi } from "@/api/courseEnrollment";
import { LearningRecordVO } from "@/api/courseEnrollment/type";
import { CommonStatusEnum } from "@/constants/enums/CommonStatusEnum";
import { COURSE_STATUS_OPTIONS, CourseStatusEnum } from "@/constants/enums/CourseStatusEnum";
import { showError, tryCatch } from "@/utils/tryCatch";

const recordList = ref<LearningRecordVO[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const queryText = ref<string>("");
const totalRecords = ref(0);
const status = ref<CourseStatusEnum>();
const isLoading = ref(false);
const router = useRouter();
const chartRef = ref<HTMLDivElement>();

// 新增：統計數據
const summaryData = ref<any>({
  totalEnrolled: 0,
  completedCount: 0,
  inProgressCount: 0,
  averageProgress: 0,
  expiredCount: 0,
});

let chart: echarts.ECharts | null = null;

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

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 新增：加載統計數據
const loadSummaryData = async () => {
  const { res, error }: any = await tryCatch(getLearnRecordSummatyByOwnerApi());

  if (error || !res || res.code !== 200) {
    console.error("加載統計數據失敗");
    return;
  }

  summaryData.value = {
    totalEnrolled: res.data.totalEnrolled || 0,
    completedCount: res.data.completedCount || 0,
    inProgressCount: res.data.inProgressCount || 0,
    averageProgress: Math.round(res.data.averageProgress || 0),
    expiredCount: res.data.expiredCount || 0,
  };

  // 初始化圖表
  initChart();
};

// 新增：初始化圖表
const initChart = () => {
  if (!chartRef.value) return;

  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  const chartData = [
    {
      name: `已完成 (${summaryData.value.completedCount})`,
      value: summaryData.value.completedCount,
      itemStyle: { color: "#67c23a" },
    },
    {
      name: `進行中 (${summaryData.value.inProgressCount})`,
      value: summaryData.value.inProgressCount,
      itemStyle: { color: "#e6a23c" },
    },
    {
      name: `未開始 (${summaryData.value.totalEnrolled - summaryData.value.completedCount - summaryData.value.inProgressCount})`,
      value: summaryData.value.totalEnrolled - summaryData.value.completedCount - summaryData.value.inProgressCount,
      itemStyle: { color: "#909399" },
    },
  ];

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  chart.setOption(option);
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

const navigateToLearning = (row: any) => {
  router.push({
    name: "courseLearnPage",
    query: {
      courseId: row.courseId,
      courseEnrollmentId: row.courseEnrollmentId,
    },
  })
}

// 監聽窗口大小變化
const handleResize = () => {
  chart?.resize();
};

onMounted(() => {
  loadSummaryData();
  findLearningRecordList();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
});
</script>
<style lang="scss" scoped>
.learning-record-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .stats-header {
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 20px;

      .stat-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 1px solid #e4e7eb;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

        &:hover {
          border-color: #409eff;
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 12px;
          color: #606266;
        }
      }
    }
  }

  .content-area {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .chart-section {
      :deep(.el-card) {
        background: #ffffff;
        border: 1px solid #e4e7eb;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

        .el-card__header {
          border-bottom: 1px solid #e4e7eb;
          padding: 16px;
          background: #fafafa;
        }

        .el-card__body {
          padding: 16px;
        }
      }
    }

    .table-section {
      :deep(.el-card) {
        background: #ffffff;
        border: 1px solid #e4e7eb;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

        .el-card__header {
          border-bottom: 1px solid #e4e7eb;
          padding: 16px;
          background: #fafafa;
        }

        .el-card__body {
          padding: 16px;
        }
      }

      .search-box {
        display: flex;
        align-items: center;
        gap: 12px;

        :deep(.el-input) {

          &.is-focus .el-input__wrapper,
          .el-input__wrapper {
            background-color: #ffffff;
            border-color: #b4c3d5;
          }

          .el-input__inner {
            color: #606266;

            &::placeholder {
              color: #a8abb2;
            }
          }
        }

        :deep(.el-select) {
          .el-select__wrapper {
            background-color: #ffffff;
            border-color: #b4c3d5;
          }

          .el-input__inner {
            color: #606266;
          }
        }
      }

      :deep(.el-table) {
        background: #ffffff;
        color: #606266;

        th {
          background-color: #f5f7fa;
          border-color: #e4e7eb;
          color: #303133;
          font-weight: 600;
        }

        td {
          border-color: #e4e7eb;
          padding: 12px 0;
          color: #606266;
        }

        tbody tr {
          &:hover>td {
            background-color: #f5f7fa;
          }
        }

        .el-tag {
          border: none;
        }
      }

      :deep(.el-progress) {
        .el-progress__bar {
          background-color: #409eff;
        }

        .el-progress__text {
          color: #606266;
        }
      }
    }
  }

  // 響應式設計
  @media screen and (max-width: 1200px) {
    .content-area {
      flex-direction: column;
    }
  }

  @media screen and (max-width: 640px) {
    padding: 12px;

    .stats-header {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        .stat-card {
          padding: 12px;

          .stat-value {
            font-size: 20px;
          }
        }
      }
    }
  }
}

// 淺色主題調整
:deep(.el-alert) {
  background-color: #fdf6ec;
  border-color: #f5dab1;
  color: #e6a23c;

  .el-alert__title {
    color: #e6a23c;
  }

  .el-alert__description {
    color: #b88230;
  }
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;

  &:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }
}

:deep(.el-pagination) {

  button,
  .el-pager li {
    background-color: #ffffff;
    color: #606266;
    border-color: #d0d0d0;

    &:hover:not(.disabled) {
      color: #409eff;
      border-color: #409eff;
    }

    &.active {
      color: #409eff;
      background-color: #f0f9ff;
      border-color: #409eff;
    }
  }
}
</style>