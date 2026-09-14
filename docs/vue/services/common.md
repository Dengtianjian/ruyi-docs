# commonService — 通用小工具

- **文件位置**: `packages/vue/services/commonService.ts`
- **引入方式**: `import { commonService } from 'kit/vue'`
- **依赖**: 无

目前只有一个方法：生成带分隔符的随机 ID。

## 方法速查表

| 方法 | 作用 |
| --- | --- |
| [`genUniqueId(...)`](#genuniqueid-生成随机-id) | 生成随机 ID |

## 方法

### `genUniqueId(length?, delimiter?, delimiterCount?, prefix?, suffix?)` — 生成随机 ID

从 62 个字符（小写字母 + 数字 + 大写字母）中随机取字符，按 `delimiterCount` 分组后用 `delimiter` 连接，可加前后缀。

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `length` | `number` | `32` | 期望长度（实际长度见注意事项） |
| `delimiter` | `string` | `'-'` | 分组连接符；传空串则不分段 |
| `delimiterCount` | `number` | `4` | 段数 |
| `prefix` | `string` | `''` | 前缀 |
| `suffix` | `string` | `''` | 后缀 |

**返回值**

- `string`

## 示例

```ts
import { commonService } from 'kit/vue'

commonService.genUniqueId()          // 4 段 8 位，'-' 连接
commonService.genUniqueId(16, '')    // 只返回 1 个字符（见注意事项）
commonService.genUniqueId(32, '-', 4, 'u_')
```

## 注意事项

- **`length` 不是最终长度**：`delimiter` 非空时按 `delimiterCount` 分段，实际字符数 = `delimiterCount × ceil(length / delimiterCount)`，再加上 `delimiterCount - 1` 个分隔符。例如默认参数得到的是 `4 × 8 + 3 = 35` 位。另外 `length` 在内部被改写成 `length - delimiterCount` 之后就没再被用到，容易被误读成「每段长度」。
- 取字符用的是 `charts[Math.round(Math.random() * charts.length)]`，**下标可能取到 62（越界）**，此时拼出来的是字符串 `"undefined"`（每个位置约 0.8% 概率）。对 ID 格式有严格要求（如长度、字符集校验）的场景请勿直接使用。
- **`delimiter` 传空串时结果只有 1 个字符**：这条分支只是把 `delimiterCount` 强制为 1，而分段长度 `splitLength` 保持初始值 `1`（没有按 `length` 计算），所以返回的是 1 个随机字符，不是 `length` 个。要定长随机串请保持 `delimiter` 非空，或自己拼接。

---

> 业务工程暂未使用，此处为最小示例。
