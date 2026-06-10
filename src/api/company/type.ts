export interface AddCompany {
  name: string;
  status: 'enabled' | 'disabled' | 'expired';
  jobTypeIds: string[];
}

export interface UpdateCompany {
  companyId: string;
  name: string;
  status: 'enabled' | 'disabled' | 'expired';
}

export interface Company {
  companyId: string;
  name: string;
  status: 'enabled' | 'disabled' | 'expired';
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
}