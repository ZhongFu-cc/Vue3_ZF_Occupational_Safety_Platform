import request from '@/utils/request'
import { AxiosPromise } from 'axios'
import { AddSysUser, PutSysUser, UpdateUserStatus } from '../type'

const BASE_URL = 'system/admin'

export function findAdminUserByIdApi(id: string): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get',
  })
}

export function findAdminChildUserByQueryTextAndPaginationApi(page: number, size: number, queryText: string): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/child/pagination`,
    method: 'get',
    params: { page, size, queryText },
  })
}

export function createAdminUserApi(data: AddSysUser): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}`,
    method: 'post',
    data,
  })
}

export function updateAdminUserApi(data: PutSysUser): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}`,
    method: 'put',
    data,
  })
}

export function deleteAdminUserByIdApi(id: string): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete',
  })
}

export function updateAdminUserStatusApi(data: UpdateUserStatus): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/status`,
    method: 'put',
    data,
  })
}