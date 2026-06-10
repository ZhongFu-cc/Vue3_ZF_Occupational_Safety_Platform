import request from '@/utils/request'
import { AddJobType, UpdateJobType } from './type'

const BASE_URL = '/job-type'

export function findJobTypeByIdApi(jobTypeId: string) {
  return request({
    url: `${BASE_URL}/${jobTypeId}`,
    method: 'get'
  })
}

export function findJobTypeListApi() {
  return request({
    url: BASE_URL,
    method: 'get'
  })
}

export function findJobTypeByQueryTextAndPaginationApi(page: number, size: number, queryText: string): Promise<any> {
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

export function createJobTypeApi(data: AddJobType) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

export function updateJobTypeApi(data: UpdateJobType) {
  return request({
    url: BASE_URL,
    method: 'put',
    data
  })
}

export function deleteJobTypeByIdApi(jobTypeId: string) {
  return request({
    url: `${BASE_URL}/${jobTypeId}`,
    method: 'delete'
  })
}