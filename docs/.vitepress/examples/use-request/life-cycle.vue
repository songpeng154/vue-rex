<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface Order {
  id: number
  product: string
  amount: number
}

const getOrder = async (orderId: number): Promise<{ data: Order }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  if (orderId < 0) throw { msg: '无效的订单 ID', code: 400 }
  return {
    data: { id: orderId, product: 'Vue 3 高级教程', amount: 99 },
  }
}

const log = ref<string[]>([])

const { data, error, loading, run } = useApi(getOrder, {
  onBefore(params) {
    log.value.push(`[开始] 准备请求，参数：${JSON.stringify(params)}`)
  },
  onSuccess(data) {
    log.value.push(`[成功] 获取到订单，金额：￥${data.amount}`)
  },
  onError(err) {
    log.value.push(`[失败] ${err.msg || '未知错误'}`)
  },
  onFinally() {
    log.value.push(`[结束] 请求完成（无论成功或失败）`)
  },
})
</script>

<template>
  <div>
    <p class="desc">
      onBefore/onSuccess/onError/onFinally 回调覆盖请求的完整生命周期，方便添加日志、埋点和状态管理。
    </p>
    <div class="actions">
      <button :disabled="loading" @click="run(1001)">
        查询正常订单
      </button>
      <button :disabled="loading" class="btn-danger" @click="run(-1)">
        模拟错误请求
      </button>
    </div>
    <div v-if="loading" class="state-box loading">
      请求进行中...
    </div>
    <div v-else-if="error" class="state-box error">
      错误：{{ error.msg }}
    </div>
    <div v-else-if="data" class="state-box success">
      <p>订单 #{{ data.id }}：<strong>{{ data.product }}</strong>（￥{{ data.amount }}）</p>
    </div>
    <div class="log-box">
      <h4>生命周期日志</h4>
      <div v-if="log.length === 0" class="empty">
        暂无日志，点击上方按钮触发请求。
      </div>
      <div v-for="(entry, index) in log" :key="index" class="log-entry">
        {{ entry }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.actions { display: flex; gap: 8px; margin-bottom: 12px; }
.state-box { padding: 12px; border-radius: 6px; margin-bottom: 12px; font-size: 14px; }
.loading { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.error { background: #ffebee; color: #c62828; color: #d32f2f; }
.success { background: var(--vp-c-brand-soft); }
p { margin: 0; }
button { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-danger { background: #e74c3c; }
.log-box { border-top: 1px solid var(--vp-c-divider); padding-top: 12px; }
h4 { margin: 0 0 8px; font-size: 14px; }
.empty { font-size: 13px; color: var(--vp-c-text-2); }
.log-entry { font-size: 13px; padding: 4px 8px; margin-bottom: 4px; background: var(--vp-c-bg-soft); border-radius: 4px; font-family: monospace; }
.log-entry:nth-child(2) { border-left: 3px solid #5e7aeb; }
.log-entry:nth-child(3) { border-left: 3px solid #27ae60; }
.log-entry:nth-child(4) { border-left: 3px solid #e74c3c; }
.log-entry:nth-child(5) { border-left: 3px solid #f39c12; }
</style>
