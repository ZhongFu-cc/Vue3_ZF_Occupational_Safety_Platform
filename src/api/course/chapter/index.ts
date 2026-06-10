import request from '@/utils/request'
import { AddCourseChapter, UpdateCourseChapter } from './type'
const BASE_URL = '/course-chapter'

export function findCourseChapterByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function findCourseChapterListByCourseIdApi(courseId: string) {
  return request({
    url: `${BASE_URL}/course`,
    method: 'get',
    params: {
      courseId
    }
  })
}

export function createCourseChapterApi(data: AddCourseChapter) {
  return request({
    url: `${BASE_URL}`,
    method: 'post',
    data
  })
}

export function updateCourseChapterApi(data: UpdateCourseChapter) {
  return request({
    url: `${BASE_URL}`,
    method: 'put',
    data
  })
}

export function deleteCourseChapterApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}