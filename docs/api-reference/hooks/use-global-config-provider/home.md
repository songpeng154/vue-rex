---
outline: deep
---

# useGlobalConfigProvider

基于 [Vue 依赖注入](https://cn.vuejs.org/guide/components/provide-inject.html)
实现的[useRequest](../use-request/home.md)、[useFetch插件](../use-request/request-plugin-implement)、[usePagination](../use-pagination/home.md)
全局配置功能。

## 类型声明

```typescript
function useGlobalConfigProvider<
  TData = any,
  TParams extends any[] = any[],
  TFormatData = TData,
  TRawData = any
>(config: GlobalConfigProvider<TData, TParams, TFormatData, TRawData>): void
```

## 相关类型

### [GlobalConfigProvider](./global-config-provider)

### [RequestOptions](../use-request/request-options)

### [PaginationOptions](../use-pagination/pagination-options)

### [RequestContext](../use-request/request-context)

### [RequestPluginHooks](../use-request/request-plugin-hooks)

### [RequestPluginImplement](../use-request/request-plugin-implement)

## 泛型

| 名称            | 默认值     | 继承      | 可选  | 描述        |
|:--------------|:--------|:--------|:----|-----------|
| `TData`       | `any`   |         | `是` | 数据类型      |
| `TParams`     | `any[]` | `any[]` | `是` | 函数入参类型    |
| `TFormatData` | `TData` |         | `是` | 格式化数据后的类型 |
| `TRawData`    | `any`   |         | `是` | 原始数据类型    |

## 入参

| 名称       | 类型                                                                                      | 默认值 | 可选  | 描述   |
|:---------|:----------------------------------------------------------------------------------------|:----|-----|:-----|
| `config` | [GlobalConfigProvider<TData, TParams, TFormatData, TRawData>](./global-config-provider) | -   | `否` | 全局配置 |

#### 返回值

`void`
