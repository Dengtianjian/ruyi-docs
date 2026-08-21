# Rules — 关联数组校验规则

- **文件位置**: `kernel/Foundation/Validation/Rules.php`
- **命名空间**: `kernel\Foundation\Validation`
- **继承自**: `Rule`
- **是否可继承**: 是

用于定义关联数组中每个字段的校验规则，每个字段对应一个 `Rule` 实例。继承自 `Rule`，因此同样支持流式链式调用定义自身级别的规则。`Rules` 额外提供字段规则管理、通配符、条件规则（Laravel 风格 `sometimes`）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$fieldRules` | `array<string, Rule>` | `[]` | private | 字段规则映射，结构为 `[字段名 => Rule 实例]` |
| `$conditionalRules` | `array` | `[]` | private | 条件规则列表，结构为 `[['attribute' => string, 'rule' => Rule, 'callback' => callable], ...]`，仅当回调返回 `true` 时才参与校验 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($fieldRules)` | 构建关联数组校验规则实例 |
| `has($key)` | 检查是否存在指定字段的校验规则 |
| `get($key)` | 获取指定字段的校验规则 |
| `all()` | 获取全部字段校验规则 |
| `sometimes($attribute, $rule, $callback)` | 添加条件规则 |
| `getConditionalRules()` | 获取所有条件规则 |
| `addRule($attribute, $rule)` | 动态添加字段规则 |
| `hasWildcard()` | 判断是否含通配符 `*` 字段 |
| `wildcardRules()` | 获取含通配符的字段规则集合 |

## 方法

### `__construct($fieldRules = null)` — 构建关联数组校验规则实例

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fieldRules` | `array<string, Rule>` | `null` | 字段名到校验规则的映射，必须是关联数组；值为 `null` 时允许空构造 |

**异常**

- `Exception`：传入非数组、非关联数组，或规则值不是 `Rule` 实例时抛出。

**返回值**

- 无。

**示例**

```php
use kernel\Foundation\Validation\Rules;
use kernel\Foundation\Validation\Rule;

$rules = new Rules([
    'name' => Rule::required('姓名必填')->type('string')->length(1, 50),
    'age'  => Rule::required('年龄必填')->type('integer')->range(0, 150),
]);
```

### `has($key)` — 检查是否存在指定字段的校验规则

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 字段名称 |

**返回值**

- `bool`：字段存在校验规则返回 `true`，否则 `false`。

### `get($key)` — 获取指定字段的校验规则

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 字段名称 |

**返回值**

- `Rule|null`：该字段的规则实例；不存在时返回 `null`。

### `all()` — 获取全部字段校验规则

**参数**

- 无。

**返回值**

- `array<string, Rule>`：全部字段规则映射。

### `sometimes($attribute, Rule $rule, callable $callback)` — 添加条件规则

仅在回调返回 `true` 时才将该字段的规则加入校验。回调签名为 `function(array $data): bool`，接收完整数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$attribute` | `string` | 无 | 字段名（支持点号语法） |
| `$rule` | `Rule` | 无 | 校验规则实例 |
| `$callback` | `callable` | 无 | 条件判断回调，返回 `bool` |

**返回值**

- `$this`：当前实例（支持链式调用）。

**示例**

```php
$rules = new Rules(['discount' => Rule::required()]);
$rules->sometimes('discount', Rule::range(1, 100), function (array $data) {
    return isset($data['has_discount']) && $data['has_discount'];
});
```

### `getConditionalRules()` — 获取所有条件规则

**参数**

- 无。

**返回值**

- `array`：条件规则列表。

### `addRule($attribute, Rule $rule)` — 动态添加字段规则

供 `Validator` 在合并条件规则时使用。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$attribute` | `string` | 无 | 字段名 |
| `$rule` | `Rule` | 无 | 校验规则实例 |

**返回值**

- `$this`：当前实例（支持链式调用）。

### `hasWildcard()` — 判断是否有字段名包含通配符

**参数**

- 无。

**返回值**

- `bool`：任一字段名含 `*` 返回 `true`，否则 `false`。

### `wildcardRules()` — 获取包含通配符的字段规则集合

**参数**

- 无。

**返回值**

- `array<string, Rule>`：含通配符的字段规则集合。

---

> 以下方法继承自 `Rule`，请参见 [rule.md](rule.md)。

## 继承的链式规则方法（由 `Rule` 通过 `__call`/`__callStatic` 委托给 `RuleBuilder`）

| 方法 | 说明 |
|------|------|
| `required($message = "")` | 校验值是否为空或为 `null` |
| `type($value, $message = "")` | 校验数据类型 |
| `equal($value, $message = "")` | 校验是否等于指定值 |
| `includes($value, $message = "")` | 校验是否包含指定值 |
| `hasKeys($value, $message = "")` | 校验数组是否存在指定键 |
| `min($value, $message = "")` | 校验数值是否 >= 指定值 |
| `max($value, $message = "")` | 校验数值是否 <= 指定值 |
| `range($min, $max, $message = "")` | 校验数值是否在指定范围内 |
| `minLength($value, $message = "")` | 校验长度 >= 指定值 |
| `maxLength($value, $message = "")` | 校验长度 <= 指定值 |
| `length($min, $max, $message = "")` | 校验长度在 `[min, max]` 范围内 |
| `pattern($pattern, $message = "")` | 正则表达式校验 |
| `email($message = "")` | 校验值是否为有效邮箱地址 |
| `url($message = "")` | 校验值是否为有效 URL |
| `ip($message = "")` | 校验值是否为有效 IP |
| `date($message = "")` | 校验值是否为有效日期字符串 |
| `dateFormat($format, $message = "")` | 校验值是否符合指定日期格式 |
| `in(...$values)` | 校验值是否在给定值列表中 |
| `notIn(...$values)` | 校验值是否不在给定值列表中 |
| `confirmed($message = "")` | 校验值是否与 `字段名_confirmation` 一致 |
| `same($field, $message = "")` | 校验值是否与另一字段相同 |
| `different($field, $message = "")` | 校验值是否与另一字段不同 |
| `nullable($message = "")` | 允许值为 `null` |
| `present($message = "")` | 允许值为空字符串 |
| `prohibited($message = "")` | 校验字段不能存在于输入数据中 |
| `requiredIf($anotherField, $values, $message = "")` | 当另一字段等于指定值时必填 |
| `requiredUnless($anotherField, $values, $message = "")` | 除非另一字段等于指定值否则必填 |
| `custom($callback)` | 自定义校验 |
| `useRule(RuleInterface $validateRule)` | 复用已有的校验规则实例 |
