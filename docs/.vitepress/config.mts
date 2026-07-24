import { fileURLToPath } from 'node:url'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vitepress'
import { setupContainerDemo } from './container/demo'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  base: '/vue-rex/',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/vue-rex/favicon.ico' }],
  ],
  markdown: {
    theme: {
      dark: 'github-dark',
      light: 'github-light',
    },
    async config(md) {
      setupContainerDemo(md)
    },
    lineNumbers: true,
  },
  vite: {
    resolve: {
      alias: {
        'vue-rex': r('../../src/index.ts'),
      },
    },
    server: {
      hmr: true,
    },
    plugins: [
      UnoCSS(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Vue Rex 使用文档',
      description: 'Vue Rex 是一个面向 Vue 3 的高度灵活、类型安全且插件化的请求 Hook 库',
      themeConfig: {
        nav: [
          { text: '文档', link: '/document/start/introduction', activeMatch: '^/document/' },
          // { text: 'API参考', link: '/api-reference/common-type/home', activeMatch: '^/api-reference/' },
        ],
        sidebar: {
          '/document': [
            {
              text: '开始',
              base: '/document/start',
              items: [
                { text: '介绍', link: '/introduction' },
                { text: '快速上手', link: '/start-quickly' },
              ],
            },
            {
              text: 'createRequest',
              base: '/document/use-request',
              items: [
                { text: '介绍', link: '/introduction' },
                { text: '基础用法', link: '/basic-usage' },
                { text: '保持&延迟Loading', link: '/loading' },
                { text: '防抖', link: '/debounce' },
                { text: '节流', link: '/throttle' },
                { text: '缓存 & SWR', link: '/cache-swr' },
                { text: '数据突变', link: '/data-mutation' },
                { text: '错误重试', link: '/error-retry' },
                { text: '依赖刷新', link: '/dependency-refresh' },
                { text: '轮询请求', link: '/polling-request' },
                { text: '依赖请求', link: '/dependency-request' },
                { text: '并行请求', link: '/parallel-request' },
                { text: '取消请求', link: '/cancel-request' },
                { text: '格式化数据', link: '/formatting-data' },
                { text: '窗口聚焦刷新', link: '/refresh-on-window-focus' },
              ],
            },
            {
              text: 'createPagination',
              link: '/document/use-pagination/introduction',
            },
          ],
          // '/api-reference': [
          //   { text: '通用类型', link: '/api-reference/common-type/home' },
          //   {
          //     text: 'Hooks',
          //     base: '/api-reference/hooks',
          //     items: [
          //       { text: 'createRequest', link: '/use-request/home' },
          //       { text: 'createPagination', link: '/use-pagination/home' },
          //     ],
          //   },
          // ],
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      title: 'Vue Rex Documentation',
      description: 'Vue Rex is a flexible, type-safe, and plugin-based request Hook library for Vue 3',
      themeConfig: {
        nav: [
          { text: 'Docs', link: '/en/document/start/introduction', activeMatch: '^/en/document/' },
        ],
        sidebar: {
          '/en/document': [
            {
              text: 'Getting Started',
              base: '/en/document/start',
              items: [
                { text: 'Introduction', link: '/introduction' },
                { text: 'Quick Start', link: '/start-quickly' },
              ],
            },
            {
              text: 'createRequest',
              base: '/en/document/use-request',
              items: [
                { text: 'Introduction', link: '/introduction' },
                { text: 'Basic Usage', link: '/basic-usage' },
                { text: 'Loading', link: '/loading' },
                { text: 'Debounce', link: '/debounce' },
                { text: 'Throttle', link: '/throttle' },
                { text: 'Cache & SWR', link: '/cache-swr' },
                { text: 'Data Mutation', link: '/data-mutation' },
                { text: 'Error Retry', link: '/error-retry' },
                { text: 'Dependency Refresh', link: '/dependency-refresh' },
                { text: 'Polling', link: '/polling-request' },
                { text: 'Dependency Request', link: '/dependency-request' },
                { text: 'Parallel Request', link: '/parallel-request' },
                { text: 'Cancel Request', link: '/cancel-request' },
                { text: 'Format Data', link: '/formatting-data' },
                { text: 'Refresh on Window Focus', link: '/refresh-on-window-focus' },
              ],
            },
            {
              text: 'createPagination',
              link: '/en/document/use-pagination/introduction',
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.png',
    darkModeSwitchLabel: '主题',
    darkModeSwitchTitle: '切换到深色模式',
    lightModeSwitchTitle: '切换到浅色模式',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '切换语言',
    sidebarMenuLabel: '目录',
    skipToContentLabel: '跳转到内容',
    outline: {
      label: '页面导航',
    },
    docFooter: {
      next: '下一页',
      prev: '上一页',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/songpeng154/vue-rex.git' },
    ],
  },
})
