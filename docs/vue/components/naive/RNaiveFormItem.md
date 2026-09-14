# RNaiveFormItem — 表单项

- **文件位置**: `packages/vue/components/Naive/RNaiveFormItem.vue`
- **引入方式**: `import RNaiveFormItem from 'kit/vue/components/Naive/RNaiveFormItem.vue'`
- **依赖**: `naive-ui`（`n-form-item`）

在 `n-form-item` 上补了「说明文字」「底部附加区」「撑满宽度」三件事，其余属性全部透传。

## 示例

```vue
<template>
  <n-form :model="model">
    <RNaiveFormItem path="siteName" label="站点名称" prompt="用于页面标题与邮件署名" block>
      <n-input v-model:value="model.siteName" />
      <template #bottom>
        <n-button size="tiny" @click="reset">恢复默认</n-button>
      </template>
    </RNaiveFormItem>
  </n-form>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `prompt` | `string` | `null` | 否 | 标签下方的说明文字（灰色小字，颜色取 `--n-feedback-text-color`） |
| `block` | `boolean` | `false` | 否 | 为 `true` 时内容容器加 `flex: 1`，让控件撑满可用宽度 |

其余属性（`label`、`path`、`rule`、`validation-status` 等）通过 `$attrs` 透传给 `n-form-item`。

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 表单控件 |
| `feedback` | — | 校验反馈区（对应 `n-form-item` 的 `feedback`） |
| `label` | — | 自定义标签 |
| `bottom` | — | 控件下方内容（与控件有 5px 间距） |
| `prompt` | — | 自定义说明文字 |

## 注意事项

- **`prompt` prop 与 `#prompt` 插槽会同时渲染**：源码里两者写在一起，同时使用时说明文字会重复出现，二选一即可。
- `block` 只影响内容容器的 `flex` 值，父级需要有 `display: flex` 的布局才能看到效果。
