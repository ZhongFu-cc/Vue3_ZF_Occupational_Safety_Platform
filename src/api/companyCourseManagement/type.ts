export interface AddCompanyCourse {
  courseId: string;
}

export interface CompanyCourseVO {
  companyCourseId: string;
  companyId: string;
  courseId: string;
  courseCategoryId: string;
  title: string;
  coverImage: string;
  description: string;
  totalMinutes: number;
  isActive: 0 | 1;
}