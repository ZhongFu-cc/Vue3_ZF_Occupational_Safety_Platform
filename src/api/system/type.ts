export interface AddSysUser {
  account: string;
  password: string;
  realName: string;
  email: string;
  phone: string;
  companyName: string;
  remark: string;
}

export interface PutSysUser {
  sysUserId: string;
  account: string;
  password: string;
  realName: string;
  email: string;
  phone: string;
  companyName: string;
  remark: string;
}

export interface UpdateUserStatus {
  sysUserId: string;
  status: number;
}

export interface SysUser {
  sysUserId: string;
  parentId: string;
  account: string;
  password: string;
  realName: string;
  email: string;
  phone: string;
  companyName: string;
  isActive: number;
  remark: string;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
}