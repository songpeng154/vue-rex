<script setup lang="ts">
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟点赞/取消点赞接口
const toggleLike = async (shouldLike: boolean) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // 模拟：传入 number 时报错，演示请求失败自动回滚
  if (typeof shouldLike === 'number') throw new Error('请求失败')
  return { data: shouldLike }
}

// optimisticUpdate：先立即更新 UI，背后发请求，失败则回滚
const { data, loading, optimisticUpdate } = useApi(toggleLike, {
  manual: true,
  initialData: false,
})
</script>

<template>
  <div>
    <div class="like-area">
      <span class="status">
        {{ loading ? '⏳ 提交中...' : data ? '❤️ 已点赞' : '🤍 未点赞' }}
      </span>
    </div>
    <div class="actions">
      <button @click="optimisticUpdate(true, [true])">
        点赞（模拟成功）
      </button>
      <button class="fail" @click="optimisticUpdate(true, [1])">
        点赞（模拟失败，自动回滚）
      </button>
    </div>
    <p class="hint">
      第二个按钮传入错误类型，请求失败后 UI 自动回滚到之前的状态
    </p>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.like-area { margin-bottom: 12px; }
.status { font-size: 18px; }
.actions { display: flex; gap: 8px; margin-bottom: 8px; }
button { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; }
.fail { background: #e53935; }
.hint { font-size: 13px; color: var(--vp-c-text-2); margin: 0; }
</style>
