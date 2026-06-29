export interface ChapterProgress {
  chapterProgressId: string;
  courseEnrollmentId: string;
  courseChapterId: string;
  sysUserId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
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