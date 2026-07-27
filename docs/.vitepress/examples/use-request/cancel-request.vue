<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface User {
  id: number
  name: string
  email: string
}

const getUsers = async (): Promise<{ data: User[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    data: [
      { id: 1, name: '张三', email: 'zhangsan@example.com' },
      { id: 2, name: '李四', email: 'lisi@example.com' },
    ],
  }
}

const { data, run, loading, cancel } = useApi(getUsers, { manual: true })
const canceled = ref(false)

const handleCancel = () => {
  canceled.value = true
  cancel()
}
</script>

<template>
  <div>
    <p class="desc">
      点击"请求"发起请求后，可以在请求完成前随时取消。适用于用户导航离开或重复提交等场景。
    </p>
    <div v-if="loading" class="state-box loading">
      正在加载用户数据...（3 秒延迟）
    </div>
    <div v-else-if="canceled" class="state-box error">
      请求已被用户取消。
    </div>
    <div v-else-if="data" class="state-box success">
      <h3>用户列表</h3>
      <ul>
        <li v-for="user in data" :key="user.id">
          <strong>{{ user.name }}</strong>
          <span class="email">{{ user.email }}</span>
        </li>
      </ul>
    </div>
    <div v-else class="state-box loading">
      暂无数据，请点击下方按钮发起请求。
    </div>
    <div class="actions">
      <button :disabled="loading" @click="run()">
        请求
      </button>
      <button :disabled="!loading" class="btn-danger" @click="handleCancel">
        取消请求
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.state-box { padding: 12px; border-radius: 6px; margin-bottom: 12px; }
.loading { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.error { background: #ffebee; color: #c62828; color: #d32f2f; }
.success { background: var(--vp-c-brand-soft); }
h3 { margin: 0 0 8px; font-size: 15px; }
ul { margin: 0; padding-left: 20px; }
li { margin-bottom: 4px; }
.email { color: var(--vp-c-text-2); margin-left: 8px; font-size: 13px; }
.actions { display: flex; gap: 8px; }
button { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-danger { background: #e74c3c; }
</style>
