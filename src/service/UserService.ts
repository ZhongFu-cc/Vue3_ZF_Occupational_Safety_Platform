import { findAdminUserByIdApi, findAdminChildUserByQueryTextAndPaginationApi, updateAdminUserApi, createAdminUserApi, deleteAdminUserByIdApi, updateAdminUserStatusApi } from "@/api/system/admin";
import { findCompanyUserByIdApi, findCompanyChildUserByQueryTextAndPaginationApi, createCompanyUserApi, updateCompanyUserApi, deleteCompanyUserByIdApi, updateCompanyUserStatusApi } from "@/api/system/company";


export const useUserService = (role: 'admin' | 'company') => {
  const apiMap = {
    admin: {
      fetchUserById: findAdminUserByIdApi,
      fetchChildUsers: findAdminChildUserByQueryTextAndPaginationApi,
      createUser: createAdminUserApi,
      updateUser: updateAdminUserApi,
      deleteUser: deleteAdminUserByIdApi,
      updateUserStatus: updateAdminUserStatusApi,
    },
    company: {
      fetchUserById: findCompanyUserByIdApi,
      fetchChildUsers: findCompanyChildUserByQueryTextAndPaginationApi,
      createUser: createCompanyUserApi,
      updateUser: updateCompanyUserApi,
      deleteUser: deleteCompanyUserByIdApi,
      updateUserStatus: updateCompanyUserStatusApi,
    },
  }

  console.log(apiMap[role])

  return apiMap[role];
}