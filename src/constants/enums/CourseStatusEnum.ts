export enum CourseStatusEnum {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export const COURSE_STATUS_OPTIONS = [
  {
    value: CourseStatusEnum.NOT_STARTED,
    label: "未開始",
  },
  {
    value: CourseStatusEnum.IN_PROGRESS,
    label: "進行中",
  },
  {
    value: CourseStatusEnum.COMPLETED,
    label: "已完成",
  },
  {
    value: CourseStatusEnum.EXPIRED,
    label: "已過期",
  },
  {
    value: CourseStatusEnum.CANCELLED,
    label: "已被取消",
  },
];