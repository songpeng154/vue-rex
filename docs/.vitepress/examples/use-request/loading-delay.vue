<script setup lang="ts">
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟快速响应的接口（200ms）
const getFastData = async () => {
  const now = Date.now()
  await new Promise(resolve => setTimeout(resolve, 200))
  return { data: now }
}

// 无 delay：请求 200ms，loading 一闪而过
const { data: data1, loading: loading1, run: run1 } = useApi(getFastData)

// 设置 loadingDelay: 300ms —— 如果请求在 300ms 内完成，就不显示 loading
const { data: data2, loading: loading2, run: run2 } = useApi(getFastData, {
  loadingDelay: 300,
})

const run = () => {
  run1()
  run2()
}
</script>

<template>
  <div>
    <p class="desc">
      接口仅需 200ms，左边 loading 一闪而过，右边设置了 300ms 延迟就不会闪
    </p>
    <div class="compare">
      <div class="col">
        <h4>无延迟</h4>
        <div class="box" :class="[loading1 ? 'loading' : 'ok']">
          {{ loading1 ? '⚡ 闪烁中...' : `✅ ${data1}` }}
        </div>
      </div>
      <div class="col">
        <h4>delay = 300ms</h4>
        <div class="box" :class="[loading2 ? 'loading' : 'ok']">
          {{ loading2 ? '等待中...' : `✅ ${data2}` }}
        </div>
      </div>
    </div>
    <button @click="run">
      重新执行
    </button>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.compare { display: flex; gap: 12px; margin-bottom: 12px; }
.col { flex: 1; }
h4 { margin: 0 0 6px; font-size: 14px; }
.box { padding: 12px; border-radius: 6px; font-size: 13px; min-height: 40px; word-break: break-all; }
.loading { background: var(--vp-c-bg-soft); }
.ok { background: var(--vp-c-brand-soft); }
button { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; }
</style>
