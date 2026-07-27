<script setup lang="ts">
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟快速接口（200ms）
const getFastData = async () => {
  const now = Date.now()
  await new Promise(resolve => setTimeout(resolve, 200))
  return { data: now }
}

// 无 keep：接口 200ms，loading 只持续 200ms
const { data: data1, loading: loading1, run: run1 } = useApi(getFastData)

// loadingKeep: 600ms —— loading 至少持续 600ms
const { data: data2, loading: loading2, run: run2 } = useApi(getFastData, {
  loadingKeep: 600,
})

const run = () => { run1(); run2() }
</script>

<template>
  <div>
    <p class="desc">
      接口 200ms 就完成了，左边 loading 瞬间消失。右边设置 keep=600ms，可以给用户足够的反馈时间
    </p>
    <div class="compare">
      <div class="col">
        <h4>无 keep</h4>
        <div class="box" :class="[loading1 ? 'loading' : 'ok']">
          {{ loading1 ? '⚡ 一闪而过' : `✅ ${data1}` }}
        </div>
      </div>
      <div class="col">
        <h4>keep = 600ms</h4>
        <div class="box" :class="[loading2 ? 'loading' : 'ok']">
          {{ loading2 ? '⏳ 加载中...' : `✅ ${data2}` }}
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
