export interface AddCourse {
  courseCategoryId: string;
  title: string;
  description: string;
  totalMinutes: number;
  isActive: number;
}

export interface UpdateCourse {
  courseId: string;
  courseCategoryId: string;
  title: string;
  description: string;
  totalMinutes: number;
  isActive: number;
}

export interface Course {
  courseId: string;
  courseCategoryId: string;
  title: string;
  description: string;
  totalMinutes: number;
  isActive: number;
  coverImage: string;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
}