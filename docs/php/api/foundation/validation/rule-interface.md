# RuleInterface — 校验规则契约接口

- **文件位置**: `kernel/Foundation/Validation/RuleInterface.php`
- **命名空间**: `kernel\Foundation\Validation`
- **类型**: 接口
- **默认实现**: `RuleBuilder`

定义所有校验规则方法的完整契约，`RuleBuilder` 为默认实现。上层通过 `Rule` 门面类调用，实现与具体构建器的解耦。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `required($message)` | 校验值是否为空或 `null` |
| `type($value, $message)` | 校验数据类型 |
| `equal($value, $message)` | 校验是否等于指定值（`===`） |
| `includes($value, $message)` | 校验字符串包含子串 / 数组包含元素 |
| `hasKeys($value, $message)` | 校验数组是否存在指定键 |
| `min($value, $message)` | 校验数值 >= 指定值 |
| `max($value, $message)` | 校验数值 <= 指定值 |
| `range($min, $max, $message)` | 校验数值在 `[min, max]` 内 |
| `minLength($value, $message)` | 校验长度 >= 指定值 |
| `maxLength($value, $message)` | 校验长度 <= 指定值 |
| `length($min, $max, $message)` | 校验长度在 `[min, max]` 内 |
| `pattern($pattern, $message)` | 正则表达式校验 |
| `custom($callback)` | 自定义校验 |
| `useRule($validateRule)` | 复用已有的校验规则实例 |
| `email($message)` | 校验有效邮箱地址 |
| `url($message)` | 校验有效 URL |
| `ip($message)` | 校验有效 IP（IPv4/IPv6） |
| `date($message)` | 校验有效日期字符串 |
| `dateFormat($format, $message)` | 校验指定日期格式 |
| `in($values, $message)` | 校验值在值列表中 |
| `notIn($values, $message)` | 校验值不在值列表中 |
| `confirmed($message)` | 校验值与 `字段名_confirmation` 一致 |
| `same($field, $message)` | 校验值与另一字段相同 |
| `different($field, $message)` | 校验值与另一字段不同 |
| `nullable($message)` | 允许值为 `null` |
| `present($message)` | 允许值为空字符串 |
| `prohibited($message)` | 校验字段不能存在于输入数据中 |
| `requiredIf($anotherField, $values, $message)` | 另一字段等于指定值时必填 |
| `requiredUnless($anotherField, $values, $message)` | 除非另一字段等于指定值否则必填 |

## 方法

### `required($message = "")` — 校验值是否为空或为 null

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `type($value, $message = "")` — 校验数据类型

校验目标值的数据类型是否等于指定数据类型，或是否存在于指定的数据类型数组中。`int` 自动转为 `integer`，`bool` 自动转为 `boolean`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string\|string[]` | 无 | 数据类型或数据类型数组 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `equal($value, $message = "")` — 校验是否等于指定值

使用严格比较 `===`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `mixed` | 无 | 指定的对比值 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `includes($value, $message = "")` — 校验是否包含指定值

校验字符串是否包含子串，或数组是否包含指定元素。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string\|array` | 无 | 任意基本类型值或任意基本类型数组 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `hasKeys($value, $message = "")` — 校验数组是否存在指定键

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string\|string[]` | 无 | 键名或键名数组 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `min($value, $message = "")` — 校验数值是否大于等于指定值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int` | 无 | 指定的最小值 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `max($value, $message = "")` — 校验数值是否小于等于指定值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int` | 无 | 指定的最大值 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `range($min, $max, $message = "")` — 校验数值是否在 `[min, max]` 范围内

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$min` | `int` | 无 | 最小值 |
| `$max` | `int` | 无 | 最大值 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `minLength($value, $message = "")` — 校验长度是否大于等于指定值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int` | 无 | 指定的最小长度 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `maxLength($value, $message = "")` — 校验长度是否小于等于指定值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int` | 无 | 指定的最大长度 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `length($min, $max, $message = "")` — 校验长度是否在 `[min, max]` 范围内

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$min` | `int` | 无 | 最小长度 |
| `$max` | `int` | 无 | 最大长度 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `pattern($pattern, $message = "")` — 正则表达式校验

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$pattern` | `string` | 无 | 正则表达式 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `custom($callback)` — 自定义校验

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `\Closure\|callable` | 无 | 校验函数，返回值必须是继承自 `Response` 的实例 |

**返回值**

- `$this`：支持链式调用。

### `useRule(RuleInterface $validateRule)` — 复用已有的校验规则实例

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$validateRule` | `RuleInterface` | 无 | 校验规则实例 |

**返回值**

- `$this`：支持链式调用。

### `email($message = "")` — 校验值是否为有效邮箱地址

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `url($message = "")` — 校验值是否为有效 URL 地址

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `ip($message = "")` — 校验值是否为有效 IP 地址

支持 IPv4 和 IPv6。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `date($message = "")` — 校验值是否为有效日期字符串

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `dateFormat($format, $message = "")` — 校验值是否符合指定日期格式

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$format` | `string` | 无 | 日期格式，如 `Y-m-d`、`Y-m-d H:i:s` |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `in($values, $message = "")` — 校验值是否在给定值列表中

可变参数：支持 `in('a', 'b', 'c')` 或 `in(['a', 'b', 'c'], 'message')`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$values` | `array\|string` | 无 | 值列表或数组+消息 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `notIn($values, $message = "")` — 校验值是否不在给定值列表中

可变参数：支持 `notIn('a', 'b', 'c')` 或 `notIn(['a', 'b', 'c'], 'message')`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$values` | `array\|string` | 无 | 值列表或数组+消息 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `confirmed($message = "")` — 校验值是否与确认字段一致

校验字段的值与 `字段名_confirmation` 的值是否一致，常用于密码确认。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `same($field, $message = "")` — 校验值与另一字段相同

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$field` | `string` | 无 | 另一个字段名 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `different($field, $message = "")` — 校验值与另一字段不同

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$field` | `string` | 无 | 另一个字段名 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `nullable($message = "")` — 允许字段值为 null

值为 `null` 时跳过后续所有校验规则，直接通过。本规则不产生错误，`$message` 仅用于兼容接口。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息（兼容接口，实际不使用） |

**返回值**

- `$this`：支持链式调用。

### `present($message = "")` — 允许字段值为空字符串

值为空字符串时跳过后续所有校验规则，直接通过。本规则不产生错误，`$message` 仅用于兼容接口。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息（兼容接口，实际不使用） |

**返回值**

- `$this`：支持链式调用。

### `prohibited($message = "")` — 校验字段不能存在于输入数据中

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `requiredIf($anotherField, $values, $message = "")` — 条件必填

当另一个字段的值等于指定值时，此字段为必填。可变参数：支持 `requiredIf('status', ['active', 'pending'], 'message')` 或 `requiredIf('status', 'active', 'pending')`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$anotherField` | `string` | 无 | 另一个字段名 |
| `$values` | `array\|string` | 无 | 指定值或值列表 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。

### `requiredUnless($anotherField, $values, $message = "")` — 条件必填（除非）

除非另一个字段的值等于指定值，否则此字段为必填。可变参数：支持 `requiredUnless('status', ['draft'], 'message')` 或 `requiredUnless('status', 'draft')`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$anotherField` | `string` | 无 | 另一个字段名 |
| `$values` | `array\|string` | 无 | 指定值或值列表 |
| `$message` | `string` | `""` | 校验失败时的报错信息 |

**返回值**

- `$this`：支持链式调用。
