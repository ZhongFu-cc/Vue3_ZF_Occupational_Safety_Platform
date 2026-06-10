export interface JobCourseVO {
  jobCourseId: string;
  courseId: string;
  jobTypeId: string;
  isMandatory: number;
  title: string;
  coverImage: string;
  description: string;
  totalMinutes: number;
  isActive: number;
}

export interface AddTypeCategory {
  courseId: string;
  jobTypeId: string;
  isMandatory: number;
}

export interface UpdateTypeCategory {
  jobCourseId: string;
  isMandatory: number;
}