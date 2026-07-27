<p align="center">
<img width="200"  alt="Image" src="https://github.com/user-attachments/assets/f4544492-14dd-4873-a460-b84b46664087" />
</p>
<h1 align="center">
<b>Vue Rex</b>
<br>
<b>让请求更简单</b>
</h1>
<p align="center">
  <a href="https://www.npmjs.org/package/vue-rex">
    <img src="https://img.shields.io/npm/v/vue-rex.svg" />
  </a>
  <a href="https://npmcharts.com/compare/vue-rex?minimal=true">
    <img src="https://img.shields.io/npm/dm/vue-rex.svg" />
  </a>
  <a href="https://www.npmjs.com/package/vue-rex">
    <img src="https://img.shields.io/npm/l/vue-rex" alt="License" />
  </a>
</p>
<p align="center">
Vue Rex 是一个面向 Vue 3 的类型安全、插件化的请求库。通过工厂函数模式（createRequest / createPagination）统一多后端数据处理逻辑，TypeScript 自动推导返回类型，无需手动标注泛型。
</p>

## 特性

- **工厂函数模式** — 通过 `createRequest` / `createPagination` 创建可复用的请求实例
- **类型自动推导** — TypeScript 根据 service 返回类型自动推导 data 类型
- **多后端适配** — 通过 `dataKey` / `listKey` + `totalKey` 统一不同后端的数据结构
- **缓存策略** — 内置内存缓存，支持 staleTime / cacheTime 配置
- **轮询请求** — 自动定时重新请求
- **错误重试** — 支持配置重试次数和间隔
- **防抖 / 节流** — 内置请求防抖和节流
- **分页管理** — 自动管理 page / pageSize 状态
- **插件化** — 支持自定义插件扩展
- **全局配置** — 支持全局默认配置和插件注入

## 安装

```bash
npm install vue-rex
# or
pnpm add vue-rex
# or
yarn add vue-rex
```

## 快速开始

### createRequest

```ts
import { createRequest } from 'vue-rex'

// 创建实例，dataKey 指定数据提取路径
const useApi = createRequest({ dataKey: 'data' })

// 组件中使用
const getUserList = async () => {
  const res = await fetch('/api/users')
  return res.json() // { code: 0, data: User[] }
}

const { data, loading, error, run } = useApi(getUserList)
// data.value 自动推导为 User[] 类型 ✅
```

### createPagination

```ts
import { createPagination } from 'vue-rex'

// 创建分页实例
const usePage = createPagination({
  listKey: 'data.records',
  totalKey: 'data.total',
})

// 组件中使用
const getUserPage = async (params: { page: number, pageSize: number }) => {
  const res = await fetch(`/api/users?page=${params.page}&size=${params.pageSize}`)
  return res.json()
}

const { list, total, page, pageSize, run } = usePage(getUserPage)
// list.value 自动推导为 User[] 类型 ✅
// page / pageSize 是可写的 Ref，变化时自动触发请求
```

## 文档

[文档地址 (GitHub)](https://songpeng154.github.io/vue-rex/)

## 致谢

- [Axios](https://github.com/axios/axios)
- [VueRequest](https://github.com/attojs/vue-request)
- [VueHookPlus](https://github.com/InhiblabCore/vue-hooks-plus)
- [Ahooks](https://github.com/alibaba/hooks)
- [Alova](https://github.com/alovajs/alova)
- [TanStack Query](https://github.com/tanstack/query)
