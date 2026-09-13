# SettingFormService — 设置表单状态管理

- **文件位置**: `packages/vue/services/SettingFormService.ts`
- **引入方式**: `import { SettingFormService } from 'kit/vue'`
- **依赖**: `vue`（`reactive` / `ref`）、业务侧提供符合 `ISettingsApi` 的接口实例

把「一组键值型设置」的响应式数据与加载/保存状态（`loading`、`saving`、`disabled`）封装在一起，配合表单组件写设置页时不用再手写这三套状态。

## 类型：`ISettingsApi`

构造时要传入的接口实例约定（源码里以 `interface` 导出）：

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `items` | `<T>(...names: string[]): Promise<T>` | 批量读取 |
| `item` | `<T>(key: string): Promise<T>` | 读取单个 |
| `saveItems` | `(data: Record<string, any>): Promise<number>` | 批量保存 |
| `save` | `(key: string, value: string): Promise<number>` | 保存单个 |

## 构造与实例属性

`new SettingFormService(defaultValues, request)`

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `defaultValues` | `T extends object` | — | 设置项的默认值（键名即需要拉取的 keys） |
| `request` | `ISettingsApi` | — | 接口实例 |

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `UnwrapNestedRefs<T>` | 当前设置值，响应式，表单直接绑它 |
| `settings` | `UnwrapNestedRefs<T>` | **`@deprecated`**，与 `value` 内容相同，仅为兼容保留 |
| `loading` | `Ref<boolean>` | `load()` 执行期间为 `true` |
| `saving` | `Ref<boolean>` | `save()` 执行期间为 `true` |
| `disabled` | `Ref<boolean>` | 同上，可直接绑到表单的 `disabled` |
| `request` | `ISettingsApi` | 传入的接口实例 |

## 方法

### `load()` — 拉取设置

以 `Object.keys(this.settings)` 作为 keys 调用 `request.items<T>(...)`，把返回对象里的每个键合并进 `settings` 与 `value`（未返回的键保留默认值）。

**返回值**

- `Promise<UnwrapNestedRefs<T>>`：`this.value`

### `save(dataHandle?)` — 提交设置

调用 `request.saveItems(...)`，`dataHandle` 用于提交前转换数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `dataHandle` | `(data?: UnwrapNestedRefs<T>) => T` | — | 不传时直接提交 `this.value`（响应式对象）；传了则以 `toRaw(this.value)` 作为入参，返回值作为提交内容 |

**返回值**

- `Promise<number>`：接口返回的受影响条数

## 示例

```ts
import { SettingFormService } from 'kit/vue'
import SettingsApi from 'kit/vue/api/common/SettingsApi.ts'

const service = new SettingFormService({ siteName: '', siteURL: '' }, SettingsApi)

await service.load()
service.value.siteName = '如意'
await service.save((data) => ({ ...data, siteURL: data.siteURL.trim() }))
```

## 注意事项

- **`request` 必须实现 `items` / `saveItems`**：kit 自带的 `api/common/SettingsApi` 提供的方法名是 `list` / `saveList` / `save`（见 [api](/vue/api/index)），直接传进去会在 `load()` 时报 `items is not a function`，需要自己包一层适配。
- `defaultValues` 必传：不传时 `settings` / `value` 为 `null`，`load()` 里的 `Object.keys(null)` 会直接抛错。
- 不传 `dataHandle` 时提交的是**响应式对象本身**（未 `toRaw`），接口实现需要能处理它；要裁剪字段/去空格就用 `dataHandle`。
- 业务工程暂未使用，示例为最小用法。

---

> **相关**：[DiscuzXSettingFormService](/vue/services/discuzx-setting-form)、[api](/vue/api/index)
