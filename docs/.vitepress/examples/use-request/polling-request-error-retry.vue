<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟一个不稳定服务，总返回 500 错误
const getUnstableStatus = async (): Promise<{ data: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  throw { msg: '服务暂时不可用', code: 500 }
}

const retryCount = ref(0)

const { error, loading } = useApi(getUnstableStatus, {
  pollingInterval: 1500, // 每 1.5 秒轮询一次
  pollingErrorRetryCount: 3, // 失败后最多重试 3 次
  onError() {
    retryCount.value += 1
  },
})
</script>

<template>
  <div>
    <p class="desc">
      pollingInterval + pollingErrorRetryCount：请求失败后自动重试，重试达到上限后停止轮询，避免无效请求浪费资源。
    </p>
    <div class="state-box" :class="loading ? 'loading' : 'error'">
      <div class="status-icon">
        {{ loading ? '...' : '!' }}
      </div>
      <div class="status-info">
        <p class="status-title">
          {{ loading ? '正在轮询...' : '轮询已停止' }}
        </p>
        <p v-if="error" class="status-desc">
          {{ error.msg }}（错误码：{{ error.code }}）
        </p>
        <p class="status-detail">
          已重试次数：<strong>{{ retryCount }}</strong> / 3
        </p>
        <p v-if="!loading" class="status-hint">
          已达到最大重试次数，停止自动轮询。
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.state-box { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 8px; }
.loading { background: var(--vp-c-bg-soft); }
.error { background: #ffebee; color: #c62828; }
.status-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; flex-shrink: 0; }
.loading .status-icon { background: #ccc; color: #666; }
.error .status-icon { background: #e74c3c; color: #fff; }
.status-title { margin: 0; font-size: 15px; font-weight: bold; }
.status-desc { margin: 4px 0 0; font-size: 13px; color: #d32f2f; }
.status-detail { margin: 4px 0 0; font-size: 13px; color: var(--vp-c-text-2); }
.status-hint { margin: 4px 0 0; font-size: 12px; color: #999; }
</style>
