# RCommonFooter — 页脚

- **文件位置**: `packages/vue/components/Base/RCommonFooter.vue`
- **引入方式**: `import RCommonFooter from 'kit/vue/components/Base/RCommonFooter.vue'`
- **依赖**: 无

统一的页脚：显示 kit 的版本号 + 「联系我们」邮箱链接。

## 示例

```vue
<template>
  <RCommonFooter />
</template>
```

## Props / Slots / Emits

无。

## 注意事项

- 版本号来自 kit 仓库自己的 `package.json` 的 `version` 字段（源码 `import { version } from "../../../../../package.json"`），因此它反映的是 **kit 的版本**，不是业务工程的版本。
- 邮箱与文案在源码里写死（`mail@isdtj.com`），需要改文案请直接改组件或不用它。
- 需要主题变量 `--font-light-color`（来自 `kit/vue/assets/css/common.css`）才能得到浅色文字。
