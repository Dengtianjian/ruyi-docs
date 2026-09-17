# RDiscuzXUploadFile — DiscuzX 文件上传（OSS 授权直传）

- **文件位置**: `packages/vue/components/DiscuzX/RDiscuzXUploadFile.vue`
- **引入方式**: `import RDiscuzXUploadFile from 'kit/vue/components/DiscuzX/RDiscuzXUploadFile.vue'`
- **依赖**: [RNaiveUpload](/vue/components/naive/RNaiveUpload)、`naive-ui`、[DiscuzXFilesApi](/vue/api/discuzx)（已 `@deprecated`）

两步上传：先向服务端申请上传授权（`getUploadAuth`），把授权参数拼到 OSS 请求上，再直传到对象存储（`uploadFile`），完成后用返回的 `previewURL` 作为预览。

## 示例

```vue
<template>
  <RDiscuzXUploadFile action="/api" path-name="files/avatar" />
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `action` | `string` | — | 是 | 通过 `DiscuzXFilesApi.url(action)` 设置接口基地址 |
| `pathName` | `string` | `'files'` | 否 | 申请授权时的文件路径（服务端按目录归类） |
| 其余 | `RNaiveUpload` 的 props | — | 否 | 通过 `$attrs` 透传到 [RNaiveUpload](/vue/components/naive/RNaiveUpload) |

## Slots / Emits

继承 `RNaiveUpload`：默认插槽放触发按钮；上传/删除后抛 `update:file` / `update:files`。

## 注意事项

> **该组件会污染 `DiscuzXFilesApi` 这个全局单例，多实例/多页面同时使用会互相干扰：**
>
> - 组件在 `setup` 阶段直接执行 `DiscuzXFilesApi.url(Props.action)`，等于**修改全局默认导出实例的 `baseUrl`**，后挂载的组件会覆盖先前的地址。
> - 上传前会把授权返回的 `auth` 字段逐个 `query(key, value)` 挂到同一个单例上，这些查询参数**不会被清除**，后续同实例的请求都会带上它们。
> - `deleteFile` / `getUploadAuth` 都走这个被改过的单例。
>
> 因此建议：同一时间只存在一个该组件实例，或改用 [RDiscuzXUploadAttachment](/vue/components/discuzx/RDiscuzXUploadAttachment) / 自行封装（`new DiscuzXFilesApi(...)`）来隔离状态。
>
> 另外 `DiscuzXFilesApi` 本身已标注 `@deprecated`，新项目优先评估用其它上传方案。
>
> 该组件依赖 `useMessage()`，外层必须有 [NaiveUIProvider](/vue/components/naive/NaiveUIProvider)。
