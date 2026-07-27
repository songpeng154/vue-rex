<script setup lang="ts">
import { computed } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface User {
  id: number
  name: string
}

interface Order {
  orderId: number
  product: string
  amount: number
}

// 请求 A：获取用户信息
const getUsers = async (): Promise<{ data: User[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    data: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ],
  }
}

// 请求 B：需要先拿到用户 ID 才能查询
const getUserOrders = async (userId: number): Promise<{ data: Order[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    data: [
      { orderId: 1001, product: 'Vue 3 高级教程', amount: 99 },
      { orderId: 1002, product: 'TypeScript 从入门到精通', amount: 79 },
    ],
  }
}

const { data: users, loading: loadingUsers } = useApi(getUsers)
const ready = computed(() => !!users.value && users.value.length > 0)

// ready: 只有 users 加载完成后才发起
// watchSource: 监听 users 变化后自动执行
const { data: orders, loading: loadingOrders } = useApi(() => getUserOrders(users.value![0].id), {
  ready,
  watchSource: users,
})
</script>

<template>
  <div>
    <p class="desc">
      ready + watchSource 实现请求依赖：B 请求依赖 A 的数据，A 完成后再自动发起 B。
    </p>
    <div class="row">
      <div class="col">
        <h4>请求 A：用户列表</h4>
        <div v-if="loadingUsers" class="state-box loading">
          加载用户中...
        </div>
        <div v-else-if="users" class="state-box success">
          <p v-for="u in users" :key="u.id">
            {{ u.name }}（ID: {{ u.id }}）
          </p>
        </div>
      </div>
      <div class="col">
        <h4>请求 B：订单（依赖 A）</h4>
        <div v-if="!ready" class="state-box loading">
          等待用户数据就绪...
        </div>
        <div v-else-if="loadingOrders" class="state-box loading">
          加载订单中...
        </div>
        <div v-else-if="orders" class="state-box success">
          <p v-for="o in orders" :key="o.orderId">
            {{ o.product }} - ￥{{ o.amount }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.row { display: flex; gap: 16px; }
.col { flex: 1; }
h4 { margin: 0 0 8px; font-size: 14px; }
.state-box { padding: 12px; border-radius: 6px; font-size: 14px; }
.loading { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.success { background: var(--vp-c-brand-soft); }
p { margin: 0 0 4px; }
</style>
