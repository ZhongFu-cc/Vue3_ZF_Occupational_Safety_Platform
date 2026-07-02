import request from "@/utils/request";
import { Axios, AxiosPromise } from "axios";
import { ChapterProgressRequest } from "./type";
const BASE_URL = "/chapter-progress";

export function getChapterProgressApi(courseEnrollmentId: string, courseChapterId: string): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/by-chapter`,
    method: "get",
    params: {
      courseEnrollmentId,
      courseChapterId
    }
  });
}

export function learningChapterApi(data: ChapterProgressRequest): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}/learning`,
    method: "put",
    data
  });
}

export function getChapterByEnrollmentIdApi(courseEnrollmentId: string): AxiosPromise<any> {
  return request({
    url: `${BASE_URL}`,
    method: "get",
    params: {
      courseEnrollmentId
    }
  });
}