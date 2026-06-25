import request from '@/utils/request'
import { EnrollCourseRequest } from './type'

const BASE_URL = '/course-enrollment'

export function getCourseEnrollmentById(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function findCourseEnrollmentByOwnerAndPaginationApi(page: number, size: number, status?: string) {
  return request({
    url: `${BASE_URL}/pagination`,
    method: 'get',
    params: {
      page,
      size,
      status
    }
  })
}

export function enrollCourseApi(enrollCourseRequest: EnrollCourseRequest) {
  return request({
    url: `${BASE_URL}/enroll`,
    method: 'post',
    data: enrollCourseRequest
  })
}

export function cancelEnrollmentApi(courseEnrollmentId: string) {
  return request({
    url: `${BASE_URL}/${courseEnrollmentId}`,
    method: 'delete'
  })
}

