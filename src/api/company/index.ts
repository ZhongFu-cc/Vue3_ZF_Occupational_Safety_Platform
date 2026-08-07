import request from "@/utils/request";
import { AddCompany, UpdateCompany } from "./type";

const BASE_URL = "/company";

export function findCompanyByIdApi(id: string) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: "get",
  });
}

export function findCompanyListByQueryTextAndPaginationApi(
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

export function createCompanyApi(data: AddCompany) {
  return request({
    url: `${BASE_URL}`,
    method: "post",
    data,
  });
}

export function updateCompanyApi(data: UpdateCompany) {
  return request({
    url: `${BASE_URL}`,
    method: "put",
    data,
  });
}

export function findAllCompanyListApi() {
  return request({
    url: `${BASE_URL}`,
    method: "get",
  });
}