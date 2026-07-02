<template>
  <div class="content">
    <BasicComponent title="課程管理" :totalCount="`${totalCount} 筆`">
      <template #search-box>
        <div class="search-box">
          <el-input v-model="queryText" placeholder="請輸入課程名稱" clearable @keyup.enter="handleSearch" />

          <el-button type="primary" :loading="loading" @click="handleSearch">
            查詢
          </el-button>

          <el-button @click="handleReset">
            重置
          </el-button>
        </div>
      </template>

      <template #option-box>
        <el-button @click="createDialogState.open">
          新增課程
        </el-button>
      </template>

      <template #data-table>
        <el-table v-loading="loading" :data="courseList" empty-text="暫無課程資料">
          <el-table-column prop="title" label="課程名稱" min-width="180" show-overflow-tooltip />

          <el-table-column prop="description" label="課程描述" min-width="220" show-overflow-tooltip />

          <el-table-column label="課程時長(分鐘)" width="130" align="center">
            <template #default="{ row }">
              {{ displayTotalMinute(row.totalMinutes) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="updateDialogState.open(row)">
                編輯
              </el-button>

              <el-button type="warning" link @click="navigateToChapter(row.courseId)">
                章節
              </el-button>

              <el-button type="danger" link @click="deleteCourse(row.courseId)">
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template #pagination-box>
        <el-pagination layout="prev, pager, next" :current-page="currentPage" :total="totalCount"
          @current-change="handlePageChange" />
      </template>
    </BasicComponent>

    <el-dialog v-model="createDialogState.isOpen" title="新增課程" :width="dialogWidth" destroy-on-close
      :show-close="false">
      <CreateCourseForm @submit="fetchCourseList" @cancel="createDialogState.close" />
    </el-dialog>

    <el-dialog v-model="updateDialogState.isOpen" title="更新課程" :width="dialogWidth" destroy-on-close
      :show-close="false">
      <UpdateCourseForm :course="updateCourseData" @submit="fetchCourseList" @cancel="updateDialogState.close" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElNotification } from "element-plus";
import { useRouter } from "vue-router";

import BasicComponent from "@/layout/components/Basic/index.vue";
import CreateCourseForm from "./components/CreateCourse.vue";
import UpdateCourseForm from "./components/UpdateCourse.vue";

import { useAppStore } from "@/store";

import { tryCatch } from "@/utils/tryCatch";

import {
  deleteCourseApi,
  findCourseListByCategoryIdAndPaginationApi,
} from "@/api/course/course";

import type { Course } from "@/api/course/course/type";

const router = useRouter();

const device = useAppStore().device;

const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

const loading = ref(false);

const courseCategoryId = ref("");
const queryText = ref("");

const courseList = ref<Course[]>([]);

const showError = (message: string) => {
  ElNotification({
    title: "錯誤",
    message,
    type: "error",
  });
};

const showSuccess = (message: string) => {
  ElNotification({
    title: "成功",
    message,
    type: "success",
  });
};

const displayTotalMinute = (
  value?: number
) => {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return "-";
  }

  return value;
};

const fetchCourseList = async () => {
  loading.value = true;

  try {
    const { res, error }: any = await tryCatch(
      findCourseListByCategoryIdAndPaginationApi(
        currentPage.value,
        pageSize.value,
        courseCategoryId.value.trim(),
        queryText.value.trim()
      )
    );

    if (error || res?.code !== 200) {
      showError(
        res?.message || "無法取得課程列表"
      );
      return;
    }

    courseList.value = res?.data?.records ?? [];
    totalCount.value = Number(
      res?.data?.total ?? 0
    );

    createDialogState.close();
    updateDialogState.close();
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchCourseList();
};

const handleReset = () => {
  queryText.value = "";
  courseCategoryId.value = "";
  currentPage.value = 1;

  fetchCourseList();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchCourseList();
};

const dialogWidth = computed(() => {
  return device === "mobile" ? "90%" : "40%";
});

const createDialogState = reactive({
  isOpen: false,

  open: () => {
    createDialogState.isOpen = true;
  },

  close: () => {
    createDialogState.isOpen = false;
  },
});

const updateCourseData =
  reactive<Course>(
    {} as Course
  );

const updateDialogState = reactive({
  isOpen: false,

  open: (row: any) => {
    Object.assign(
      updateCourseData,
      row
    );

    updateDialogState.isOpen = true;
  },

  close: () => {
    updateDialogState.isOpen = false;
  },
});

const deleteCourse = async (courseId: string) => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除這門課程嗎？",
      "警告",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const { res, error }: any =
      await tryCatch(
        deleteCourseApi(courseId)
      );

    if (error || res?.code !== 200) {
      showError(
        res?.message || "無法刪除課程"
      );
      return;
    }

    if (
      courseList.value.length === 1 &&
      currentPage.value > 1
    ) {
      currentPage.value--;
    }

    showSuccess("課程已刪除");

    await fetchCourseList();
  } catch {
    // 使用者取消
  }
};

const navigateToChapter = (courseId: string) => {
  router.push({
    name: "courseChapterPage",
    params: {
      courseId,
    },
  });
};

onMounted(() => {
  fetchCourseList();
});
</script>

<style scoped lang="scss">
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input {
    width: 280px;
  }

  @media screen and (max-width: 760px) {
    width: 100%;
    flex-wrap: wrap;

    .el-input {
      width: 100%;
    }
  }
}
</style>
