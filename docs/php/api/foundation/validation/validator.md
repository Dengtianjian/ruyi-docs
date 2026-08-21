# Validator — 校验器

- **文件位置**: `kernel/Foundation/Validation/Validator.php`
- **命名空间**: `kernel\Foundation\Validation`
- **是否可继承**: 是

执行规则校验，支持通配符字段、条件规则、错误消息收集。构造时接收一个 `Rule`（或其子类 `Rules`）实例与待校验数据，通过 `validate()` 返回 `Result`。

对于单个字段，直接传入 `Rule`；对于关联数组，传入 `Rules`（含通配符、条件规则支持）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$rule` | `array` | `null` | protected | 从校验规则类实例取到的规则定义（`Rule::$rule` 代理），键为规则名，值为规则参数 |
| `$data` | `mixed` | `null` | protected | 要校验的数据 |
| `$fullData` | `mixed` | `null` | protected | 全数据。被校验数据可能是数组里的某个元素，此变量存被校验数据所属的数组，供条件规则引用其他字段 |
| `$errorMessages` | `array` | `[]` | protected | 从校验规则类实例取到的错误信息映射，键为规则名 |
| `$validateRule` | `Rule` | `null` | protected | 校验规则类实例 |
| `$fieldName` | `string\|null` | `null` | protected | 当前校验的字段名，Rules 关联数组场景下由外部设置 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($validateRule, $data, $fullData)` | 构建校验器 |
| `data($data)` | 设置要校验的数据 |
| `fullData($data)` | 设置被校验数据所属的数据集 |
| `getErrorMessage($key)` | 获取校验失败错误信息 |
| `setFieldName($name)` | 设置当前字段名 |
| `validate()` | 执行校验，返回 `Result` |
| `ReturnParamError()` | 返回参数错误 `Result` |
| `applyConditionalRules($rules, $data)` | 应用条件规则（protected） |
| `validateWildcardField($data, $fieldName, $fieldRule, $parentData)` | 通配符字段展开校验（protected） |
| `check($target, $rule, $validateRule, $data)` | 核心校验逻辑（protected） |
| `getTargetLength($target)` | 获取目标值长度（private） |

## 方法

### `__construct(Rule $validateRule, $data = null, $fullData = null)` — 构建校验器

提取规则实例的规则定义与错误信息，并保存待校验数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$validateRule` | `Rule` | 无 | 校验规则实例，必须是 `Rule`（含其子类 `Rules`），否则抛异常 |
| `$data` | `mixed` | `null` | 要校验的数据 |
| `$fullData` | `mixed` | `null` | 被校验数据所属的完整数据集，供条件规则 / 跨字段规则（如 `same`/`requiredIf`）引用其他字段 |

**返回值**

- 无。

**示例**

```php
use kernel\Foundation\Validation\Validator;
use kernel\Foundation\Validation\Rule;

$rule = Rule::required('姓名必填')->type('string')->length(1, 50);
$validator = new Validator($rule, "张三");
```

### `data($data)` — 设置要校验的数据

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | 无 | 被校验的数据 |

**返回值**

- `Validator`：当前实例（支持链式调用）。

### `fullData($data)` — 设置被校验数据所属的数据集

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | 无 | 被校验数据所属的完整数据集 |

**返回值**

- `Validator`：当前实例（支持链式调用）。

### `getErrorMessage($key)` — 获取校验失败错误信息

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 错误信息键（规则名，如 `required`/`type`），传 `null` 时也取不到任何映射键则返回兜底文案 |

**返回值**

- `string`：错误信息文案。键不存在时返回默认文案 `"参数错误"`。

### `setFieldName($name)` — 设置当前字段名

供 `Rules` 关联数组场景使用，用于 `confirmed` 规则构造 `字段名_confirmation` 以及跨字段取值的定位。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 当前字段名称 |

**返回值**

- `$this`：当前实例（支持链式调用）。

### `validate()` — 执行校验

先应用条件规则（`sometimes`），随后执行核心校验，最后把校验结果布尔值写入 `Result` 的 `validated` 数据键。

**参数**

- 无。

**返回值**

- `Result`：校验结果。失败时 `->error` 为真，且 `->data['validated']` 为 `false`；成功时 `->data['validated']` 为 `true`。

**示例**

```php
use kernel\Foundation\Validation\Validator;
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Rules;

$rules = new Rules([
    'name' => Rule::required('姓名必填')->type('string')->length(1, 50),
    'age'  => Rule::required()->type('integer')->range(0, 150),
]);

$validator = new Validator($rules, ['name' => '张三', 'age' => 20]);
$result = $validator->validate();
if ($result->error) {
    // 校验失败
}
```

### `ReturnParamError()` — 返回参数错误

返回一个统一的参数校验错误 `Result`，状态码 400，错误码 `400:ValidateFailed:ParamError`，错误信息取 `getErrorMessage(null)`。

**参数**

- 无。

**返回值**

- `Result`：参数错误的 `Result` 实例。

### `applyConditionalRules(Rules $rules, $data)` — 应用条件规则

> protected。遍历 `Rules` 上的条件规则，执行回调（传入完整数据），回调返回 `true` 时将条件规则合并到主规则列表。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$rules` | `Rules` | 无 | `Rules` 实例 |
| `$data` | `mixed` | 无 | 完整数据，用于回调判断 |

**返回值**

- 无。

### `validateWildcardField($data, $fieldName, Rule $fieldRule, $parentData)` — 通配符字段展开校验

> protected。将 `photos.*.url` 这类含 `*` 的字段名展开，逐一校验每个元素的对应字段。路径不存在或中间层不是数组时直接返回成功（跳过）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | 无 | 完整数据 |
| `$fieldName` | `string` | 无 | 含 `*` 的字段名，如 `photos.*.url` |
| `$fieldRule` | `Rule` | 无 | 该字段的校验规则 |
| `$parentData` | `mixed` | 无 | 父级数据，用于子校验器的 `fullData` |

**返回值**

- `Result`：校验结果。

### `check($target, $rule, $validateRule, $data)` — 核心校验逻辑

> protected。按规则定义逐条校验：`required`/`requiredIf`/`requiredUnless`/`nullable`/`present`/`type`/`min`/`max`/`range`/`minLength`/`maxLength`/`length`/`equal`/`includes`/`hasKeys`/`pattern`/`email`/`url`/`ip`/`date`/`dateFormat`/`in`/`notIn`/`confirmed`/`same`/`different`/`CustomValidate`/`use`。若 `$validateRule` 是 `Rules` 实例，则按字段逐一递归校验（含通配符展开）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$target` | `mixed` | 无 | 校验的值 |
| `$rule` | `array` | 无 | 校验规则定义 |
| `$validateRule` | `Rule` | `null` | 校验规则实例，用于识别 `Rules` 场景 |
| `$data` | `mixed` | `null` | 完整数据集，供跨字段规则取值 |

**返回值**

- `Result`：校验结果。

### `getTargetLength($target)` — 获取目标值长度

> private。字符串取字符数（优先 `mb_strlen` 多字节安全），数组取元素个数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$target` | `mixed` | 无 | 目标值 |

**返回值**

- `int`：目标值长度。
