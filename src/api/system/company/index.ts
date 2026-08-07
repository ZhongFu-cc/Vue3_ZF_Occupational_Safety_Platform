import request from '@/utils/request'
import { AxiosPromise } from 'axios'
import { AddSysUser, PutSysUser, UpdateUserStatus } from '../type'

const BASE_URL = 'system/company'

export function findCompanyUserByIdApi(id: string): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get',
  })
}

export function findCompanyChildUserByQueryTextAndPaginationApi(page: number, size: number, queryText: string): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/child/pagination`,
    method: 'get',
    params: { page, size, queryText },
  })
}

export function createCompanyUserApi(data: AddSysUser): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}`,
    method: 'post',
    data,
  })
}

export function updateCompanyUserApi(data: PutSysUser): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}`,
    method: 'put',
    data,
  })
}

export function deleteCompanyUserByIdApi(id: string): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete',
  })
}

export function updateCompanyUserStatusApi(data: UpdateUserStatus): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/status`,
    method: 'put',
    data,
  })
}

export function importExcelApi(formData: FormData): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/import-excel`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}