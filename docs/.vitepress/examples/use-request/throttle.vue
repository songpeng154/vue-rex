<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟提交接口
const submitForm = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { data: `提交成功 @ ${new Date().toLocaleTimeString()}` }
}

const clickCount = ref(0)
const requestCount = ref(0)

// throttleWait: 2000 —— 2 秒内无论点击多少次，只发出 1 次请求
const { data, throttleRun } = useApi(submitForm, {
  throttleWait: 2000,
  manual: true,
  onSuccess() { requestCount.value++ },
})

const handleClick = () => {
  clickCount.value++
  throttleRun()
}
</script>

<template>
  <div>
    <p class="desc">
      快速连续点击按钮，2 秒内只会发出 1 次请求（用于防止重复提交）
    </p>
    <button class="btn" @click="handleClick">
      提交表单
    </button>
    <div class="stats">
      <span>点击次数：<strong>{{ clickCount }}</strong></span>
      <span>实际请求次数：<strong>{{ requestCount }}</strong></span>
      <span v-if="data">✅ {{ data }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.btn { background: #5e7aeb; color: #fff; border: none; padding: 8px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; }
.stats { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
</style>
