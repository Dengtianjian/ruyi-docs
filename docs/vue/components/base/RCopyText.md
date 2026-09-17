# RCopyText — 点击复制

- **文件位置**: `packages/vue/components/Base/RCopyText.vue`
- **引入方式**: `import RCopyText from 'kit/vue/components/Base/RCopyText.vue'`
- **依赖**: 浏览器 Clipboard API（要求安全上下文：`https` 或 `localhost`）

点击整块区域即把指定内容写入剪贴板，可选在右侧显示一个复制图标。

## 示例

```vue
<template>
  <RCopyText content="https://example.com/share/abc" @success="() => message.success('已复制')">
    复制链接
  </RCopyText>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `content` | `string` | — | 是 | 要写入剪贴板的内容 |
| `showIcon` | `boolean` | `true` | 否 | 是否在内容后面显示复制图标，同时影响容器是否用 flex 布局 |

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 显示的内容（不传则只剩图标） |

## Emits / 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| `success` | — | `navigator.clipboard.writeText` 成功 |
| `fail` | `Error` | 写入失败（如非安全上下文、缺少权限） |

## 注意事项

- 只有 Clipboard API，**没有 `document.execCommand` 降级**；`http` 环境下会走 `fail`。
- 图标用的是 `<i class="antd antd-file-copy">`，需要业务工程自带该图标字体，否则只有一个占位空元素。
- 容器带有 `title="点击复制内容"`，鼠标悬停会显示原生提示。

---

> 业务工程暂未使用，此处为最小示例。
