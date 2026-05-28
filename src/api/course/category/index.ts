import request from '@/utils/request'
import { AddCourseCategory, UpdateCourseCategory } from './type'
const BASE_URL = '/course-category'

export function findCourseCategoryByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function findCourseListByQueryTextAndPaginationApi(page: number, size: number, queryText: string): Promise<any> {
  return request({
    url: `${BASE_URL}/pagination`,
    method: 'get',
    params: {
      page,
      size,
      queryText
    }
  })
}

export function createCourseCategoryApi(data: AddCourseCategory) {
  return request({
    url: `${BASE_URL}`,
    method: 'post',
    data
  })
}

export function updateCourseCategoryApi(id: string, data: UpdateCourseCategory) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'put',
    data
  })
}

export function deleteCourseCategoryApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}