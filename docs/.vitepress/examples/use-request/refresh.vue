<script setup lang="ts">
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

const getTime = async (now: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { data: `请求时间：${new Date(now).toLocaleTimeString()}` }
}

// defaultParams —— 首次请求自动使用该参数
// refresh —— 使用上次参数重新请求
const { data, loading, run, refresh } = useApi(getTime, {
  defaultParams: [Date.now()],
})
</script>

<template>
  <div>
    <div v-if="loading" class="state-box loading">
      ⏳ 加载中...
    </div>
    <div v-else class="state-box success">
      <p>{{ data }}</p>
    </div>
    <div class="actions">
      <button @click="run(Date.now())">
        带新参数执行
      </button>
      <button class="secondary" @click="refresh()">
        刷新（使用上次参数）
      </button>
    </div>
    <p class="hint">
      refresh 用上次参数重新请求；run 需要传入新参数
    </p>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.state-box { padding: 12px; border-radius: 6px; margin-bottom: 12px; }
.loading { background: var(--vp-c-bg-soft); }
.success { background: var(--vp-c-brand-soft); }
p { margin: 0; }
.actions { display: flex; gap: 8px; margin-bottom: 8px; }
button { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; }
.secondary { background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider); }
.hint { font-size: 13px; color: var(--vp-c-text-2); }
</style>
