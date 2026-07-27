---
outline: deep
---

[useGlobalConfigProvider](./home) / **GlobalConfigProvider**

# 接口：GlobalConfigProvider

[useGlobalConfigProvider](./home)的全局配置类型

## 类型声明

```typescript
export interface GlobalConfigProvider<
  // 数据
  TData = any,
  // 方法参数
  TParams extends any[] = any[],
  // 格式化数据
  TFormatData = TData,
  // 原始数据
  TRawData = any,
> {
  /**
   * 通用配置
   */
  common?: RequestOptions<TData, TParams, TFormatData, TRawData>

  /**
   * 分页配置
   */
  pagination?: PaginationOptions

  /**
   * 插件
   */
  plugins?: RequestPluginImplement<TData, TParams, TFormatData, TRawData>[]
}
```

## 泛型

| 名称            | 默认值     | 继承      | 可选  | 描述        |
|:--------------|:--------|:--------|:----|-----------|
| `TData`       | `any`   |         | `是` | 数据类型      |
| `TParams`     | `any[]` | `any[]` | `是` | 函数入参类型    |
| `TFormatData` | `TData` |         | `是` | 格式化数据后的类型 |
| `TRawData`    | `any`   |         | `是` | 原始数据类型    |

## 属性

### common

* ` 可选` - [RequestOptions<TData, TParams, TFormatData, TRawData>](../use-request/request-options)

通用配置

### pagination

* ` 可选` - [PaginationOptions](../use-pagination/pagination-options.md)

分页配置

### plugins

* ` 可选` - [RequestPluginImplement<TData, TParams, TFormatData, TRawData>[]](../use-request/request-plugin-implement)

插件
