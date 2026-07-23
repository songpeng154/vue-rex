<script setup lang="ts">
import { createPagination } from 'vue-rex'

const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
})

interface RawUser {
  id: number
  first_name: string
  last_name: string
  created_at: string
}

interface FormattedUser {
  id: number
  fullName: string
  createdAt: string
}

const getUsers = async (params: { page: number; pageSize: number }) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  const total = 20
  const list: RawUser[] = Array.from({ length: params.pageSize }, (_, i) => {
    const id = (params.page - 1) * params.pageSize + i + 1
    return {
      id,
      first_name: `名${id}`,
      last_name: `姓${id}`,
      created_at: `2025-0${(id % 9) + 1}-15T08:00:00Z`,
    }
  }).filter(u => u.id <= total)
  return { data: { list, total } }
}

// formatList：将后端原始字段转为前端展示格式，total 不受影响
const { list, loading, page, totalPage, total } = usePage(getUsers, {
  initialPageSize: 5,
  formatList: (list): FormattedUser[] =>
    list.map(item => ({
      id: item.id,
      fullName: `${item.last_name}${item.first_name}`,
      createdAt: new Date(item.created_at).toLocaleDateString('zh-CN'),
    })),
})
</script>

<template>
  <div>
    <table>
      <thead>
        <tr><th>ID</th><th>姓名</th><th>创建日期</th></tr>
      </thead>
      <tbody v-if="!loading">
        <tr v-for="user in list" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.fullName }}</td>
          <td>{{ user.createdAt }}</td>
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
    <p class="hint">formatList 将 first_name + last_name 合并为 fullName，日期格式化，total 保持原始值</p>
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
