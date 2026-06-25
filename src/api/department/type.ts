export interface Department {
  departmentId: string;
  companyId: string;
  name: string;
  isActive: number;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
}

export interface AddDepartment {
  companyId: string;
  name: string;
  isActive: number;
}

export interface UpdateDepartment {
  departmentId: string;
  name: string;
  isActive: number;
}

export interface AddDepartmentCourse {
  departmentId: string;
  companyCourseId: string;
}