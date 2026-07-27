---
outline: deep
---

# createRequest

基于 `Vue Composition API` 封装的请求 Hook 工厂函数，支持自动状态管理、防抖/节流、轮询、缓存、数据格式化等特性，适用于绝大多数异步数据请求场景。

首先调用 `createRequest` 获取一个请求工厂函数，再调用该工厂函数发起请求。

## 特性

* 响应式数据
* 自动请求/手动请求
* 节流、防抖请求
* 请求错误自动重试
* 轮询请求
* 缓存 & SWR
* 延迟/持续 loading
* 聚焦页面时自动重新请求
* 自定义插件

## 类型声明

```typescript
function createRequest<TDataKey extends string = string>(
  config?: CreateRequestConfig<TDataKey>
)
```

### CreateRequestConfig

```typescript
interface CreateRequestConfig<TDataKey extends string = string> {
  /**
   * 数据字段路径，支持点号嵌套
   * TypeScript 会自动推导 data.value 的类型为 Get<TData, TDataKey>
   *
   * @example
   * dataKey: 'data'           // 提取 res.data
   * dataKey: 'result.data'    // 提取 res.result.data
   */
  dataKey?: TDataKey

  options?: RequestOptions

  plugins?: RequestPluginImplement[]
}
```

## 返回的工厂函数

`createRequest` 返回一个 `useApi` 工厂函数：

```typescript
function useApi<
  TData = any,
  TParams extends any[] = any[],
  TSerialized = TData,
  TFormatData = TSerialized,
>(
  service: RequestServiceFn<TData, TParams>,
  options?: RequestOptions<TData, TParams, TSerialized, TFormatData>,
  plugins?: RequestPluginImplement<TData, TParams, TSerialized, TFormatData>[]
): RequestResult<TData, TParams, TSerialized, TFormatData>
```

## 使用示例

```typescript
import { createRequest } from 'norm-fetch/vue-rex'

const useApi = createRequest()

const { data, loading, run } = useApi(
  params => fetch('/api/user', params),
  { manual: true }
)
```

## 相关类型

### [RequestServiceFn](./request-service-fn)

### [RequestState](./request-state)

### [RequestMethod](./request-method)

### [RequestResult](./request-result)

### [RequestOptions](./request-options)

### [RequestContext](./request-context)

### [RequestPluginHooks](./request-plugin-hooks)

### [RequestPluginImplement](./request-plugin-implement)

## 泛型

| 名称            | 默认值     | 继承      | 可选  | 描述        |
|:--------------|:--------|:--------|:----|-----------|
| `TData`       | `any`   |         | `是` | 数据类型      |
| `TParams`     | `any[]` | `any[]` | `是` | 函数入参类型    |
| `TSerialized` | `TData` |         | `是` | 序列化后的数据类型 |
| `TFormatData` | `TSerialized` |    | `是` | 格式化数据后的类型 |

## 入参（工厂函数）

| 名称        | 类型                                                                                             | 默认值 | 可选  | 描述                                                      |
|:----------|:-----------------------------------------------------------------------------------------------|:----|-----|:--------------------------------------------------------|
| `service` | [RequestServiceFn\<TData, TParams>](./request-service-fn)                                       | -   | `否` | 异步函数 |
| `options` | [RequestOptions\<TData, TParams, TSerialized, TFormatData>](./request-options)                  | -   | `是` | 配置对象                                                    |
| `plugins` | [RequestPluginImplement\<TData, TParams, TSerialized, TFormatData>[]](./request-plugin-implement) | -   | `是` | 插件数组                                                    |

#### 返回值

[RequestResult<TData, TParams, TSerialized, TFormatData>](./request-result)
