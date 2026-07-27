<script setup lang="ts">
import { createPagination } from 'vue-rex'

// 1. 创建分页实例，配置 listKey 和 totalKey
const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
})

interface User {
  id: number
  name: string
  age: number
  city: string
}

// 2. service 接收 { page, pageSize }，返回后端响应格式
const getUsers = async (params: { page: number, pageSize: number }) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const total = 50
  const list: User[] = Array.from({ length: params.pageSize }, (_, i) => {
    const id = (params.page - 1) * params.pageSize + i + 1
    return { id, name: `用户 ${id}`, age: 20 + (id % 15), city: `城市 ${id}` }
  }).filter(u => u.id <= total)
  return { data: { list, total } }
}

// 3. 调用 usePage，自动管理 page/pageSize/loading/list/total 等状态
const { list, loading, page, pageSize, total, totalPage } = usePage(getUsers)
</script>

<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>姓名</th><th>年龄</th><th>城市</th>
        </tr>
      </thead>
      <tbody v-if="!loading">
        <tr v-for="user in list" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.age }}</td>
          <td>{{ user.city }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading-row">
      ⏳ 加载中...
    </div>

    <div class="pager">
      <span>第 {{ page }} / {{ totalPage }} 页，共 {{ total }} 条</span>
      <div class="btns">
        <button :disabled="page === 1" @click="page--">
          上一页
        </button>
        <button :disabled="page >= totalPage" @click="page++">
          下一页
        </button>
        <select :value="pageSize" @change="pageSize = Number(($event.target as HTMLSelectElement).value)">
          <option :value="5">
            5条/页
          </option>
          <option :value="10">
            10条/页
          </option>
          <option :value="20">
            20条/页
          </option>
        </select>
      </div>
    </div>
    <p class="hint">
      修改 page / pageSize 会自动触发请求，无需手动处理
    </p>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 14px; }
th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid var(--vp-c-divider); }
th { font-weight: 600; }
.loading-row { text-align: center; padding: 20px; color: var(--vp-c-text-2); }
.pager { display: flex; justify-content: space-between; align-items: center; font-size: 14px; flex-wrap: wrap; gap: 8px; }
.btns { display: flex; gap: 6px; align-items: center; }
button { background: #5e7aeb; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
select { padding: 4px 8px; border-radius: 4px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); }
.hint { font-size: 13px; color: var(--vp-c-text-2); margin: 8px 0 0; }
</style>
