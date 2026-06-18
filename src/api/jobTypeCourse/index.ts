import request from '@/utils/request'
import { AddTypeCategory, UpdateTypeCategory } from './type'

const BASE_URL = '/job-type-course'

export function findJobTypeCourseCategoryByJobTypeIdApi(jobTypeId: string, page: number, size: number, queryText: string) {
  return request({
    url: `${BASE_URL}/pagination`,
    method: 'get',
    params: {
      jobTypeId,
      page,
      size,
      queryText
    }
  })
}

export function findAllJobCourseListApi(jobTypeId: string) {
  return request({
    url: `${BASE_URL}`,
    method: 'get',
    params: {
      jobTypeId
    }
  })
}


export function createTypeCategoryApi(data: AddTypeCategory) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

export function updateTypeCategoryApi(data: UpdateTypeCategory) {
  return request({
    url: BASE_URL,
    method: 'put',
    data
  })
}

export function deleteTypeCategoryByIdApi(typeCourseId: string) {
  return request({
    url: `${BASE_URL}/${typeCourseId}`,
    method: 'delete'
  })
}