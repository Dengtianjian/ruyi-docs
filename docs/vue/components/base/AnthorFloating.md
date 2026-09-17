# AnthorFloating — 锚点浮动容器

- **文件位置**: `packages/vue/components/Base/AnthorFloating.vue`
- **引入方式**: `import AnthorFloating from 'kit/vue/components/Base/AnthorFloating.vue'`
- **依赖**: 无（纯 DOM 定位，`position: fixed`）

贴在某个元素旁边悬浮的内容容器。根据 `target` 的 `offsetWidth` / `offsetLeft` 与自身宽度算出水平位置；当右侧空间不足（含 30px 缓冲）时会自动翻到另一侧，避免被视口裁掉。

## 示例

```vue
<!-- isdtj/src/components/FloatButtons.vue 的真实用法 -->
<template>
  <AnthorFloating :target="anthorTarget" bottom="100px" :left="50" x-position="left" v-if="anthorTarget">
    <ul class="float-buttons">
      <!-- 悬浮内容 -->
    </ul>
  </AnthorFloating>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `target` | `HTMLElement \| null` | — | 是 | 定位参照元素；为 `null` 时不做任何定位 |
| `xPosition` | `'left' \| 'right'` | `'left'` | 否 | 以哪一侧为基准计算水平位置 |
| `left` | `number` | — | 条件必填 | `xPosition='left'` 时的水平偏移（px）；缺失时会 `console.error("AnthorFloating 组件缺失 left 参数")` 并跳过定位 |
| `right` | `number` | — | 条件必填 | `xPosition='right'` 时的水平偏移（px） |
| `top` | `string \| number` | — | 否 | 数字按 `px` 处理，字符串原样使用 |
| `bottom` | `string \| number` | — | 否 | 同上 |
| `zIndex` | `number` | `9` | 否 | 层级 |

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 悬浮内容 |

## 注意事项

- `target` 要在元素挂载后再传（常见做法是 `onMounted` 里从模板 ref 取，再用 `v-if` 推迟渲染），否则拿不到 `offsetLeft`。
- 重算时机只有三个：`onMounted`、`props` 深度变化、`window.resize`。**`target` 自身尺寸变化（图片加载、内容展开）不会触发重算**，需要自己改一次 props 来触发。
- 缓冲区距离固定 30px（源码常量 `BufferDistance`），用于规避浏览器缩放与滚动条宽度带来的覆盖问题。
