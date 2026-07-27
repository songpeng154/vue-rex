<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟一个会随机失败的接口
const getData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // 50% 概率失败
  if (Math.random() > 0.5) throw new Error('服务器繁忙，请稍后重试')
  return { data: `数据加载成功 @ ${new Date().toLocaleTimeString()}` }
}

const errorCount = ref(0)

// errorRetryCount: 3 —— 失败后自动重试 3 次
// errorRetryInterval: 1000 —— 每次重试间隔 1 秒
const { data, loading, error } = useApi(getData, {
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  onError() { errorCount.value++ },
})
</script>

<template>
  <div>
    <div v-if="loading" class="state-box loading">
      ⏳ 请求中（失败会自动重试，最多 3 次）...
      <br><small>错误次数：{{ errorCount }}</small>
    </div>

    <div v-else-if="error" class="state-box error">
      ❌ 重试 3 次后仍然失败：{{ error.message }}
      <br><small>总错误次数：{{ errorCount }}</small>
    </div>

    <div v-else class="state-box success">
      ✅ {{ data }}
      <br><small>请求成功！遇到失败时自动重试了 {{ errorCount }} 次</small>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; min-height: 80px; }
.state-box { padding: 12px; border-radius: 6px; font-size: 14px; }
.loading { background: var(--vp-c-bg-soft); }
.error { background: #ffebee; color: #c62828; color: #d32f2f; }
.success { background: var(--vp-c-brand-soft); }
small { opacity: 0.7; }
</style>
