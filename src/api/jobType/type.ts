export interface JobType {
  jobTypeId: string;
  name: string;
  description: string;
  isActive: number;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
}

export interface AddJobType {
  name: string;
  description: string;
  isActive: number;
}

export interface UpdateJobType {
  jobTypeId: string;
  name: string;
  description: string;
  isActive: number;
}