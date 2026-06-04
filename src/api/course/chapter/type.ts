export interface AddCourseChapter {
  courseId: string;
  parentId: string;
  formId: string;
  title: string;
  chapterOrder: number;
  contentType: string;
}

export interface UpdateCourseChapter {
  courseChapterId: string;
  courseId: string;
  parentId: string;
  formId?: string;
  title: string;
  chapterOrder: number;
  contentType: string;
}

export interface CourseChapterVO {
  courseChapterId: string;
  courseId: string;
  parentId: string;
  formId: string;
  title: string;
  chapterOrder: number;
  contentType: 'directory' | 'video' | 'quiz';
  videoUrl: string;
  children: CourseChapterVO[];
}