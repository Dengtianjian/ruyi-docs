# helper — 类型判断工具

- **文件位置**: `packages/vue/foundation/helper.ts`
- **引入方式**: `import { helper } from 'kit/vue'`
- **依赖**: 无

三个轻量的类型判断函数，kit 内部（如 `HTTP`）也在用。

## 方法速查表

| 方法 | 作用 |
| --- | --- |
| [`undefinedOrNull(value)`](#undefinedornull-value-是否非空) | 判断值**不是** `undefined`/`null`（命名与语义相反，见下） |
| [`isNumber(value)`](#isnumber-value-是否数字) | 是否为非空数字 |
| [`type(target)`](#type-target-类型名) | 小写类型名字符串 |

## 方法

### `undefinedOrNull(value)` — 是否非空

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `any` | — | 待判断的值 |

**返回值**

- `boolean`：`value !== undefined && value !== null`，即**返回 `true` 表示「有值」**。

> 命名有误导性：它不是「是不是 undefined 或 null」，而是「不是 undefined 也不是 null」。读代码时按「非空判断」理解。

### `isNumber(value)` — 是否数字

先做非空判断，再检查 `typeof value === 'number'`（`NaN` 也会返回 `true`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `any` | — | 待判断的值 |

**返回值**

- `boolean`

### `type(target)` — 类型名

基于 `Object.prototype.toString` 取类型名并转小写，能区分 `array` / `object` / `null` / `date` 等。

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `target` | `any` | — | 待判断的值 |

**返回值**

- `string`：如 `'string'`、`'number'`、`'array'`、`'object'`、`'null'`、`'undefined'`。

## 示例

```ts
import { helper } from 'kit/vue'

helper.undefinedOrNull(0)        // true —— 有值
helper.undefinedOrNull(undefined) // false
helper.isNumber(1)               // true
helper.type([])                  // 'array'
```

---

> 业务工程暂未使用（kit 内部被 `HTTP` 用于判断请求体类型），此处为最小示例。
