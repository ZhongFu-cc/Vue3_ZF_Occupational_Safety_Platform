interface DepartmentRankingVO {
  departmentId: string;
  departmentName: string;
  completeionRate: number;
}

interface LearningStatusDistributionVO {
  statusName: string;
  count: number;
  percentage: number;
}

export interface LearningProgressKpiVO {
  // 合規達標率<按人頭> (完全通過6門課的人數 / 總人數)
  completionRate: number;
  // 課程證照已過期人數 (任意一門證照過期皆算)
  expiredCount: number;
  // 總時數 (例如：120.0，前端自行加上 hr)
  totalTrainingHours: number;
  // 待催促人數 (任一門課程狀態為 not_started || pending 皆算)
  urgentCount: number;
}


export interface LearningProgressChartVO {

  /**
   * 部門完課排行資料列表 (左圖：條形圖)
   */
  departmentRankings: DepartmentRankingVO[];

  /**
   * 學習狀態比例資料列表 (右圖：環狀圖)
   */
  learningStatusDistribution: LearningStatusDistributionVO[];
}

export interface LearningProgressTableVO {

  // @Schema(description = "用戶ID")
  sysUserId: string;

  // @Schema(description = "用戶名")
  userName: string;

  // @Schema(description = "部門ID")
  depatmentId: string;

  // @Schema(description = "部門名")
  departmentName: string;

  // @Schema(description = "HR分發的總課程數")
  totalCourses: number;

  // @Schema(description = "用戶已完成的課程數")
  completedCourses: number;

  // @Schema(description = "用戶整體的學習狀態 (COMPLETED:已完課, IN_PROGRESS:學習中, NOT_STARTED:未開始)")
  overallStatus: string;
}
