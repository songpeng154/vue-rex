<script setup lang="ts">
import { createPagination } from 'vue-rex'

// 后端分页字段名是 current / size，通过 paginationFields 映射
const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
  paginationFields: { page: 'current', pageSize: 'size' },
})

interface User {
  id: number
  name: string
  age: number
}

// service 收到的 params 里是 current / size，不是 page / pageSize
const getUsers = async (params: { current: number; size: number }) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  const total = 30
  const list: User[] = Array.from({ length: params.size }, (_, i) => {
    const id = (params.current - 1) * params.size + i + 1
    return { id, name: `用户 ${id}`, age: 20 + (id % 15) }
  }).filter(u => u.id <= total)
  return { data: { list, total } }
}

const { list, loading, page, pageSize, total, totalPage } = usePage(getUsers)
</script>

<template>
  <div>
    <table>
      <thead>
        <tr><th>ID</th><th>姓名</th><th>年龄</th></tr>
      </thead>
      <tbody v-if="!loading">
        <tr v-for="user in list" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.age }}</td>
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
    <p class="hint">paginationFields: { page: 'current', pageSize: 'size' }，内部 page ref 自动映射为 current 传给 service</p>
  </div>
</template>

<style lang="scss" scoped>
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 14px; }
th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid var(--vp-c-divider); }
th { font-weight: 600; }
.loading-row { text-align: center; padding: 20px; color: var(--vp-c-text-2); }
.pager { display: flex; justify-content: space-between; align-items: center; font-size: 14px; flex-wrap: wrap; gap: 8px; }
.btns { display: flex; gap: 6px; align-items: center; }
button { background: #5e7aeb; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
.hint { font-size: 13px; color: var(--vp-c-text-2); margin: 8px 0 0; }
</style>
