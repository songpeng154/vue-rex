<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface Setting {
  language: string
  fontSize: number
  notifications: boolean
}

const getSettings = async (): Promise<{ data: Setting }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    data: {
      language: 'zh-CN',
      fontSize: 14,
      notifications: true,
    },
  }
}

const isShow = ref(false)

// 自定义缓存：使用 localStorage 持久化数据
// 关闭页面后再打开，数据仍然存在
const SettingsComp = defineComponent(() => {
  const { data } = useApi(getSettings, {
    cacheKey: 'persisted-settings',
    getCache(cacheKey: string): Setting | null {
      const raw = localStorage.getItem(cacheKey)
      return raw ? JSON.parse(raw) : null
    },
    setCache(cacheKey: string, data: Setting): void {
      localStorage.setItem(cacheKey, JSON.stringify(data))
    },
  })
  return () => {
    if (!data.value) return h('span', '加载中...')
    const s = data.value as Setting
    return h('div', [
      h('p', `语言：${s.language}`),
      h('p', `字号：${s.fontSize}px`),
      h('p', `通知：${s.notifications ? '已开启' : '已关闭'}`),
      h('small', { style: 'color:#999;font-size:12px' }, '(数据已持久化到 localStorage)'),
    ])
  }
})
</script>

<template>
  <div>
    <p class="desc">
      自定义 getCache/setCache 将数据缓存到 localStorage。即使刷新页面或关闭重开，缓存数据仍然可用。
    </p>
    <button class="toggle-btn" @click="isShow = !isShow">
      {{ isShow ? '隐藏设置' : '显示设置' }}
    </button>
    <div v-if="isShow" class="state-box success">
      <h3>用户设置（localStorage 持久化）</h3>
      <SettingsComp />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.state-box { padding: 12px; border-radius: 6px; margin-top: 12px; }
.success { background: var(--vp-c-brand-soft); }
h3 { margin: 0 0 8px; font-size: 15px; }
p { margin: 0 0 4px; }
.toggle-btn { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
</style>
