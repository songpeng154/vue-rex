---
outline: deep
---

# Loading

介绍 `延迟 Loading` 和 `保持 Loading`。

## Loading Delay

当服务在极短时间内（如 `200ms` 内）完成时，立即显示加载动画会导致用户看到"一闪而过"的提示。通过设置延迟阈值，仅在操作耗时超过阈值时显示加载状态，可显著减少界面抖动。

通过设置 `loadingDelay`，可以延迟 `loading` 变成 `true` 的时间，有效防止闪烁。

```typescript
const useApi = createRequest({ dataKey: 'data' })

const { loading } = useApi(service, {
  loadingDelay: 300, // 300ms 后才显示 loading
})
```

::: demo
use-request/loading-delay
:::

## Loading Keep

`loadingKeep` 用于保持加载状态，避免 `loading` 出现闪烁。

`loading` 保持规则：
- 当请求时间少于 `loadingKeep`，则 `loading` 的最终时间为 `loadingKeep`
- 当请求时间大于 `loadingKeep`，则 `loading` 的最终时间为请求的时间

下面的示例中接口请求是 `200ms`，保持时间为 `600ms`，Loading 最终会在 `600ms` 后关闭。

::: demo
use-request/loading-keep
:::

## 组合使用

实际项目中，`loadingDelay` 和 `loadingKeep` 通常会搭配使用：用 `loadingDelay` 避免正常快速请求闪烁，用 `loadingKeep` 确保加载状态有足够的视觉反馈。

```typescript
const { loading } = useApi(service, {
  loadingDelay: 200, // 200ms 内完成的请求不显示 loading
  loadingKeep: 500, // loading 至少显示 500ms
})
```

效果：请求发起后，先等 200ms——如果请求在这之前完成，loading 从不显示；如果请求超过 200ms，loading 显示出来且至少持续 500ms，不会一闪而过。

## API

| 属性 | 类型 | 默认值 | 描述 |
|:---|:---|:---|:---|
| `loadingDelay` | `MaybeRef<number>` | - | 指定 loading 的延时打开时间 (毫秒) |
| `loadingKeep` | `MaybeRef<number>` | - | 指定 loading 的持续时间 (毫秒) |
