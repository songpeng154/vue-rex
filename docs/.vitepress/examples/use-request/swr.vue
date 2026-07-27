<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface Todo {
  id: number
  title: string
  completed: boolean
}

const getTodos = async (): Promise<{ data: Todo[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return {
    data: [
      { id: 1, title: '学习 Vue 3', completed: true },
      { id: 2, title: '学习 vue-rex', completed: false },
      { id: 3, title: '编写文档', completed: false },
    ],
  }
}

const isShow = ref(false)

// 使用 defineComponent 模拟另一个组件，共享 cacheKey 实现 SWR
const TodoListComp = defineComponent(() => {
  const { data } = useApi(getTodos, {
    cacheKey: 'swr-todos',
  })
  return () => {
    if (!data.value) return h('span', '加载中...')
    return h('ul', { style: 'margin:0;padding-left:20px' }, (data.value as Todo[]).map(todo =>
      h('li', { style: `margin-bottom:4px;${todo.completed ? 'text-decoration:line-through;color:#999' : ''}` }, todo.title,
      ),
    ))
  }
})
</script>

<template>
  <div>
    <p class="desc">
      首次加载后数据被缓存。再次显示组件时，先立即展示缓存数据（stale），同时在后台重新请求（revalidate），实现极速切换体验。
    </p>
    <button class="toggle-btn" @click="isShow = !isShow">
      {{ isShow ? '隐藏组件' : '显示组件' }}
    </button>
    <div v-if="isShow" class="state-box success">
      <h3>待办列表（SWR 模式）</h3>
      <TodoListComp />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.state-box { padding: 12px; border-radius: 6px; margin-top: 12px; }
.success { background: var(--vp-c-brand-soft); }
h3 { margin: 0 0 8px; font-size: 15px; }
.toggle-btn { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
</style>
