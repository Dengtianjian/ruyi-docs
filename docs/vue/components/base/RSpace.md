# RSpace — 间距容器

- **文件位置**: `packages/vue/components/Base/RSpace.vue`
- **引入方式**: `import RSpace from 'kit/vue/components/Base/RSpace.vue'`
- **依赖**: 无（纯 flex 布局）

一个 `display: flex` 的容器，把对齐、换行、间距集中成 props，省去每个页面写一份 flex 样式。

## 示例

```vue
<template>
  <RSpace justify="space-between" align="center" :gap="10">
    <span>左侧</span>
    <span>右侧</span>
  </RSpace>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `justify` | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | `'start'` | 否 | 主轴对齐（直接作为 `justify-content`） |
| `align` | `'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch'` | `'start'` | 否 | 交叉轴对齐（`align-items`） |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse' \| string` | — | 否 | `flex-wrap`；**默认值实际未生效**，见注意事项 |
| `gap` | `number \| string` | `''` | 否 | 同时设置行列间距；有值时忽略 `rowGap`/`columnGap` |
| `rowGap` | `number \| string` | `''` | 否 | 行间距 |
| `columnGap` | `number \| string` | `''` | 否 | 列间距 |
| `direction` | `string` | `'row'` | 否 | `flex-direction` |

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 排列的内容 |

## 注意事项

- `wrap` 的默认值在源码里写成了 `warp: "nowrap"`（键名拼写错误），因此 **`wrap` 实际没有默认值**：不传时 `flex-wrap` 是 `undefined`（等效于默认的 `nowrap`），行为一致，但依赖默认值做类型推断时要注意。
- 数字类型的 `gap` / `rowGap` / `columnGap` 会被 Vue 自动补成 `px`。
- 容器只负责布局，不处理子元素的收缩（`flex-shrink`）与溢出，狭窄容器内仍会出现挤压。
