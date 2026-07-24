<script setup lang="ts">
import { ref } from 'vue'
import { createPagination } from 'vue-rex'

const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
})

interface User {
  id: number
  name: string
  status: string
}

// 模拟后端：支持 keyword 搜索 + 分页
const getUsers = async (params: { page: number; pageSize: number; keyword?: string }) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  const all: User[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `用户 ${i + 1}`,
    status: i % 3 === 0 ? '禁用' : '正常',
  }))
  const filtered = params.keyword
    ? all.filter(u => u.name.includes(params.keyword!))
    : all
  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return { data: { list, total } }
}

const searchParams = ref({ page: 1, pageSize: 5, keyword: '' })

const { list, loading, page, pageSize, total, totalPage, search } = usePage(getUsers, {
  params: searchParams,
})

// 搜索：提交表单条件 + page 归 1 + 发请求
const onSearch = () => search()

// 重置：清空关键词 + 重新搜索
const onReset = () => {
  searchParams.value.keyword = ''
  search()
}
</script>

<template>
  <div>
    <div class="search-bar">
      <input v-model="searchParams.keyword" placeholder="搜索用户名" @keyup.enter="onSearch" />
      <button class="primary" @click="onSearch">搜索</button>
      <button @click="onReset">重置</button>
    </div>

    <table>
      <thead>
        <tr><th>ID</th><th>姓名</th><th>状态</th></tr>
      </thead>
      <tbody v-if="!loading">
        <tr v-for="user in list" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td :class="user.status === '禁用' ? 'disabled' : 'active'">{{ user.status }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading-row">⏳ 加载中...</div>

    <div class="pager">
      <span>第 {{ page }} / {{ totalPage }} 页，共 {{ total }} 条</span>
      <div class="btns">
        <button :disabled="page === 1" @click="page--">上一页</button>
        <button :disabled="page >= totalPage" @click="page++">下一页</button>
      </div>
    </div>
    <p class="hint">search() 提交表单搜索条件并自动回到第一页，翻页时保留已提交的搜索条件</p>
  </div>
</template>

<style lang="scss" scoped>
.search-bar { display: flex; gap: 8px; margin-bottom: 12px; }
input { flex: 1; padding: 6px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); font-size: 14px; }
button { padding: 6px 14px; border: 1px solid var(--vp-c-divider); border-radius: 4px; cursor: pointer; background: var(--vp-c-bg-soft); font-size: 14px; }
button.primary { background: #5e7aeb; color: #fff; border-color: #5e7aeb; }
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 14px; }
th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid var(--vp-c-divider); }
th { font-weight: 600; }
.loading-row { text-align: center; padding: 20px; color: var(--vp-c-text-2); }
.pager { display: flex; justify-content: space-between; align-items: center; font-size: 14px; flex-wrap: wrap; gap: 8px; }
.btns { display: flex; gap: 6px; align-items: center; }
.btns button { background: #5e7aeb; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; }
.btns button:disabled { opacity: 0.4; cursor: not-allowed; }
.active { color: #0da608; }
.disabled { color: #e05252; }
.hint { font-size: 13px; color: var(--vp-c-text-2); margin: 8px 0 0; }
</style>
