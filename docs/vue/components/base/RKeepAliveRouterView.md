# RKeepAliveRouterView — 按 meta 缓存的 router-view

- **文件位置**: `packages/vue/components/Base/RKeepAliveRouterView.vue`
- **引入方式**: `import RKeepAliveRouterView from 'kit/vue/components/Base/RKeepAliveRouterView.vue'`
- **依赖**: `vue-router`

对 `<router-view>` 的薄封装：**路由 `meta.cache` 为真时用 `<keep-alive>` 包裹**，否则直接渲染。

## 示例

```vue
<template>
  <RKeepAliveRouterView />
</template>
```

配合路由配置：

```ts
{
  name: 'userSetting',
  path: '/user/setting',
  component: () => import('@/pages/UserSetting.vue'),
  meta: { title: '用户设置', cache: true }   // ← 需要缓存就加这一行
}
```

## Props / Slots / Emits

无。

## 注意事项

- 判断条件只有 `route.meta.cache`（真值即可），没有其它开关；`<keep-alive>` **没有设置 `include`**，所以它会缓存所有命中条件的组件，切换路由同名组件不会重新创建。
- `meta.cache` 不在 kit 的类型定义里，业务工程建议在自己的 `RouteMeta` 扩充中补上 `cache?: boolean`（参考 [types](/vue/types/index) 里的写法），否则拿不到类型提示。
- 只处理当前层级的 `<router-view>`；嵌套路由需要在对应层级再放一个实例。
