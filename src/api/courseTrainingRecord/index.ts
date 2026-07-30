import request from '@/utils/request'

const BASE_URL = '/course-progress-statistics'

/**
 * 查詢課程 KPI 統計
 */
export function getLearningProgressKpiApi(
  departmentId?: number,
  courseId?: number
) {
  return request({
    url: `${BASE_URL}/progress-kpi`,
    method: 'get',
    params: {
      departmentId,
      courseId
    }
  })
}

/**
 * 查詢課程進度圖表資料
 */
export function getLearningProgressChartApi(
  departmentId?: number,
  courseId?: number
) {
  return request({
    url: `${BASE_URL}/progress-chart`,
    method: 'get',
    params: {
      departmentId,
      courseId
    }
  })
}

/**
 * 查詢課程進度明細表
 */
export function getLearningProgressTableApi(
  page: number,
  size: number,
  departmentId?: number,
  courseId?: number,
  queryText?: string
) {
  return request({
    url: `${BASE_URL}/progress-table`,
    method: 'get',
    params: {
      page,
      size,
      departmentId,
      courseId,
      queryText
    }
  })
}