<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface FrameworkInfo {
  name: string
  libs: string[]
}

const getFrameworkLibs = async (type: 'vue' | 'react' | 'angular'): Promise<{ data: FrameworkInfo }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const map: Record<string, FrameworkInfo> = {
    vue: { name: 'Vue 生态', libs: ['vue', 'vue-router', 'pinia', 'nuxt'] },
    react: { name: 'React 生态', libs: ['react', 'react-router', 'redux', 'next'] },
    angular: { name: 'Angular 生态', libs: ['angular', 'rxjs', 'ngrx'] },
  }
  return { data: map[type] }
}

const type = ref<'vue' | 'react' | 'angular'>('vue')

// watchSource: true 自动收集 reactive 依赖
// 当 type 变化时自动重新请求，无需手动调用 run
const { data, loading } = useApi(() => getFrameworkLibs(type.value), {
  watchSource: true,
})
</script>

<template>
  <div>
    <p class="desc">
      开启 watchSource: true，当响应式依赖（如 type）变化时自动重新请求，无需手动监听和调用 run。
    </p>
    <div class="radio-group">
      <label :class="{ active: type === 'vue' }">
        <input v-model="type" type="radio" value="vue">
        Vue
      </label>
      <label :class="{ active: type === 'react' }">
        <input v-model="type" type="radio" value="react">
        React
      </label>
      <label :class="{ active: type === 'angular' }">
        <input v-model="type" type="radio" value="angular">
        Angular
      </label>
    </div>
    <div v-if="loading" class="state-box loading">
      正在加载 {{ type }} 生态库列表...
    </div>
    <div v-else-if="data" class="state-box success">
      <h3>{{ data.name }}</h3>
      <ul>
        <li v-for="lib in data.libs" :key="lib">
          {{ lib }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.radio-group { display: flex; gap: 8px; margin-bottom: 12px; }
.radio-group label { padding: 6px 16px; border: 1px solid var(--vp-c-divider); border-radius: 4px; cursor: pointer; font-size: 14px; }
.radio-group label.active { background: #5e7aeb; color: #fff; border-color: #5e7aeb; }
.radio-group input { display: none; }
.state-box { padding: 12px; border-radius: 6px; }
.loading { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.success { background: var(--vp-c-brand-soft); }
h3 { margin: 0 0 8px; font-size: 15px; }
ul { margin: 0; padding-left: 20px; }
li { margin-bottom: 4px; }
</style>
