import { CommonStatusEnum } from "@/constants/enums/CommonStatusEnum";
import { CourseStatusEnum } from "@/constants/enums/CourseStatusEnum";


export interface CourseEnrollmentVO {
  courseEnrollmentId: string;
  sysUserId: string;
  courseId: string;
  courseCategoryId: string;
  courseName: string;
  courseDescription: string;
  courseCoverImage: string;
  status: CourseStatusEnum;
  totalChapters: number;
  completedChapters: number;
  isChaptersDone: 0 | 1;
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

export interface LearningRecordVO {
  courseEnrollmentId: string,
  sysUserId: string,
  courseId: string,
  courseName: string,
  status: CourseStatusEnum,
  progress: string,
  isChaptersDone: CommonStatusEnum,
  accumulatedSeconds: number,
  isMinutesMet: CommonStatusEnum,
  startedAt: string,
  completedAt: string,
  expiredAt: string,
  isCompleted: CommonStatusEnum
}

