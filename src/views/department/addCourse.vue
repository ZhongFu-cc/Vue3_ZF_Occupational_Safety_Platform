<template>
  <div>
    <BasicComponent :title="`課程選擇 - ${department?.name}`">
      <template #search-box>
        <el-input v-model="queryText" placeholder="請輸入課程名稱" @keydown.enter="findDepartmentCourseList" />
        <el-button type="primary" @click="findDepartmentCourseList">搜尋</el-button>
      </template>

      <template #option-box>
        <el-button type="primary" @click="dialogState.open">新增課程</el-button>
      </template>

      <template #data-table>
        <el-table v-if="hasData" :data="departmentCourseList">
          <el-table-column>
            <template #default="{ row }">
              <el-image :src="minioEnv + row.courseCoverImage" fit="cover"></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="courseName" label="課程名稱"></el-table-column>
          <el-table-column prop="courseDescription" label="課程描述"></el-table-column>
          <el-table-column prop="courseTotalMinutes" label="課程時長" align="center"></el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="danger" link @click="deleteCourseFromDepartment(row.departmentCourseId)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-else description="暫無課程"></el-empty>

        <div class="pagination-box">
          <el-pagination layout="prev, pager, next" :total="Number(departmentCourseTotal)"
            @current-change="handleDepartmentCoursePageChange" />
        </div>
      </template>
    </BasicComponent>

    <el-dialog title="新增課程" v-model="dialogState.isOpen" :width="device === 'mobile' ? '100%' : '70%'">
      <el-select v-model="selectCategoryId" filterable clearable placeholder="請選擇課程"
        @end-reached="fetchCourseCategoryList()" @change="findCourseList">
        <el-option v-for="category in courseCategoryList" :key="category.courseCategoryId" :label="category.name"
          :value="category.courseCategoryId"></el-option>
      </el-select>
      <el-table ref="tableRef" :data="courseList">
        <el-table-column width="150">
          <template #default="{ row }">
            <el-image :src="minioEnv + row.coverImage" fit="cover"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="課程名稱"></el-table-column>
        <el-table-column prop="description" label="課程描述"></el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" @click="openAddDialogState.open(row.companyCourseId)"
              :disabled="existingCourseIds.includes(row.companyCourseId)">新增</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box">
        <el-pagination layout="prev, pager, next" :total="Number(total)" @current-change="handlePageChange" />
      </div>
    </el-dialog>

    <el-dialog v-model="openAddDialogState.isOpen" title="確認新增課程" width="30%">
      <span>確定要將此課程新增到部門嗎？</span>
      <el-button type="primary" @click="addCourseToDepartment">確認新增</el-button>
      <el-button @click="openAddDialogState.close">取消</el-button>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { findCompanyCourseListByQueryTextAndPaginationApi } from '@/api/companyCourseManagement';
import { findCourseCategoryListByQueryTextAndPaginationApi } from '@/api/course/category';
import { CourseCategory } from '@/api/course/category/type';
import { Course } from '@/api/course/course/type';
import { findDepartmentByIdApi } from '@/api/department';
import { AddDepartmentCourse, Department } from '@/api/department/type';
import { addDepartmentCourseApi, deleteDepartmentCourseByIdApi, findAllDepartmentCourseListApi, findDepartmentCourseListByPaginationApi } from '@/api/departmentCourse';
import { DepartmentCourseVo } from '@/api/departmentCourse/type';
import BasicComponent from '@/layout/components/Basic/index.vue'
import { useAppStore } from '@/store';
import { tryCatch } from '@/utils/tryCatch';
import { ElNotification } from 'element-plus';

const departmentId = ref<string>(useRoute().params.departmentId as string)

const hasData = ref<boolean>(false);
const device = useAppStore().device

const departmentCourseList = ref<DepartmentCourseVo[]>([])
const currentPage = ref<number>(1)
const queryText = ref<string>('')
const existingCourseIds = ref<string[]>([])

// 顯示部門資訊
const department = ref<Department>()
const findDepartment = async () => {
  const { res, error }: any = await tryCatch(findDepartmentByIdApi(departmentId.value))
  console.log('findDepartment res', res, 'error', error);
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取部門失敗',
      type: 'error',
    })

    return
  }
  department.value = res.data
}


const departmentCourseTotal = ref<number>(0)
const findDepartmentCourseList = async () => {
  const { res, error }: any = await tryCatch(findDepartmentCourseListByPaginationApi(currentPage.value, 10, departmentId.value, queryText.value))
  console.log('findDepartmentCourseList res', res, 'error', error);
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取課程列表失敗',
      type: 'error',
    })

    return
  }
  departmentCourseList.value = res.data.records
  departmentCourseTotal.value = res.data.total
  hasData.value = departmentCourseList.value.length > 0
  findAllDepartmentCourseList()
}

const findAllDepartmentCourseList = async () => {
  const { res, error }: any = await tryCatch(findAllDepartmentCourseListApi(departmentId.value, queryText.value))
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取課程列表失敗',
      type: 'error',
    })

    return
  }
  existingCourseIds.value = res.data.map((item: DepartmentCourseVo) => item.companyCourseId)
  console.log('existingCourseIds', existingCourseIds.value);
}

const handleDepartmentCoursePageChange = (page: number) => {
  currentPage.value = page
  findDepartmentCourseList()
}

// ------------------------------------------------------------

const dialogState = reactive({
  isOpen: false,
  open: () => {
    dialogState.isOpen = true
  },
  close: () => {
    dialogState.isOpen = false
  }
})
const courseList = ref<Course[]>([])
const coursePage = ref<number>(1)
const courseQueryText = ref<string>('')
const total = ref<number>(0)
const minioEnv = import.meta.env.VITE_MINIO_API_URL

const handlePageChange = (page: number) => {
  coursePage.value = page
  findCourseList()
}
const findCourseList = async () => {
  courseList.value = []
  const { res, error }: any = await tryCatch(findCompanyCourseListByQueryTextAndPaginationApi(coursePage.value, 10, courseQueryText.value, selectCategoryId.value));
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '獲取課程列表失敗',
      type: 'error',
    })

    return
  }

  courseList.value = res.data.records
  total.value = res.data.total
}
// ------------------------------------------------------------

const addCompanyCourseId = ref<string>('')
const openAddDialogState = reactive({
  isOpen: false,
  open: (companyCourseId: string) => {
    addCompanyCourseId.value = companyCourseId
    openAddDialogState.isOpen = true
  },
  close: () => {
    openAddDialogState.isOpen = false
  }
})

const addCourseToDepartment = async () => {
  const payload: AddDepartmentCourse = {
    companyCourseId: addCompanyCourseId.value,
    departmentId: departmentId.value,
  }

  const { res, error }: any = await tryCatch(addDepartmentCourseApi(payload))
  if (error || res.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '新增課程失敗',
      type: 'error',
    })
    return;
  }

  ElNotification({
    title: '成功',
    message: '新增課程成功',
    type: 'success',
  })

  await findDepartmentCourseList()
  openAddDialogState.close()
  dialogState.close()
}

// ------------------------------------------------------------

const selectCategoryId = ref<string>('')
const categoryPage = ref(1);
const courseCategoryList = ref<CourseCategory[]>([]);
const hasMore = ref(true)
const fetchCourseCategoryList = async (isRefresh = false) => {
  if (isRefresh) {
    categoryPage.value = 1;
    courseCategoryList.value = [];
  }
  if (!hasMore.value && !isRefresh) {
    ElNotification({
      title: '提示',
      message: '沒有更多課程類別了',
      type: 'info',
    });
    return;
  }
  const { res, error }: any = await tryCatch(
    findCourseCategoryListByQueryTextAndPaginationApi(categoryPage.value, 20, '')
  );

  if (error || res?.code !== 200) {
    ElNotification({
      title: '錯誤',
      message: '無法取得課程分類列表',
      type: 'error',
    });
    return;
  }

  courseCategoryList.value.push(...res.data.records);
  hasMore.value = courseCategoryList.value.length < res.data.total;
  if (hasMore.value) {
    categoryPage.value++;
  }
};

const deleteCourseFromDepartment = async (departmentCourseId: string) => {
  ElMessageBox.confirm('確定要刪除這個課程嗎？', '警告', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    // 在這裡調用刪除 API
    const { res, error }: any = await tryCatch(deleteDepartmentCourseByIdApi(departmentCourseId));
    if (error || res.code !== 200) {
      ElNotification({
        title: '錯誤',
        message: '刪除課程失敗',
        type: 'error',
      });
      return;
    }

    ElNotification({
      title: '成功',
      message: '刪除課程成功',
      type: 'success',
    });

    // 刪除成功後重新獲取列表
    await findDepartmentCourseList();
  }).catch(() => {
    // 使用者取消刪除
  });

}

onMounted(() => {
  fetchCourseCategoryList()
  findDepartmentCourseList()
  findAllDepartmentCourseList()
  findDepartment()
})
</script>
<style lang="scss" scoped>
.pagination-box {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.el-image {
  border-radius: 8px;
  width: 10rem;
  aspect-ratio: 16/9;
}
</style>