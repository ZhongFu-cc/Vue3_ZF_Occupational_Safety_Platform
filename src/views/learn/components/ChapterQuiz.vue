<template>
  <div class="form-box">
    <el-form ref="formRef" :model="formModel" :rules="formRules" label-position="top">
      <template v-for="field in fillableForm.formFields" :key="field.formFieldId">
        <el-form-item :label="field.label" :prop="field.formFieldId">
          <component :is="resolveComponent(field)" v-model="formModel[field.formFieldId]" :field="field" />
        </el-form-item>
      </template>

      <div class="function-bar">
        <el-button size="large" round type="primary" class="submit-btn" @click="submit">
          送出
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";

import RadioQuestion from "@/components/FormField/FormFieldType/FormRadio.vue";

import { getRandomQuizFormApi } from "@/api/form";
import { answerQuizApi } from "@/api/formResponse";

import {
  FieldType,
  type FormDto,
  type FormField,
} from "@/api/form/types";

import type { CourseChapterVO } from "@/api/course/chapter/type";
import type { ChapterProgress } from "@/api/chapterProgress/type";

import { tryCatch } from "@/utils/tryCatch";

const props = defineProps<{
  chapter: CourseChapterVO;
  chapterProgress: ChapterProgress;
  courseEnrollmentId: string;
}>();

const emits = defineEmits<{
  (e: "submit-success", payload: unknown): void;
}>();

const formRef = ref<FormInstance>();

const formId = ref("");

const fillableForm = reactive<FormDto>({
  formId: "",
  title: "",
  description: "",
  status: "",
  requireLogin: 0,
  requiredForCheckout: 0,
  allowMultipleSubmissions: 0,
  startTime: "",
  endTime: "",
  formFields: [],
});

const formModel = reactive<Record<string, unknown>>({});

const formRules = reactive<FormRules>({});

const componentMap: Record<FieldType, any> = {
  [FieldType.RADIO]: RadioQuestion,
};

const showError = (message: string) => {
  ElNotification.error({
    title: "錯誤",
    message,
  });
};

const clearFormState = () => {
  Object.keys(formModel).forEach((key) => {
    delete formModel[key];
  });

  Object.keys(formRules).forEach((key) => {
    delete formRules[key];
  });
};

const initForm = () => {
  clearFormState();

  [...fillableForm.formFields]
    .sort((a, b) => a.fieldOrder - b.fieldOrder)
    .forEach((field) => {
      const key = field.formFieldId;
      formModel[key] = "";

      if (field.isRequired) {
        formRules[key] = [
          {
            required: true,
            message: `${field.label} 為必填`,
            trigger: ["blur", "change"],
          },
        ];
      }
    });
};

const getFillableForm = async () => {
  const { res, error }: any = await tryCatch(
    getRandomQuizFormApi(
      formId.value,
      props.courseEnrollmentId
    )
  );
  if (error || res.code !== 200) {
    showError(
      res?.msg || "獲取測驗失敗"
    );
    return;
  }

  Object.assign(fillableForm, res.data);

  initForm();
};

const resolveComponent = (field: FormField) => {
  return componentMap[field.fieldType];
};

const buildSubmitPayload = () => {
  return {
    formId: fillableForm.formId,
    memberId: undefined,
    chapterProgressId:
      props.chapterProgress.chapterProgressId,

    responseAnswer: Object.entries(formModel)
      .filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }

        return (
          value !== "" &&
          value !== null &&
          value !== undefined
        );
      })
      .map(([formFieldId, value]: any) => ({
        formFieldId,

        answerValue: Array.isArray(value)
          ? value
            .map((item) => item.label)
            .join(",")
          : value?.label,

        choiceId: Array.isArray(value)
          ? value
            .map((item) => item.choiceId)
            .join(",")
          : value?.id,
      })),
  };
};

const submit = async () => {
  if (!formRef.value) {
    return;
  }

  const valid = await formRef.value
    .validate()
    .catch(() => false);

  if (!valid) {
    return;
  }

  const payload = buildSubmitPayload();

  const { res, error }: any = await tryCatch(
    answerQuizApi(payload)
  );

  if (error || res?.code !== 200) {
    showError(
      res?.message || "送出測驗失敗"
    );
    return;
  }

  emits("submit-success", res.data);
};

watch(
  () => props.chapter.formId,
  async (newFormId) => {
    if (
      !newFormId ||
      props.chapter.contentType !== "quiz"
    ) {
      return;
    }

    formId.value = newFormId;

    await getFillableForm();
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss" scoped>
.form-box {
  width: 80%;
  margin: 3% auto;
  padding: 24px;

  background: var(--el-bg-color, #fff);

  border-radius: 12px;

  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .function-bar {
    display: flex;
    justify-content: center;

    margin-top: 32px;

    .submit-btn {
      min-width: 200px;

      font-weight: 600;
      letter-spacing: 2px;
    }
  }

  @media screen and (max-width: 800px) {
    width: 90%;
    padding: 20px;
  }

  @media screen and (max-width: 480px) {
    width: 100%;
    padding: 16px 12px;

    border-radius: 0;
    box-shadow: none;

    .function-bar .submit-btn {
      width: 100%;
      min-width: 0;
    }
  }
}
</style>