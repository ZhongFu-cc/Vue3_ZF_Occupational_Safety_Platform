import request from '@/utils/request'
const BASE_URL = '/course'

export function findCourseByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function findCourseListByCategoryIdAndPaginationApi(page: number, size: number, courseCategoryId: string, queryText?: string) {
  console.log('findCourseListByCategoryIdAndPaginationApi called with:', { page, size, courseCategoryId, queryText });
  return request({
    url: `${BASE_URL}/pagination`,
    method: 'get',
    params: {
      page,
      size,
      courseCategoryId,
      queryText
    }
  })
}

export function createCourseApi(data: FormData) {
  return request({
    url: `${BASE_URL}`,
    method: 'post',
    data
  })
}

export function updateCourseApi(data: FormData) {
  return request({
    url: `${BASE_URL}`,
    method: 'put',
    data
  })
}

export function deleteCourseApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}