export interface AddCourseCategory {
  name: string;
  code?: string;
  description: string;
  minRequiredMinutes: number;
  isActive: number;
}

export interface UpdateCourseCategory {
  courseCategoryId: string;
  name: string;
  code?: string;
  description: string;
  minRequiredMinutes: number;
  isActive: number;
}

export interface CourseCategory {
  courseCategoryId: string;
  name: string;
  code: string;
  description: string;
  minRequiredMinutes: number;
  isActive: number;
}