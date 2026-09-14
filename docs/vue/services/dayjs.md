# dayjsService — dayjs 封装

- **文件位置**: `packages/vue/services/dayjsService.ts`
- **引入方式**: `import { dayjsService } from 'kit/vue'`
- **依赖**: `dayjs`（peer）、`dayjs/esm/locale/zh-cn`、`dayjs/plugin/relativeTime`

统一的日期显示：**超过阈值显示绝对时间，阈值内显示「x 分钟前」**。

## 方法速查表

| 方法 | 作用 |
| --- | --- |
| [`init()`](#init-初始化) | 设置中文 locale 并注册相对时间插件（**必须先调用**） |
| [`formatAutoFromNow(...)`](#formatautofromnow-近则相对时间) | 自动选择相对/绝对格式 |

## 方法

### `init()` — 初始化

执行 `dayjs.locale('zh-cn')` 并 `dayjs.extend(relativeTime)`。

**返回值**

- `void`

### `formatAutoFromNow(date?, toFromNowThreshold?, formatTemplate?, withoutSuffix?)` — 近则相对时间

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `date` | `string \| number \| Date \| Dayjs` | — | 时间，交给 `dayjs(date)` 解析 |
| `toFromNowThreshold` | `number` | `86400000`（24 小时，毫秒） | 超过该毫秒数就显示绝对时间 |
| `formatTemplate` | `string` | `'YYYY-MM-DD HH:mm:ss'` | 超过阈值时使用的格式 |
| `withoutSuffix` | `boolean` | `false` | 透传给 `fromNow`，为 `true` 时去掉「前」等后缀 |

**返回值**

- `string`

判断逻辑：`Date.now() - dayjs(date).valueOf() > toFromNowThreshold` 时返回 `d.format(formatTemplate)`，否则返回 `d.fromNow(withoutSuffix)`。

## 示例

```ts
import { dayjsService } from 'kit/vue'

dayjsService.init()   // 入口处调用一次

dayjsService.formatAutoFromNow(Date.now() - 60 * 1000)   // '1 分钟前'
dayjsService.formatAutoFromNow('2026-01-01 08:00:00')    // '2026-01-01 08:00:00'
```

## 注意事项

- **`init()` 必须先调用**：`fromNow` 由 `relativeTime` 插件提供，未注册时该方法不可用；同时它会把 `dayjs` 的全局 locale 改成 `zh-cn`，影响业务工程里所有 `dayjs` 调用。
- `date` 不传时会传入 `undefined`，`dayjs(undefined)` 取当前时间；`toFromNowThreshold` 传 `0` 则永远走 `fromNow` 分支。

---

> 业务工程暂未使用，示例为最小用法。
