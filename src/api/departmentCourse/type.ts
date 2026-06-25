export interface DepartmentCourseVo {
  departmentCourseId: string;
  departmentId: string;
  companyCourseId: string;
  courseId: string;
  courseCategoryId: string;
  courseName: string;
  courseCoverImage: string;
  courseDescription: string;
  courseTotalMinutes: number;
}

export interface AddDepartmentCourse {
  departmentId: string;
  companyCourseId: string;
}