# RCenterPagination — 居中分页

- **文件位置**: `packages/vue/components/Naive/RCenterPagination.vue`
- **引入方式**: `import RCenterPagination from 'kit/vue/components/Naive/RCenterPagination.vue'`
- **依赖**: `naive-ui`（`n-pagination`）

把 `n-pagination` 包在一个 `display: flex; justify-content: center` 的容器里，省去每个页面写居中样式。所有属性通过 `$attrs` 透传。

## 示例

```vue
<template>
  <RCenterPagination
    :page="pagination.page"
    :item-count="pagination.total"
    :page-size="pagination.perPage"
    @update:page="onPageChange"
  />
</template>
```

## Props / Slots / Emits

组件自身没有声明任何 props、插槽和事件，全部依赖 `n-pagination` 的透传（`page`、`page-size`、`item-count`、`page-count`、`update:page` 等）。

## 注意事项

- **不给任何分页属性时 `n-pagination` 无法显示分页**，至少要传 `page-count` 或 `item-count`。
- 分页条自身带有的上/下边距在其内部，居中容器不提供额外间距，需要时可以给组件加 `class` 覆盖。
