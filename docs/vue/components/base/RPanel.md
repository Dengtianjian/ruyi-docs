# RPanel — 面板容器

- **文件位置**: `packages/vue/components/Base/RPanel.vue`
- **引入方式**: `import RPanel from 'kit/vue/components/Base/RPanel.vue'`
- **依赖**: 主题 CSS 变量（需引入 `kit/vue/assets/css/common.css`）

最基础的内容面板：可选标题 + 右上角附加区 + 内容区。样式全部取自 [主题变量](/vue/index)，因此不引入样式文件时面板会没有内边距/圆角/底色。

## 示例

```vue
<template>
  <RPanel title="基本信息">
    <template #extra>
      <n-button size="small">编辑</n-button>
    </template>
    <p>面板内容</p>
  </RPanel>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | — | 否 | 标题文本（也可以用 `#title` 插槽，两者会同时渲染） |

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 面板主体内容 |
| `title` | — | 自定义标题（渲染在 `title` 文本之前） |
| `extra` | — | 标题行右侧内容 |

## 注意事项

- 只要 `title`、`#title`、`#extra` 中任意一个存在，主体就会自动加 10px 顶距；三者都没有时标题栏整个不渲染。
- 用到的变量：`--r-panel-padding`、`--r-panel-background-color`、`--r-border-radius`、`--font-color_1`。
- 源码里附加区的类名拼写为 `panel-heaer-extra`（`heaer`），不影响功能，但按类名自定义样式时要注意。
