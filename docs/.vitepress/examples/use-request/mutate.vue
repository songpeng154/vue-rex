<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface Todo {
  id: number
  text: string
  done: boolean
}

// 模拟获取 todo 列表
const getTodos = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    data: [
      { id: 1, text: '学习 Vue Rex', done: false },
      { id: 2, text: '写单元测试', done: false },
      { id: 3, text: '部署上线', done: true },
    ] as Todo[],
  }
}

const { data, mutate } = useApi(getTodos)
const newTodo = ref('')

// 直接用新数据替换 —— 无需等待接口，UI 立即更新
const addTodo = () => {
  if (!newTodo.value.trim()) return
  const newItem: Todo = { id: Date.now(), text: newTodo.value, done: false }
  mutate([...(data.value || []), newItem])
  newTodo.value = ''
}

const toggleDone = (id: number) => {
  mutate(prev =>
    prev.map(item => (item.id === id ? { ...item, done: !item.done } : item)),
  )
}

const removeTodo = (id: number) => {
  mutate(prev => prev.filter(item => item.id !== id))
}
</script>

<template>
  <div>
    <div v-if="!data" class="loading">
      ⏳ 加载中...
    </div>
    <div v-else>
      <div class="add-bar">
        <input v-model="newTodo" placeholder="新增待办" @keyup.enter="addTodo">
        <button @click="addTodo">
          添加
        </button>
      </div>
      <ul>
        <li v-for="item in data" :key="item.id" :class="{ done: item.done }">
          <span class="text" @click="toggleDone(item.id)">{{ item.text }}</span>
          <button class="del" @click="removeTodo(item.id)">
            删除
          </button>
        </li>
      </ul>
      <p class="hint">
        以上操作通过 mutate 直接修改本地数据，无需重新请求接口
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.loading { color: var(--vp-c-text-2); }
.add-bar { display: flex; gap: 8px; margin-bottom: 12px; }
.add-bar input { flex: 1; padding: 6px 12px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); }
button { background: #5e7aeb; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
ul { list-style: none; padding: 0; margin: 0; }
li { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--vp-c-divider); }
li.done .text { text-decoration: line-through; opacity: 0.5; }
.text { flex: 1; cursor: pointer; }
.del { background: #e53935; font-size: 12px; }
.hint { margin: 12px 0 0; font-size: 13px; color: var(--vp-c-text-2); }
</style>
