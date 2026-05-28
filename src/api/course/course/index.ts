import request from '@/utils/request'
const BASE_URL = '/course'

export function findCourseByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function findCourseListByCateforyIdAndPaginationApi(page: number, size: number, courseCategoryId: string, queryText?: string) {
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

export function updateCourseApi(id: string, data: FormData) {
  return request({
    url: `${BASE_URL}/${id}`,
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