import request from '@/utils/request'
const BASE_URL = '/chapter-video'

export function findChapterVideoByCourseChapterIdApi(courseChapterId: string) {
  return request({
    url: `${BASE_URL}/${courseChapterId}`,
    method: 'get'
  })
}