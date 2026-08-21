# Rule — 校验规则门面类

- **文件位置**: `kernel/Foundation/Validation/Rule.php`
- **命名空间**: `kernel\Foundation\Validation`
- **是否可继承**: 是

提供流式 API 定义数据校验规则，支持静态调用和实例调用两种方式。所有规则定义方法委托给 `RuleBuilder` 执行，通过 `__call()` 和 `__callStatic()` 实现链式委托；规则状态（`Rule`、`ErrorMessages` 等）通过 `__get()` / `__set()` 透明代理到构建器。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$builder` | `RuleBuilder` | `null` | protected | 规则构建器实例，承载全部规则定义方法，延迟初始化 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `builder()` | 获取构建器实例（延迟初始化） |
| `__get($name)` | 属性读取代理，转发到构建器 |
| `__set($name, $value)` | 属性写入代理，转发到构建器 |
| `__isset($name)` | 属性存在性检查代理 |
| `__callStatic($name, $arguments)` | 静态方法委托，支持 `Rule::required()` 等静态链式调用 |
| `__call($name, $arguments)` | 实例方法委托，转发给 `RuleBuilder` 执行 |

## 方法

### `builder()` — 获取构建器实例

> protected。延迟初始化 `RuleBuilder`。

**参数**

- 无。

**返回值**

- `RuleBuilder`：构建器实例。

### `__get($name)` — 属性读取代理

将属性读取透明转发到内部 `RuleBuilder` 实例，外部可通过 `$rules->rule`、`$rules->errorMessages` 等方式访问构建器状态。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 属性名 |

**返回值**

- `mixed`：属性值；构建器上不存在该属性时返回 `null`。

### `__set($name, $value)` — 属性写入代理

将属性写入透明转发到内部 `RuleBuilder` 实例。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 属性名 |
| `$value` | `mixed` | 无 | 属性值 |

**返回值**

- 无。

### `__isset($name)` — 属性存在性检查代理

检查属性是否存在于内部构建器上。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 属性名 |

**返回值**

- `bool`：构建器上存在该属性返回 `true`，否则 `false`。

### `__callStatic($name, $arguments)` — 静态方法委托

创建当前类实例后委托给 `__call()` 执行，从而复用同一条委托链路。支持 `Rule::required()` 等静态链式调用。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 方法名 |
| `$arguments` | `array` | 无 | 方法参数 |

**返回值**

- `static`：链式调用的 `Rule` 实例。

**示例**

```php
$rules = Rule::required('必填')->type('string')->length(1, 100);
```

### `__call($name, $arguments)` — 实例方法委托

将任意方法调用转发给 `RuleBuilder` 执行。构建器的链式方法返回自身时，替换为当前 `Rule` 实例，确保调用者始终拿到 `Rule` 而非内部构建器。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 方法名 |
| `$arguments` | `array` | 无 | 方法参数 |

**返回值**

- `$this|mixed`：链式调用返回 `$this`，终端方法返回实际结果。

**示例**

```php
$rules = (new Rule())->required('必填')->in(['a', 'b']);
```

## 可用的规则定义方法

以下方法均由 `__call`/`__callStatic` 委托给 `RuleBuilder`，支持实例与静态两种调用方式。

| 方法 | 签名 | 说明 |
|------|------|------|
| `required` | `required(string $message = "")` | 校验值是否为空或为 `null` |
| `type` | `type(string\|array $value, string $message = "")` | 校验数据类型，支持 `int`/`string`/`bool`/`array` 等，`int`/`bool` 自动转为 `integer`/`boolean` |
| `equal` | `equal(mixed $value, string $message = "")` | 校验值是否等于指定值（严格比较 `===`） |
| `includes` | `includes(string\|array $value, string $message = "")` | 校验字符串是否包含子串，或数组是否包含指定元素 |
| `hasKeys` | `hasKeys(string\|array $value, string $message = "")` | 校验数组是否存在指定键名 |
| `min` | `min(int $value, string $message = "")` | 校验数值是否 >= 指定值 |
| `max` | `max(int $value, string $message = "")` | 校验数值是否 <= 指定值 |
| `range` | `range(int $min, int $max, string $message = "")` | 校验数值是否在 `[min, max]` 范围内 |
| `minLength` | `minLength(int $value, string $message = "")` | 校验字符串/数组长度是否 >= 指定值 |
| `maxLength` | `maxLength(int $value, string $message = "")` | 校验字符串/数组长度是否 <= 指定值 |
| `length` | `length(int $min, int $max, string $message = "")` | 校验字符串/数组长度是否在 `[min, max]` 范围内 |
| `pattern` | `pattern(string $pattern, string $message = "")` | 正则表达式校验 |
| `custom` | `custom(\Closure\|callable $callback)` | 自定义校验，回调签名 `function(mixed $value, array $rule, mixed $data): Response` |
| `useRule` | `useRule(RuleInterface $validateRule)` | 复用已有的校验规则实例 |
| `email` | `email(string $message = "")` | 校验值是否为有效的邮箱地址 |
| `url` | `url(string $message = "")` | 校验值是否为有效的 URL 地址 |
| `ip` | `ip(string $message = "")` | 校验值是否为有效的 IP 地址（支持 IPv4 和 IPv6） |
| `date` | `date(string $message = "")` | 校验值是否为有效的日期字符串 |
| `dateFormat` | `dateFormat(string $format, string $message = "")` | 校验值是否符合指定的日期格式 |
| `in` | `in(array\|string ...$values)` | 校验值是否在给定的值列表中，支持 `in(['a','b'], 'msg')` 或 `in('a','b','c')` |
| `notIn` | `notIn(array\|string ...$values)` | 校验值是否不在给定的值列表中 |
| `confirmed` | `confirmed(string $message = "")` | 校验值是否与 `字段名_confirmation` 一致 |
| `same` | `same(string $field, string $message = "")` | 校验值是否与另一个字段的值相同 |
| `different` | `different(string $field, string $message = "")` | 校验值是否与另一个字段的值不同 |
| `nullable` | `nullable(string $message = "")` | 允许值为 `null`，值为 `null` 时跳过所有校验 |
| `present` | `present(string $message = "")` | 允许值为空字符串，值为空字符串时跳过所有校验 |
| `prohibited` | `prohibited(string $message = "")` | 校验字段不能存在于输入数据中 |
| `requiredIf` | `requiredIf(string $anotherField, array\|string $values, string $message = "")` | 当另一字段等于指定值时必填 |
| `requiredUnless` | `requiredUnless(string $anotherField, array\|string $values, string $message = "")` | 除非另一字段等于指定值，否则必填 |

详细说明请参见 [rule-builder.md](rule-builder.md)。
