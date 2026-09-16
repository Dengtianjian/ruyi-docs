# DiscuzXSettingFormService — DiscuzX 设置表单

- **文件位置**: `packages/vue/services/discuzX/DiscuzXSettingFormService.ts`
- **引入方式**: `import { DiscuzXSettingFormService } from 'kit/vue'`
- **依赖**: `api/discuzX/common/DiscuzXSettingsApi`、[SettingFormService](/vue/services/setting-form)

> 源码标注 **`@deprecated`**，新代码建议用 `SettingFormService` 自己接 api。

面向 DiscuzX 后端（`settings?name=a,b` 读、`PATCH settings` 写）的封装。相比基类，它**在内部自己创建 `DiscuzXSettingsApi` 实例**，所以调用方不用再传接口对象。

## 构造

`new DiscuzXSettingFormService(apiRequestBaseUrl, defaultValue)`

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `apiRequestBaseUrl` | `string` | — | DiscuzX 入口地址，作为 api 的 `baseUrl` |
| `defaultValue` | `T extends Record<string, any>` | — | 设置项默认值，键名即要拉取的 keys |

## 覆写的方法

### `load()` — 拉取设置

以 `Object.keys(this.value)` 作为 keys 调 `DiscuzXSettingsApi.list`，把结果合并进 `settings` 与 `value`。

**返回值**

- `Promise<T>`：接口返回的设置对象（注意基类返回的是 `this.value`）

### `save(dataHandler?)` — 提交设置

调 `DiscuzXSettingsApi.saveList(...)`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `dataHandler` | `(data: UnwrapNestedRefs<T>) => T` | — | 不传时提交 `this.settings` |

**返回值**

- `Promise<number>`

## 与 `SettingFormService` 的差别

| 关注点 | `SettingFormService` | `DiscuzXSettingFormService` |
| --- | --- | --- |
| 接口实例 | 构造时外部传入 | 内部按 `apiRequestBaseUrl` 创建 |
| 取 keys 的对象 | `this.settings` | `this.value`（两者内容一致） |
| `load()` 返回 | `this.value` | 接口原值 |
| `save()` 提交内容 | `saveItems(toRaw(value))` 或 `value` | `saveList(settings)`，**不做 `toRaw`** |

## 示例

```ts
import { DiscuzXSettingFormService } from 'kit/vue'

const service = new DiscuzXSettingFormService('/api', { siteName: '', siteURL: '' })

await service.load()
service.value.siteName = '如意'
await service.save((data) => ({ ...data, siteURL: data.siteURL.trim() }))
```

## 注意事项

- 已废弃：新代码用 [SettingFormService](/vue/services/setting-form) + 自己的 `ISettingsApi` 适配实现更可控。
- `save()` 不传 `dataHandler` 时提交的是响应式 `settings` 对象，且**没有 `toRaw`**，序列化依赖接口内部处理。
- 业务工程暂未使用，示例为最小用法。

---

> **相关**：[api/discuzx](/vue/api/discuzx)
