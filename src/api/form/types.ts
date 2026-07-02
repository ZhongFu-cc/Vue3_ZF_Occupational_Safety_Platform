
// 定義一個純 Type，用於更寬鬆的場景
export type NumericBoolean = 0 | 1;

export enum FormStatusEnum {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",

}

export const FormStatusMeta: Record<
  FormStatusEnum,
  { label: string }
> = {
  [FormStatusEnum.DRAFT]: { label: "草稿" },
  [FormStatusEnum.PUBLISHED]: { label: "發佈" },
  [FormStatusEnum.CLOSED]: { label: "關閉" },
};

export interface Form {
  formId: string;
  title: string;
  description: string;
  status: FormStatusEnum;
  requireLogin: NumericBoolean;
  requiredForCheckout: NumericBoolean;
  allowMultipleSubmissions: NumericBoolean;
  startTime: string;
  endTime: string;

}

export enum FieldType {
  RADIO = "radio",
}


export interface FormDto {
  formId: string
  title: string
  description: string
  status: string
  requireLogin: number
  requiredForCheckout: number
  allowMultipleSubmissions: number
  startTime: string
  endTime: string
  formFields: FormField[]
}

export interface FormField {
  formFieldId: string
  formId: string
  fieldType: FieldType
  label: string
  description: string | null
  placeholder: string | null
  imageUrl: string | null
  imageCaption: string | null
  isRequired: number
  fieldOrder: number
  options: FieldOptions | null
  validationRules: ValidationRules | null
  answer: any
}

export interface FieldOptions {
  choices: Choice[]
  allowCustom: boolean
}

export interface Choice {
  id: string
  label: string
  imgUrl: string
}

export interface ValidationRules {
  max?: number
  min?: number
  showIf?: any
}
