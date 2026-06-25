import { tr } from "element-plus/es/locale";
import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteRecordRaw,
} from "vue-router";

export const Layout = () => import("@/layout/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },
  {
    path: "/reviewer-login",
    component: () => import("@/views/login/reviewerLogin.vue"),
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      //儀錶板
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
        // https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        meta: {
          title: "dashboard",
          icon: "homepage",
          affix: true,
          keepAlive: true,
          alwaysShow: false,
        },
      },

      //401錯誤
      {
        path: "401",
        component: () => import("@/views/error-page/401.vue"),
        meta: { hidden: true },
      },
      //404錯誤
      {
        path: "404",
        component: () => import("@/views/error-page/404.vue"),
        meta: { hidden: true },
      },
    ],
  },
];

export const adminDynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/member",
    component: Layout,
    name: "member",
    redirect: "/member-page",
    meta: {
      title: "成員管理",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/member-page",
        component: () => import("@/views/member/index.vue"),
        name: "memberPage",
        meta: {
          title: "成員列表",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
    ]
  }, {
    path: "/job-type",
    component: Layout,
    name: "jobType",
    redirect: "/job-type-page",
    meta: {
      title: "作業類別管理",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/job-type-page",
        component: () => import("@/views/jobType/index.vue"),
        name: "jobTypePage",
        meta: {
          title: "作業類別列表",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
      {
        path: "/job-type-course/:jobTypeId",
        component: () => import("@/views/jobType/components/Course.vue"),
        name: "jobTypeCoursePage",
        meta: {
          title: "作業類別課程分類",
          icon: "el-icon-Avatar",
          hidden: true,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
    ]
  }, {
    path: "/company",
    component: Layout,
    name: "company",
    meta: {
      title: "企業管理",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/company-page",
        component: () => import("@/views/company/index.vue"),
        name: "companyPage",
        meta: {
          title: "企業列表",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
    ]
  },
  {
    path: "/course",
    component: Layout,
    name: "course",
    redirect: "/course-category-page",
    meta: {
      title: "課程管理",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/course-category-page",
        component: () => import("@/views/courseCategory/index.vue"),
        name: "courseCategoryPage",
        meta: {
          title: "課程分類",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
      {
        path: "/course-page",
        component: () => import("@/views/course/index.vue"),
        name: "coursePage",
        meta: {
          title: "課程列表",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
      {
        path: "/course-chapter-page/:courseId",
        component: () => import("@/views/courseChapter/index.vue"),
        name: "courseChapterPage",
        meta: {
          title: "課程章節",
          icon: "el-icon-Avatar",
          hidden: true,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
    ]
  },

  /**--------------- 自定義表單 -----------------  */
  {
    path: "/form",
    component: Layout,
    name: "Form",
    meta: {
      title: "表單管理",
      icon: "el-icon-EditPen",
      hidden: false,
      roles: ["ADMIN"],
    },
    children: [
      /** 表單管理 路由 */
      {
        // 沿用 /form 當作 index , 記住只能有一個
        path: "",
        component: () => import("@/views/form/index.vue"),
        name: "FormIndex",
        meta: {
          title: "表單基本管理",
          icon: "menu",
          hidden: true,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
      /** 表單欄位 路由 */
      {
        path: ":formId/field",
        component: () => import("@/views/form/field.vue"),
        name: "FormFieldEditor",
        meta: {
          title: "表單欄位管理",
          icon: "menu",
          hidden: true,
          roles: ["ADMIN"],
          keepAlive: true,
        },
        props: true,
      },
      /** 表單回覆 路由 */
      {
        path: ":formId/response",
        component: () => import("@/views/form/response.vue"),
        name: "FormResponse",
        meta: {
          title: "表單回覆管理",
          icon: "menu",
          hidden: true,
          roles: ["ADMIN"],
          keepAlive: true,
        },
        props: true,
      },
      /** 表單修改 路由 */
      {
        path: "response/:responseId",
        component: () => import("@/views/form/editResponse.vue"),
        name: "EditResponse",
        meta: {
          title: "表單回覆修改",
          icon: "menu",
          hidden: true,
          roles: ["ADMIN"],
          keepAlive: true,
        },
        props: true,
      }

    ]

  }

]

export const companyManagerDynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/member",
    component: Layout,
    name: "member",

    meta: {
      title: "成員管理",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/member-page",
        component: () => import("@/views/member/index.vue"),
        name: "memberPage",
        meta: {
          title: "成員列表",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
    ]
  }, {
    path: "/department-management",
    component: Layout,
    name: "departmentManagement",
    redirect: "/department-page",
    meta: {
      title: "部門管理",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/department-page",
        component: () => import("@/views/department/index.vue"),
        name: "departmentPage",
        meta: {
          title: "部門列表",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
      {
        path: "/department-course-page/:departmentId",
        component: () => import("@/views/department/addCourse.vue"),
        name: "departmentCoursePage",
        meta: {
          title: "部門課程列表",
          icon: "el-icon-Avatar",
          hidden: true,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },

    ]
  }, {
    path: "/company-course-management",
    component: Layout,
    name: "companyCourseManagement",
    meta: {
      title: "公司課程管理",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/company-course-management-page",
        component: () => import("@/views/companyCourseManagement/index.vue"),
        name: "companyCoursePage",
        meta: {
          title: "公司課程列表",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["ADMIN"],
          keepAlive: true,
        },
      },
    ]
  }
]

export const userDynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/my-course",
    component: Layout,
    name: "myCourse",
    redirect: "/my-course-page",
    meta: {
      title: "已報名課程",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/my-course-page",
        component: () => import("@/views/courseEnrollment/index.vue"),
        name: "myCoursePage",
        meta: {
          title: "已報名課程列表",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["USER"],
          keepAlive: true,
        },
      }
    ]
  },
  {
    path: "/learning-record",
    component: Layout,
    name: "learningRecord",
    redirect: "/learning-record-page",
    meta: {
      title: "學習歷程",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
    },
    children: [
      {
        path: "/learning-record-page",
        component: () => import("@/views/learningRecord/index.vue"),
        name: "learningRecordPage",
        meta: {
          title: "學習歷程",
          icon: "el-icon-Avatar",
          hidden: false,
          roles: ["USER"],
          keepAlive: true,
        },
      }
    ]
  },
  {
    path: "/course-learn",
    component: Layout,
    name: "courseLearn",
    redirect: "/course-learn-page",
    meta: {
      title: "課程學習",
      icon: "el-icon-Avatar",
      keepAlive: true,
      alwaysShow: false,
      hidden: true,
    },
    children: [
      {
        path: "/course-learn-page/:courseId",
        component: () => import("@/views/learn/index.vue"),
        name: "courseLearnPage",
        meta: {
          title: "課程學習",
          icon: "el-icon-Avatar",
          hidden: true,
          roles: ["USER"],
          keepAlive: true,
        },
      }
    ]
  }
  // {
  //   path: "/company-course",
  //   component: Layout,
  //   name: "companyCourse",
  //   redirect: "/company-course-page",
  //   meta: {
  //     title: "所有課程",
  //     icon: "el-icon-Avatar",
  //     keepAlive: true,
  //     alwaysShow: false,
  //   },
  //   children: [
  //     {
  //       path: "/company-course-page",
  //       component: () => import("@/views/companyCourse/index.vue"),
  //       name: "companyCoursePage",
  //       meta: {
  //         title: "所有課程列表",
  //         icon: "el-icon-Avatar",
  //         hidden: false,
  //         roles: ["USER"],
  //         keepAlive: true,
  //       },
  //     }
  //   ]
  // },

]







/**
 * 创建路由
 */
const router = createRouter({
  //此框架預設使用Hash模式
  //history: createWebHashHistory(),import.meta.env.BASE_URL

  //改用歷史模式,但要套入當前的baseURL,且Nginx要記得做設定
  history: createWebHistory(import.meta.env.BASE_URL),
  //剛剛的路由
  routes: constantRoutes,
  //移除多餘的斜線,保持乾淨
  strict: true,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});


/**
 * 重置路由
 */
export function resetRouter() {
  router.replace({ path: "/login" });
}

export function resetReviewerRouter() {
  router.replace({
    path: "/reviewer-login"
  });
};

export default router;
