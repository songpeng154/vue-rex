<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟获取最新状态（如订单状态、任务进度）
const checkStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { data: `最新状态 @ ${new Date().toLocaleTimeString()}` }
}

const pollingCount = ref(0)
const isActive = ref(false)

// pollingInterval: 2000 —— 每 2 秒自动轮询一次
const { data, loading, run } = useApi(checkStatus, {
  manual: true,
  pollingInterval: 2000,
  onFinally() { if (isActive.value) pollingCount.value++ },
})
</script>

<template>
  <div>
    <p class="desc">
      轮询常用于实时获取最新状态（如任务进度、订单状态等）
    </p>
    <div v-if="data" class="box ok">
      {{ data }}
    </div>
    <div class="info">
      <span>轮询次数：{{ pollingCount }}</span>
      <span v-if="loading">⏳ 请求中...</span>
    </div>
    <div class="actions">
      <button v-if="!isActive" @click="isActive = true; run()">
        开始轮询
      </button>
      <button v-else class="stop" @click="isActive = false">
        停止轮询
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.box { padding: 10px 12px; border-radius: 6px; margin-bottom: 8px; font-size: 14px; }
.ok { background: var(--vp-c-brand-soft); }
.info { font-size: 14px; margin-bottom: 8px; display: flex; gap: 16px; }
.actions { display: flex; gap: 8px; }
button { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; }
.stop { background: #e53935; }
</style>
