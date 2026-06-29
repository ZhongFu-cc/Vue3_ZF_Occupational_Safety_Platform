export interface Heartbeat {
  chapterWatchLogId: string;
}

export interface ChapterWatchLog {
  chapterWatchLogId: string;
  chapterProgressId: string;
  courseEnrollmentId: string;
  sysUserId: string;
  courseChapterId: string;
  sessionStart: string;
  sessionEnd: string;
  durationSec: number;
  createBy: string;
  createDate: string;
}

export interface HeartbeatVO {
  accumulatedSeconds: number;
  sessionAlive: boolean;
}