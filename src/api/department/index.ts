import request from "@/utils/request";
import { AddDepartment, AddDepartmentCourse, UpdateDepartment } from "./type";

const BASE_URL = "/department";

export function findDepartmentByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: "get",
  });
}

export function findDepartmentListByQueryTextAndPaginationApi(
  page: number,
  size: number,
  queryText: string
): Promise<any> {
  return request({
    url: `${BASE_URL}/pagination`,
    method: "get",
    params: {
      page,
      size,
      queryText,
    },
  });
}

export function createDepartmentApi(data: AddDepartment) {
  return request({
    url: `${BASE_URL}`,
    method: "post",
    data,
  });
}

export function updateDepartmentApi(data: UpdateDepartment) {
  return request({
    url: `${BASE_URL}`,
    method: "put",
    data,
  });
}

export function deleteDepartmentByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: "delete",
  });
}

export function assignCourseToDepartmentApi(data: AddDepartmentCourse) {
  return request({
    url: `${BASE_URL}/assign-course`,
    method: "post",
    data,
  });
}