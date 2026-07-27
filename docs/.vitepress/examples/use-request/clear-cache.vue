<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { clearCache, createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface User {
  id: number
  name: string
}

const getUsers = async (): Promise<{ data: User[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    data: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ],
  }
}

const isShow = ref(false)

const UserListComp = defineComponent(() => {
  const { data } = useApi(getUsers, {
    cacheKey: 'clearable-users',
  })
  return () => {
    if (!data.value) return h('span', '加载中...')
    return h('ul', { style: 'margin:0;padding-left:20px' }, (data.value as User[]).map(user =>
      h('li', { style: 'margin-bottom:4px' }, `${user.id}. ${user.name}`),
    ))
  }
})
</script>

<template>
  <div>
    <p class="desc">
      通过 clearCache 手动清除指定缓存。清除后再次显示组件时数据需要重新加载。
    </p>
    <div class="actions">
      <button class="toggle-btn" @click="isShow = !isShow">
        {{ isShow ? '隐藏组件' : '显示组件' }}
      </button>
      <button class="clear-btn" @click="clearCache('clearable-users')">
        清除缓存
      </button>
    </div>
    <div v-if="isShow" class="state-box success">
      <h3>用户列表</h3>
      <UserListComp />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.state-box { padding: 12px; border-radius: 6px; margin-top: 12px; }
.success { background: var(--vp-c-brand-soft); }
h3 { margin: 0 0 8px; font-size: 15px; }
.actions { display: flex; gap: 8px; }
.toggle-btn, .clear-btn { color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.toggle-btn { background: #5e7aeb; }
.clear-btn { background: #e74c3c; }
</style>
