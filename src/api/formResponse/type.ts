export interface AddResponseAnswerDTO {
  formFieldId: string;
  choiceId: string;
  answerValue: string
}

export interface QuizResponseDTO {
  formId: string;
  memberId?: string;
  chapterProgressId: string;
  responseAnswer: AddResponseAnswerDTO[];
}