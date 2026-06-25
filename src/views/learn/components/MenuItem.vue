<template>
  <div>
    <el-sub-menu v-if="item.children && item.children.length > 0" :index="currentIndex">
      <template #title>
        <span class="menu-title">
          {{ item.title }}
        </span>
      </template>

      <MenuItem v-for="(child, childIndex) in item.children" :key="child.courseChapterId" :item="child"
        :current-index="`${currentIndex}-${childIndex}`" />
    </el-sub-menu>

    <el-menu-item v-else :index="currentIndex">
      <span class="menu-title" @click="select(item)">
        {{ item.title }}
      </span>
    </el-menu-item>
  </div>
</template>
<script lang="ts" setup>
import { CourseChapterVO } from '@/api/course/chapter/type';
import { inject } from 'vue';

const props = defineProps({
  item: { type: Object, required: true },
  currentIndex: { type: String, required: true }
});

// 1. 注入父組件提供的函式
const onChapterClick = inject<(item: any) => void>('onChapterClick');

// 2. 當點擊時，直接呼叫該函式並把當前的 item 傳回去
const select = (item: any) => {
  if (onChapterClick) {
    onChapterClick(item);
  }
};
</script>

<style lang="scss" scoped>
.el-menu-item {
  padding: 0.5rem 1rem !important;
  border-radius: 8px;

  .menu-title {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.el-sub-menu {

  :deep(.el-sub-menu__title) {
    padding: 0.5rem 0.5rem !important;
    border-radius: 8px !important;

    .menu-title {
      display: inline-block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>