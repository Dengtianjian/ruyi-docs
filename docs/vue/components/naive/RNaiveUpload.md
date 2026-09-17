# RNaiveUpload — 上传（受控回调版）

- **文件位置**: `packages/vue/components/Naive/RNaiveUpload.vue`
- **引入方式**: `import RNaiveUpload from 'kit/vue/components/Naive/RNaiveUpload.vue'`
- **依赖**: `naive-ui`（`n-upload`、`useMessage`）→ **必须被 [NaiveUIProvider](/vue/components/naive/NaiveUIProvider)（或 `n-message-provider`）包裹**

把「上传/删除动作」抽象成两个回调函数，内部维护文件列表与状态提示，业务只需要关心「文件怎么传、返回什么 URL」。

## 示例

```vue
<template>
  <RNaiveUpload
    v-model:file="avatar"
    single
    list-type="image"
    :size-limit="2 * 1024 * 1024"
    :upload-file="uploadFile"
    :remove-file="removeFile"
  >
    <n-button>选择文件</n-button>
  </RNaiveUpload>
</template>

<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui'
import RNaiveUpload from 'kit/vue/components/Naive/RNaiveUpload.vue'

async function uploadFile(file: UploadFileInfo) {
  return await api.post('upload', file.file)   // 返回 url 字符串或 UploadFileInfo
}
async function removeFile(file: UploadFileInfo) {
  return await api.delete(`upload/${file.id}`)  // 返回 boolean
}
</script>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `uploadFile` | `(file: UploadFileInfo) => Promise<string \| UploadFileInfo>` | — | 是 | 上传回调；返回 `string` 会当成 url 生成列表项，返回 `UploadFileInfo` 则直接使用 |
| `removeFile` | `(file: UploadFileInfo) => Promise<boolean>` | — | 否 | 删除回调；不传时视为删除成功 |
| `files` | `UploadFileInfo[]` | `null` | 否 | 初始列表（多选模式） |
| `file` | `UploadFileInfo` | `null` | 否 | 初始文件（单选模式） |
| `single` | `boolean` | `false` | 否 | 单选模式：只保留一个文件，替换第一个位置 |
| `onlyUpload` | `boolean` | `false` | 否 | 只上传不维护内部列表（结果仅通过事件抛出） |
| `max` | `number` | `1` | 否 | 最多文件数（`single` 为 `true` 时强制为 1） |
| `listType` | `'text' \| 'image' \| 'image-card'` | `'text'` | 否 | 列表样式 |
| `sizeLimit` | `number` | `null` | 否 | 单文件大小上限（字节），超出时 `message.warning` 并中断 |

其余属性透传给 `n-upload`；默认插槽用于放触发按钮/拖拽区。

## Emits / 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| `update:file` | `UploadFileInfo \| null` | 单选模式下上传成功、或删除后（删除时为 `null`） |
| `update:files` | `UploadFileInfo[]` | 多选模式下上传成功或删除后 |

## 注意事项

- 内部文件列表是 `reactive([])` 的**浅拷贝**：`files` / `file` 只在初始化时读一次，之后 props 变化不会同步（只有 `file` 有 `watch` 同步，`files` 没有）。
- 多选模式的 `update:files` 抛出的是**内部响应式数组本身**，父组件直接持有会导致双向污染，建议 `[...files]` 复制后再存。
- 删除时若 `removeFile` 抛出的错误带 `statusCode === 404`，会被当成“服务端已删除”，仍然从列表里移除。
- 必须能拿到 `useMessage()`（即使只上传不提示，组件初始化时就会调用），脱离 Provider 使用会直接报错。
