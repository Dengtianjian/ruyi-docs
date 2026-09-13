# NaiveUIMenuLink — 外链包装组件

- **文件位置**: `packages/vue/components/Naive/NaiveUIMenuLink.vue`
- **引入方式**: `import NaiveUIMenuLink from 'kit/vue/components/Naive/NaiveUIMenuLink.vue'`
- **依赖**: 无

把原生 `<a>` 包一层，让菜单 label 里可以安全地放外链（相对的 `<RouterLink>` 无法处理 `href` 形式的地址）。一般**不需要直接使用**，由 [NaiveUIMenu](/vue/components/naive/NaiveUIMenu) 在外链菜单项上自动使用。

## 示例

```vue
<template>
  <NaiveUIMenuLink href="https://example.com" target="_blank">外部站点</NaiveUIMenuLink>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `download` | `any` | — | 否 | 原生 `<a download>` |
| `href` | `string` | — | 否 | 链接地址 |
| `hreflang` | `string` | — | 否 | 语言标记 |
| `media` | `string` | — | 否 | 媒体查询 |
| `ping` | `string` | — | 否 | 链接上报地址 |
| `rel` | `string` | — | 否 | 关系描述 |
| `target` | `string` | — | 否 | 打开方式（`_blank` 等） |
| `type` | `string` | — | 否 | MIME 类型 |
| `referrerpolicy` | `'' \| 'no-referrer' \| ... \| 'unsafe-url'` | — | 否 | 引用来源策略 |

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 链接内容 |

## 注意事项

- 组件只渲染 `<a v-bind="Props"><slot /></a>`，不做任何跳转拦截，外链安全性（`rel="noopener"` 等）需要调用方自己加。
