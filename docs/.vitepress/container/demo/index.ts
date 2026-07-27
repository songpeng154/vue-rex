import type MarkdownIt from 'markdown-it'
import * as fs from 'node:fs'
import * as path from 'node:path'
import markdownItContainer from 'markdown-it-container'

export const setupContainerDemo = (md: MarkdownIt) => {
  md.use(markdownItContainer, 'demo', {
    validate(params) {
      return !!params.trim().match(/^demo\s*(.*)$/)
    },
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // 描述信息
        const token = tokens[idx + 2]
        // 组件路径
        let componentSrc = ''
        // 在线运行 url
        let runOnlineUrl = ''
        if (!token) return new Error('请传递Demo组件路径')
        const arr = token.content.split('\n')
        componentSrc = arr[0]
        runOnlineUrl = arr[1]

        const sourceCode = fs.readFileSync(path.resolve(__dirname, `../../examples/${componentSrc}.vue`), 'utf8')

        return `<Demo run-url="${runOnlineUrl}" path="${componentSrc}.vue" source-code="${encodeURIComponent(sourceCode)}">`
      }
      else
        return '</Demo>'
    },
  })
}
