import request from "@/utils/request";
import { AddDepartmentCourse } from "./type";

const BASE_URL = "/department-course";

export function findDepartmentCourseListByPaginationApi(page: number, size: number, departmentId: string, queryText: string): Promise<any> {
  return request({
    url: `${BASE_URL}/pagination`,
    method: "get",
    params: {
      page,
      size,
      departmentId,
      queryText,
    },
  });
}

export function findAllDepartmentCourseListApi(departmentId: string, queryText: string): Promise<any> {
  return request({
    url: `${BASE_URL}`,
    method: "get",
    params: {
      departmentId,
      queryText,
    },
  });
}

export function addDepartmentCourseApi(data: AddDepartmentCourse) {
  return request({
    url: `${BASE_URL}`,
    method: "post",
    data
  });
}

export function deleteDepartmentCourseByIdApi(departmentCourseId: string) {
  return request({
    url: `${BASE_URL}/${departmentCourseId}`,
    method: "delete",
  });
}