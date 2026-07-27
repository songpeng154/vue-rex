<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface Notification {
  id: number
  message: string
  time: string
}

let counter = 0

const getNotifications = async (): Promise<{ data: Notification[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  counter++
  return {
    data: [
      { id: counter, message: `你有 ${counter} 条新消息`, time: new Date().toLocaleTimeString() },
      { id: counter + 10, message: '系统运行正常', time: new Date().toLocaleTimeString() },
    ],
  }
}

const focusCount = ref(0)

const { data, loading } = useApi(getNotifications, {
  refreshOnWindowFocus: true,
  onSuccess() {
    focusCount.value++
  },
})
</script>

<template>
  <div>
    <p class="desc">
      refreshOnWindowFocus: true 会在浏览器标签页重新获得焦点时自动刷新数据。适合需要保持最新状态的通知类场景。
    </p>
    <div v-if="loading" class="state-box loading">
      正在加载...
    </div>
    <div v-else-if="data" class="state-box success">
      <h3>消息列表</h3>
      <ul>
        <li v-for="item in data" :key="item.id" class="msg-item">
          <span>{{ item.message }}</span>
          <span class="time">{{ item.time }}</span>
        </li>
      </ul>
    </div>
    <div class="hint">
      已自动刷新 {{ focusCount }} 次。切换到其他标签页再切回来试试。
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.state-box { padding: 12px; border-radius: 6px; margin-bottom: 12px; }
.loading { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.success { background: var(--vp-c-brand-soft); }
h3 { margin: 0 0 8px; font-size: 15px; }
ul { margin: 0; padding-left: 0; list-style: none; }
.msg-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--vp-c-divider); font-size: 14px; }
.msg-item:last-child { border-bottom: none; }
.time { color: var(--vp-c-text-2); font-size: 12px; }
.hint { font-size: 13px; color: var(--vp-c-text-2); padding: 8px; background: var(--vp-c-bg-soft); border-radius: 4px; }
</style>
