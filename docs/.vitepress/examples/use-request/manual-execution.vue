<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface User {
  id: number
  name: string
  email: string
}

// service 接收查询参数，模拟搜索接口
const searchUsers = async (keyword: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // 模拟后端根据 keyword 过滤
  const allUsers: User[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' },
  ]
  const filtered = allUsers.filter(u => !keyword || u.name.includes(keyword))
  return { data: filtered }
}

// manual: true —— 初始化时不自动请求，需要手动调用 run
const { data, loading, run } = useApi(searchUsers, { manual: true })

const keyword = ref('')
const handleSearch = () => {
  run(keyword.value)
}
</script>

<template>
  <div>
    <div class="search-bar">
      <input
        v-model="keyword"
        placeholder="输入姓名搜索"
        @keyup.enter="handleSearch"
      >
      <button @click="handleSearch">
        搜索
      </button>
    </div>
    <p class="hint">
      可查询：张三、李四、王五
    </p>

    <div v-if="loading" class="state-box loading">
      ⏳ 搜索中...
    </div>

    <div v-else-if="data" class="state-box success">
      <template v-if="data.length">
        <ul>
          <li v-for="user in data" :key="user.id">
            <strong>{{ user.name }}</strong> — {{ user.email }}
          </li>
        </ul>
      </template>
      <template v-else>
        <p class="empty">
          未找到匹配用户
        </p>
      </template>
    </div>

    <div v-else class="state-box hint">
      点击"搜索"按钮发起请求（manual: true 不会自动执行）
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; min-height: 100px; }
.search-bar { display: flex; gap: 8px; margin-bottom: 12px; }
input { flex: 1; padding: 6px 12px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); }
button { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; }
.state-box { padding: 12px; border-radius: 6px; }
.loading { background: var(--vp-c-bg-soft); }
.success { background: var(--vp-c-brand-soft); }
.hint { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); font-size: 14px; }
p.hint { background: transparent; font-size: 12px; color: var(--vp-c-text-3); padding: 0; margin: 4px 0 0; }
.empty { color: var(--vp-c-text-2); }
ul { margin: 0; padding-left: 20px; }
li { margin-bottom: 4px; }
</style>
