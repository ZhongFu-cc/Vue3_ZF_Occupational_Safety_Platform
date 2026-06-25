import request from '@/utils/request'
import { AddCompanyCourse } from './type'

const BASE_URL = '/company-course'

export function findCompanyCourseByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get',
  })
}

export function findAllCompanyCourseListApi() {
  return request({
    url: `${BASE_URL}`,
    method: 'get',
  })
}

export function findCompanyCourseListByQueryTextAndPaginationApi(
  page: number,
  size: number,
  queryText: string,
  courseCategoryId?: string,
): Promise<any> {
  return request({
    url: `${BASE_URL}/pagination`,
    method: 'get',
    params: {
      page,
      size,
      queryText,
      courseCategoryId,
    },
  })
}

export function createCompanyCourseApi(data: AddCompanyCourse) {
  return request({
    url: `${BASE_URL}`,
    method: 'post',
    data,
  })
}

export function deleteCompanyCourseByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete',
  })
}