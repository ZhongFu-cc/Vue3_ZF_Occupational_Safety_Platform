import { CourseStatusEnum } from "@/constants/enums/CourseStatusEnum";

export interface ChapterProgress {
  chapterProgressId: string;
  courseEnrollmentId: string;
  courseChapterId: string;
  sysUserId: string;
  courseId: string;
  status: CourseStatusEnum;
  watchCount: number;
  isQuizPassed: 0 | 1;
  quizScore: number;
  quizAttempts: number;
  completedAt: string;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
}

export interface ChapterProgressRequest {
  chapterProgressId: string;
}