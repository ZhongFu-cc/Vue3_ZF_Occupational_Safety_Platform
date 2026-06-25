

export interface CourseEnrollmentVO {
  courseEnrollmentId: string;
  sysUserId: string;
  courseId: string;
  courseCategoryId: string;
  courseName: string;
  courseDescription: string;
  courseCoverImage: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  totalChapters: number;
  completedChapters: number;
  isChapterDone: 0 | 1;
  accumulatedSeconds: number;
  requiredSeconds: number;
  isMinutesMet: 0 | 1;
  enrolledAt: string;
  startedAt: string;
  completedAt: string;
  expiredAt: string;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
}

export interface EnrollCourseRequest {
  courseId: string;
}

