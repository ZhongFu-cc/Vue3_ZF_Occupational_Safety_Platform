<template>
  <div class="learning-statistics-page">
    <!-- 查詢條件 -->
    <!-- <el-card shadow="never">
      <div class="filter-grid">
        <CourseSelect v-model="searchForm.courseId" clearable />

        <DepartmentSelect v-model="searchForm.departmentId" clearable />

        <el-input v-model="searchForm.queryText" placeholder="姓名搜尋" clearable />

        <el-button type="primary" @click="handleSearch">
          查詢
        </el-button>
      </div>
    </el-card> -->

    <!-- KPI -->
    <div class="kpi-grid mt16">
      <el-card class="kpi-card kpi-success">
        <div class="stat-title">
          總完課率
        </div>
        <div class="kpi-green">
          {{ completionRateAnimated.toFixed(0) }}
          <span class="unit">%</span>
        </div>
      </el-card>

      <el-card class="kpi-card kpi-danger">
        <div class="stat-title">
          已逾期
        </div>

        <div class="kpi-red">
          {{ expiredCountAnimated.toFixed(0) }}
          <span class="unit">人</span>
        </div>

      </el-card>

      <el-card class="kpi-card kpi-primary">
        <div class="stat-title">
          總時數
        </div>

        <div class="kpi-blue">
          {{ totalTrainingHoursAnimated.toFixed(1) }}
          <span class="unit">hr</span>
        </div>
      </el-card>

      <el-card class="kpi-card kpi-warning">
        <div class="stat-title">
          待催促
        </div>
        <div class="kpi-orange">
          {{ urgentCountAnimated.toFixed(0) }}
          <span class="unit">人</span>
        </div>
      </el-card>
    </div>

    <!-- 圖表 -->
    <div class="chart-grid mt16">
      <el-card shadow="never">
        <template #header>
          部門完課排行
        </template>

        <div ref="departmentChartRef" class="chart-container" />
      </el-card>

      <el-card shadow="never">
        <template #header>
          學習狀態比例
        </template>

        <div ref="statusChartRef" class="chart-container" />
      </el-card>
    </div>

    <!-- 表格 -->
    <el-card shadow="never" class="mt16">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="userName" label="姓名" min-width="120" />

        <el-table-column prop="departmentName" label="部門" min-width="160" />

        <el-table-column prop="totalCourses" label="總課程數" width="120" />

        <el-table-column prop="completedCourses" label="已完成" width="120" />

        <el-table-column label="完成率" width="120">
          <template #default="{ row }">
            {{ getCompletionRate(row) }}%
          </template>
        </el-table-column>

        <el-table-column label="學習狀態" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.overallStatus)">
              {{ getStatusText(row.overallStatus) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="page" v-model:page-size="size" :total="total"
          layout="total, prev, pager, next" @current-change="loadTable" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { reactive, ref, nextTick, onMounted } from 'vue'

import {
  getLearningProgressKpiApi,
  getLearningProgressChartApi,
  getLearningProgressTableApi
} from '@/api/courseTrainingRecord'

import type {
  LearningProgressKpiVO,
  LearningProgressChartVO,
  LearningProgressTableVO
} from '@/api/courseTrainingRecord/type'

const departmentChartRef = ref()
const statusChartRef = ref()

const tableData = ref<LearningProgressTableVO[]>([])

const page = ref(1)
const size = ref(10)
const total = ref(0)

const searchForm = reactive({
  departmentId: undefined,
  courseId: undefined,
  queryText: ''
})

import { useTransition } from '@vueuse/core'

const kpi = ref({
  completionRate: 0,
  expiredCount: 0,
  totalTrainingHours: 0,
  urgentCount: 0
})

const completionRate = ref(0)
const expiredCount = ref(0)
const totalTrainingHours = ref(0)
const urgentCount = ref(0)

const completionRateAnimated = useTransition(completionRate, {
  duration: 400
})

const expiredCountAnimated = useTransition(expiredCount, {
  duration: 400
})

const totalTrainingHoursAnimated = useTransition(
  totalTrainingHours,
  {
    duration: 400
  }
)

const urgentCountAnimated = useTransition(urgentCount, {
  duration: 400
})

let departmentChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

async function loadKpi() {
  const res = await getLearningProgressKpiApi(
    searchForm.departmentId,
    searchForm.courseId
  )

  kpi.value = res.data

  console.log(res.data)

  completionRate.value = res.data.completionRate
  expiredCount.value = res.data.expiredCount
  totalTrainingHours.value =
    res.data.totalTrainingHours
  urgentCount.value = res.data.urgentCount

  console.log(
    completionRate.value,
    expiredCount.value,
    totalTrainingHours.value,
    urgentCount.value
  )
}

async function loadChart() {
  const res = await getLearningProgressChartApi(
    searchForm.departmentId,
    searchForm.courseId
  )

  const chartData: LearningProgressChartVO =
    res.data

  renderDepartmentChart(
    chartData.departmentRankings
  )

  renderStatusChart(
    chartData.learningStatusDistribution
  )
}

async function loadTable() {
  const res =
    await getLearningProgressTableApi(
      page.value,
      size.value,
      searchForm.departmentId,
      searchForm.courseId,
      searchForm.queryText
    )

  tableData.value = res.data.records
  total.value = Number(res.data.total)
}

function renderDepartmentChart(data: any[]) {
  if (!departmentChart) {
    departmentChart = echarts.init(
      departmentChartRef.value
    )
  }

  departmentChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: 60,
      right: 30,
      top: 20,
      bottom: 20
    },
    xAxis: {
      type: 'value',
      max: 100
    },
    yAxis: {
      type: 'category',
      data: data.map(
        item => item.departmentName
      )
    },
    series: [
      {
        type: 'bar',
        data: data.map(
          item => item.completeionRate
        ),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  })
}

function renderStatusChart(data: any[]) {
  if (!statusChart) {
    statusChart = echarts.init(
      statusChartRef.value
    )
  }

  statusChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        data: data.map(item => ({
          name: item.statusName,
          value: item.count
        }))
      }
    ]
  })
}

function getCompletionRate(
  row: any
) {
  if (!row.totalCourses) return 0

  return Math.round(
    (row.completedCourses /
      row.totalCourses) *
    100
  )
}

function getStatusText(status: string) {
  switch (status) {
    case 'COMPLETED':
      return '已完成'

    case 'IN_PROGRESS':
      return '學習中'

    case 'NOT_STARTED':
      return '未開始'

    default:
      return status
  }
}

function getStatusType(status: string): 'success' | 'warning' | 'info' | undefined {
  switch (status) {
    case 'COMPLETED':
      return 'success'

    case 'IN_PROGRESS':
      return 'warning'

    case 'NOT_STARTED':
      return 'info'

    default:
      return undefined
  }
}

async function handleSearch() {
  page.value = 1

  await Promise.all([
    loadKpi(),
    loadChart(),
    loadTable()
  ])
}

onMounted(async () => {
  await nextTick()

  await Promise.all([
    loadKpi(),
    loadChart(),
    loadTable()
  ])
})
</script>

<style scoped>
.learning-statistics-page {
  padding: 24px;
}

.mt16 {
  margin-top: 16px;
}

/* 查詢區 */
.filter-grid {
  display: grid;
  grid-template-columns:
    minmax(220px, 1fr) minmax(220px, 1fr) minmax(280px, 1fr) 120px;
  gap: 16px;
  align-items: center;
}

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  text-align: center;
}

.kpi-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
}

/* 圖表區 */
.chart-grid {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 16px;
}

.kpi-green {
  font-size: 38px;
  font-weight: 700;
  color: #67c23a;
}

.kpi-red {
  font-size: 38px;
  font-weight: 700;
  color: #f56c6c;
}

.kpi-blue {
  font-size: 38px;
  font-weight: 700;
  color: #409eff;
}

.kpi-orange {
  font-size: 38px;
  font-weight: 700;
  color: #e6a23c;
}

.chart-container {
  height: 360px;
}

.success {
  color: #67c23a;
}

.warning {
  color: #e6a23c;
}

.danger {
  color: #f56c6c;
}

.primary {
  color: #409eff;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Tablet */
@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .chart-grid {
    grid-template-columns:
      1fr;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>