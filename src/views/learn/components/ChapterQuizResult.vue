<template>
  <div class="form">
    <div class="table-wrapper">
      <table class="quiz-table">
        <thead>
          <tr>
            <th>題目</th>
            <th>你的答案</th>
            <th>正確答案</th>
            <th>是否正確</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in props.quizResult" :key="index">
            <td>{{ item.question }}</td>
            <td>{{ item.yourAnswer }}</td>
            <td>{{ item.correctAnswer }}</td>
            <td>
              <span :class="['result-tag', item.isCorrect === 1 ? 'correct' : 'incorrect']">
                {{ item.isCorrect === 1 ? '正確' : '錯誤' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="hasIncorrectAnswer" class="retry-wrap">
      <button class="retry-button" type="button" @click="handleRetry">
        再測驗一次
      </button>
    </div>
    <div v-else class="retry-wrap">
      <el-button type="primary" @click="handleReturn">
        返回報名課程
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { use } from 'video.js/dist/types/tech/middleware';

const props = defineProps<{
  quizResult: any
}>()

const emit = defineEmits<{
  (event: 'retry'): void
}>()

const hasIncorrectAnswer = computed(() => {
  if (!props.quizResult) return false

  // 不管它是陣列還是物件，都統一轉換成「值的陣列」
  const resultArray = Array.isArray(props.quizResult)
    ? props.quizResult
    : Object.values(props.quizResult)

  // 檢查是否有任何一題是錯誤的 (isCorrect === 0)
  return resultArray.some((item: any) => {
    return item?.isCorrect === 0
  })
})

console.log(hasIncorrectAnswer.value, props.quizResult)

const handleRetry = () => {
  emit('retry')
}


const router = useRouter();
const handleReturn = () => {
  router.push({ name: 'myCoursePage' });
}

watch(() => props.quizResult, (newVal) => {
  console.log("quizResult changed: ", newVal);
}, { deep: true, immediate: true });
</script>
<style lang="scss" scoped>
.form {
  width: 90%;
  padding: 20px;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e8edf4;
  border-radius: 12px;
  background: #fff;
}

.quiz-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;

  thead {
    background: linear-gradient(90deg, #f5f9ff 0%, #eef4ff 100%);
  }

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid #eef2f7;
    text-align: left;
    vertical-align: top;
    line-height: 1.5;
  }

  th {
    font-weight: 600;
    color: #334155;
    white-space: nowrap;
  }

  tbody tr:nth-child(even) {
    background-color: #fafcff;
  }

  tbody tr:hover {
    background-color: #f2f7ff;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.result-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 54px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;

  &.correct {
    color: #0f766e;
    background: #ccfbf1;
  }

  &.incorrect {
    color: #b91c1c;
    background: #fee2e2;
  }
}

.retry-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.retry-button {
  padding: 9px 16px;
  border: 1px solid #1d4ed8;
  border-radius: 8px;
  background: #1d4ed8;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: #1e40af;
    border-color: #1e40af;
  }

  &:active {
    background: #1e3a8a;
    border-color: #1e3a8a;
  }
}
</style>