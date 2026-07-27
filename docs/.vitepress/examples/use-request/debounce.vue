<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟搜索接口
const searchUsers = async (keyword: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const all = ['张三', '李四', '王五', '张伟', '李娜']
  const result = all.filter(n => n.includes(keyword || ''))
  return { data: result }
}

const keyword = ref('')
const requestCount = ref(0)

// debounceWait: 300ms —— 用户停止输入 300ms 后才发起请求
// debounceRun —— 带防抖的 run，高频调用只会执行最后一次
const { data, debounceRun } = useApi(searchUsers, {
  debounceWait: 300,
  onSuccess() { requestCount.value++ },
})
</script>

<template>
  <div>
    <p class="desc">
      输入内容后停止 300ms 才真正发起请求，避免每次按键都请求
    </p>
    <input
      v-model="keyword"
      placeholder="输入姓名，停止输入后自动搜索"
      @input="debounceRun(keyword)"
    >
    <p class="hint">
      可查询：张三、李四、王五、张伟、李娜
    </p>
    <div class="info">
      <span>实际请求次数：<strong>{{ requestCount }}</strong></span>
      <span v-if="data">结果：{{ data.join('、') }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 8px; }
input { width: 100%; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); box-sizing: border-box; }
.hint { font-size: 12px; color: var(--vp-c-text-3); margin: 4px 0 0; }
.info { margin-top: 10px; font-size: 14px; display: flex; flex-direction: column; gap: 4px; }
</style>
