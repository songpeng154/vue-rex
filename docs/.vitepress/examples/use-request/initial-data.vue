<script setup lang="ts">
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface UserProfile {
  name: string
  role: string
  department: string
}

const getProfile = async (userId: number): Promise<{ data: UserProfile }> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return {
    data: {
      name: '张三',
      role: '前端工程师',
      department: '技术部',
    },
  }
}

// 设置 initialData，在请求完成前先用默认数据占位
// 避免页面空白或"未定义"闪烁
const { data, loading } = useApi(() => getProfile(1), {
  initialData: { name: '---', role: '加载中...', department: '---' },
})
</script>

<template>
  <div>
    <p class="desc">
      initialData 提供初始占位数据。在请求完成前，页面不会显示空白或报错，用户体验更流畅。
    </p>
    <div class="state-box" :class="loading ? 'loading' : 'success'">
      <div class="avatar">
        {{ data!.name.charAt(0) }}
      </div>
      <div class="info">
        <p class="name">
          {{ data!.name }}
        </p>
        <p class="meta">
          {{ data!.role }} | {{ data!.department }}
        </p>
        <p v-if="loading" class="hint">
          正在加载真实数据...
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.state-box { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 8px; }
.loading { background: var(--vp-c-bg-soft); }
.success { background: var(--vp-c-brand-soft); }
.avatar { width: 48px; height: 48px; border-radius: 50%; background: #5e7aeb; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; flex-shrink: 0; }
.info { }
.name { margin: 0; font-size: 16px; font-weight: bold; }
.meta { margin: 4px 0 0; font-size: 14px; color: var(--vp-c-text-2); }
.hint { margin: 4px 0 0; font-size: 12px; color: #999; }
</style>
