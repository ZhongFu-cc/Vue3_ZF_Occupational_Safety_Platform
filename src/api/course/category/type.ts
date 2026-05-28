export interface AddCourseCategory {
  name: string;
  code: string;
  description: string;
  minRequiredMinutes: string;
  isActive: number;
}

export interface UpdateCourseCategory {
  courseCategoryId: string;
  name: string;
  code: string;
  description: string;
  minRequiredMinutes: string;
  isActive: number;
}