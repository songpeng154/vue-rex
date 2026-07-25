---
outline: deep
---

[createRequest](./home) / **RequestMethod**

# 接口：RequestMethod

`RequestMethod` 是 [createRequest](./home.md) 返回的方法类型。

## 类型声明

```typescript
import type { DebouncedFunction } from 'es-toolkit'

export interface RequestMethod<
  // 数据
  TData = any,
  // 方法参数
  TParams extends any[] = any[],
  TSerialized = TData,
  // 格式化数据
  TFormatData = TSerialized,
> {
  /**
   * 手动触发 service 执行（静默模式）。异常通过 onError 反馈，不抛出异常。
   */
  run: (...args: TParams) => Promise<void>

  /**
   * 手动触发 service 执行（Promise 模式）。请求失败时抛出异常，支持 try/catch 捕获。
   */
  runAsync: (...args: TParams) => Promise<TFormatData>

  /**
   * 与 run 用法一致，带防抖
   */
  debounceRun: DebouncedFunction<
    (...args: TParams) => Promise<void>
  >

  /**
   * 与 run 用法一致，带节流
   */
  throttleRun: DebouncedFunction<
    (...args: TParams) => Promise<void>
  >

  /**
   * 使用上次的 params，重新调用 run
   */
  refresh: () => Promise<void>

  /**
   * 使用上次的 params，重新调用 runAsync
   */
  refreshAsync: () => Promise<TFormatData>

  /**
   * 手动取消当前正在进行中的请求（伪取消）
   */
  cancel: () => void

  /**
   * 突变，立即更改 data 数据
   */
  mutate: (newData: TFormatData | ((oldData: TFormatData) => TFormatData)) => void

  /**
   * 乐观更新，立即更改 data 数据并在背后发起请求
   * 如果请求失败，自动还原到更新之前的数据
   */
  optimisticUpdate: (newData: TFormatData | ((oldData: TFormatData) => TFormatData), params?: TParams) => void
}
```

## 泛型

| 名称            | 默认值     | 继承      | 可选  | 描述        |
|:--------------|:--------|:--------|:----|-----------|
| `TData`       | `any`   |         | `是` | 数据类型      |
| `TParams`     | `any[]` | `any[]` | `是` | 函数入参类型    |
| `TSerialized` | `TData` |         | `是` | 序列化后的数据类型 |
| `TFormatData` | `TSerialized` |    | `是` | 格式化数据后的类型 |

## 方法

### run

手动触发 [service](request-service-fn) 执行（静默模式），参数会传递给 [service](request-service-fn)。
异常仅通过 [onError](./request-options#onError) 反馈，内部不会抛出 Promise 异常。

#### 入参

| 名称        | 类型        | 默认值 | 描述   |
|:----------|:----------|:----|:-----|
| `...args` | `TParams` |     | 请求参数 |

#### 返回值

`Promise<void>`

### runAsync

手动触发 [service](request-service-fn) 执行（Promise 模式）。
请求失败时会抛出异常，可使用 `try...catch` 或 `runAsync().catch()` 进行捕获并获取返回值。

#### 入参

| 名称        | 类型        | 默认值 | 描述   |
|:----------|:----------|:----|:-----|
| `...args` | `TParams` |     | 请求参数 |

#### 返回值

`Promise<TFormatData>`

### debounceRun

与 [run](#run) 用法一致，带防抖功能

#### 入参

| 名称        | 类型        | 默认值 | 描述   |
|:----------|:----------|:----|:-----|
| `...args` | `TParams` |     | 请求参数 |

#### 返回值

`Promise<void>`

### throttleRun

与 [run](#run) 用法一致，带节流功能

#### 入参

| 名称        | 类型        | 默认值 | 描述   |
|:----------|:----------|:----|:-----|
| `...args` | `TParams` |     | 请求参数 |

#### 返回值

`Promise<void>`

### refresh

使用上次的 `params`，重新调用 `run`（静默模式）

#### 返回值

`Promise<void>`

### refreshAsync

使用上次的 `params`，重新调用 `runAsync`（Promise 模式）

#### 返回值

`Promise<TFormatData>`

### cancel

手动取消当前正在进行中的请求（伪取消）。

已发出的请求后台仍会接收到，该方法只是取消了 `data` 的赋值以及 `loading` 重置为 `false`。

#### 返回值

`void`

### mutate

突变，立即更改 `data` 数据。

#### 入参

| 名称        | 类型                                                      | 默认值 | 描述  |
|:----------|:--------------------------------------------------------|:----|:----|
| `newData` | `TFormatData \| ((oldData: TFormatData) => TFormatData)` |     | 新数据 |

#### 返回值

`void`

### optimisticUpdate

乐观更新，立即更改 `data` 数据，并且自动在背后发起请求。

如果请求失败，自动还原到更新之前的数据。

#### 入参

| 名称        | 类型                                                      | 默认值 | 描述  |
|:----------|:--------------------------------------------------------|:----|:----|
| `newData` | `TFormatData \| ((oldData: TFormatData) => TFormatData)` |     | 新数据 |
| `params`  | `TParams`                                               | 可选 | 入参  |

#### 返回值

`void`
