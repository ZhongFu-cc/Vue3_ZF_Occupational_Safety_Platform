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

export interface UpcomingExpiryVO {
  // @Schema(description = "課程報名ID")
  courseEnrollmentId: string;

  // @Schema(description = "課程ID")
  courseId: string;

  // @Schema(description = "課程名稱")
  courseName: string;

  // @Schema(description = "課程證明到期時間")
  expiredAt: string;

  // @Schema(description = "剩餘天數")
  daysLeft: string;
}

export interface LearningRecordSummaryVO {
  // @Schema(description = "報名課程數（不含已取消）")
  totalEnrolled: number;

  // @Schema(description = "未開始課程數")
  notStartedCount: number;

  // @Schema(description = "進行中課程數")
  inProgressCount: number;

  // @Schema(description = "已完成課程數")
  completedCount: number;

  // @Schema(description = "已過期課程數")
  expiredCount: number;

  // @Schema(description = "已取消課程數")
  cancelledCount: number;

  // @Schema(description = "完成率 (已完成 / 報名數，不含已取消)，例如 36.4")
  completionRate: number;

  // @Schema(description = "累積學習時數（不含已取消），例如 27.2")
  accumulatedHours: number;

  // @Schema(description = "30 天內即將到期的課程證書數量")
  upcomingExpiryCount: number;

  // @Schema(description = "即將到期的課程明細清單（依到期日由近到遠排序）")
  upcomingExpiryList: UpcomingExpiryVO[];
}

