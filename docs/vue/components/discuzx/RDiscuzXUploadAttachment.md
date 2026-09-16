# RDiscuzXUploadAttachment — DiscuzX 附件上传

- **文件位置**: `packages/vue/components/DiscuzX/RDiscuzXUploadAttachment.vue`
- **引入方式**: `import RDiscuzXUploadAttachment from 'kit/vue/components/DiscuzX/RDiscuzXUploadAttachment.vue'`
- **依赖**: [RNaiveUpload](/vue/components/naive/RNaiveUpload)、`naive-ui`、[DiscuzXAttachmentsApi](/vue/api/discuzx)

在 [RNaiveUpload](/vue/components/naive/RNaiveUpload) 基础上接好 DiscuzX 附件接口：上传走 `uploadAttachment`，预览地址自动用 `genAttachmentPreviewUrl` 生成，删除走 `deleteAttachment`。

## 示例

```vue
<template>
  <RDiscuzXUploadAttachment
    v-model:file="attachment"
    action="/api"
    list-type="image"
    :upload-file="undefined"
  />
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `action` | `string` | — | 是 | 传给 `DiscuzXAttachmentsApi` 的 `baseUrl`（DiscuzX 入口地址） |
| 其余 | `RNaiveUpload` 的 props | — | 否 | 全部通过 `$attrs` 透传（`single`、`max`、`listType`、`sizeLimit` 等） |

## Slots / Emits

继承 `RNaiveUpload`：默认插槽放触发按钮；成功后抛 `update:file` / `update:files`（上例可直接 `v-model:file`）。

## 注意事项

- 组件**不支持自定义上传逻辑**：`upload-file` / `remove-file` 被写死成内部的 DiscuzX 调用，透传进去也会被覆盖。
- 内部实现直接用 `file.file`（可能为 `undefined`）调用接口，若同时传了 `onlyUpload` 之类的模式导致文件对象缺失，会走到接口层报错。
- 上传成功后返回的 `url` 来自 `genAttachmentPreviewUrl`，而该方法基于 `requestUrl + "&uri=..."` 拼接，因此 **`action` 里需要带 `?`**（如 `/api?`），否则生成的预览地址不合法。
- 必须能拿到 `useMessage()`，即外层要有 [NaiveUIProvider](/vue/components/naive/NaiveUIProvider)。
