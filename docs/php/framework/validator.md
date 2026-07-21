# Validation — 数据校验

Validation 提供灵活、可链式调用的数据校验功能，涵盖类型、长度、范围、格式、关联字段等 30 余种规则，并支持自定义校验与条件规则。

- **命名空间**: `kernel\Foundation\Validation`
- **文件位置**: `kernel/Foundation/Validation/`
- **核心类**: `Rule`（单字段规则）、`Rules`（关联数组规则）、`Validator`（校验引擎）

## 快速上手

```php
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Validator;

$rule = (new Rule())->required('必填')->type('string')->length(1, 100);
$validator = new Validator($rule, 'hello');
$result = $validator->validate();

if ($result->error) {
    // 校验失败
    echo $result->errorCode();     // 如 "400:ValidateFailed:Required"
    echo $result->errorMessage();  // 如 "必填"
}
```

## Validator 方法

### `__construct(Rule $rule, $data = null, $fullData = null)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `$rule` | `Rule` | 校验规则实例 |
| `$data` | `mixed` | 待校验的数据 |
| `$fullData` | `mixed` | 完整数据集（跨字段校验时必需，如 confirmed/same/different） |

### `data($data): Validator`

设置要校验的数据，返回 `$this` 支持链式调用。

### `fullData($data): Validator`

设置完整数据集。若数据是数组中的某个字段，传入整个数组以供跨字段规则（如 `same`、`confirmed`）使用。

### `validate(): ReturnResult`

执行校验并返回 `ReturnResult` 实例：
- 校验通过：`$result->error === false`，`$result->getData()` 为 `true`
- 校验失败：`$result->error === true`，可通过 `errorCode()`、`errorMessage()` 获取详情

### `ReturnParamError(): ReturnResult`

返回通用"参数错误"结果，内部在参数类型不合法时调用。

## 校验规则一览

> 以下方法在 `Rule` / `Rules` 上链式调用，所有方法签名中的最后一个参数 `$message` 均可省略（使用默认错误信息"参数错误"）。

### 基础校验

| 方法 | 签名 | 说明 |
|------|------|------|
| `required` | `required(string $message = "")` | 不能为 null、空字符串 `""` 或空数组 `[]`。数值 `0` 和字符串 `"0"` 视为有效值 |
| `nullable` | `nullable(string $message = "")` | 值为 `null` 时跳过后续所有校验规则 |
| `present` | `present(string $message = "")` | 值为空字符串 `""` 时跳过后续所有校验规则 |
| `prohibited` | `prohibited(string $message = "")` | 字段不能存在于输入数据中（仅关联数组场景生效）|

### 条件必填

| 方法 | 签名 | 说明 |
|------|------|------|
| `requiredIf` | `requiredIf(string $field, array\|string $values, string $message = "")` | 当另一字段的值在指定列表中时，本字段必填 |
| `requiredUnless` | `requiredUnless(string $field, array\|string $values, string $message = "")` | 除非另一字段的值在指定列表中，否则本字段必填 |

```php
// 当 type 为 'company' 时，company_name 必填
$rules = new Rules([
    'type'         => Rule::required()->in(['personal', 'company']),
    'company_name' => Rule::requiredIf('type', ['company'], '企业名必填')->type('string'),
]);
```

### 类型校验

| 方法 | 签名 | 说明 |
|------|------|------|
| `type` | `type(string\|array $type, string $message = "")` | 校验 PHP 原生类型。`int` 自动转为 `integer`，`bool` 自动转为 `boolean`。支持多类型：`['string', 'integer']` |

### 数值比较

| 方法 | 签名 | 说明 |
|------|------|------|
| `min` | `min(int $value, string $message = "")` | 数值 >= 指定最小值 |
| `max` | `max(int $value, string $message = "")` | 数值 <= 指定最大值 |
| `range` | `range(int $min, int $max, string $message = "")` | 数值在 [min, max] 闭区间内 |

### 长度校验

| 方法 | 签名 | 说明 |
|------|------|------|
| `minLength` | `minLength(int $value, string $message = "")` | 字符串/数组长度 >= 指定值。字符串使用 `mb_strlen`（优先）|
| `maxLength` | `maxLength(int $value, string $message = "")` | 字符串/数组长度 <= 指定值 |
| `length` | `length(int $min, int $max, string $message = "")` | 长度在 [min, max] 闭区间内 |

### 值比较

| 方法 | 签名 | 说明 |
|------|------|------|
| `equal` | `equal(mixed $value, string $message = "")` | 严格等于（`===`）指定值 |
| `in` | `in(array\|string ...$values)` | 值在给定列表中（严格比较）。支持 `in(['a','b'], 'msg')` 或 `in('a','b','c')` |
| `notIn` | `notIn(array\|string ...$values)` | 值不在给定列表中 |

### 包含与键名

| 方法 | 签名 | 说明 |
|------|------|------|
| `includes` | `includes(string\|array $value, string $message = "")` | 字符串包含子串，或数组包含指定元素 |
| `hasKeys` | `hasKeys(string\|array $keys, string $message = "")` | 数组包含指定键名 |

### 格式校验

| 方法 | 签名 | 说明 |
|------|------|------|
| `pattern` | `pattern(string $regex, string $message = "")` | 正则表达式匹配 |
| `email` | `email(string $message = "")` | 有效邮箱地址（基于 `filter_var` + `FILTER_VALIDATE_EMAIL`）|
| `url` | `url(string $message = "")` | 有效 URL（基于 `filter_var` + `FILTER_VALIDATE_URL`）|
| `ip` | `ip(string $message = "")` | 有效 IP 地址，支持 IPv4 和 IPv6（基于 `filter_var` + `FILTER_VALIDATE_IP`）|
| `date` | `date(string $message = "")` | 有效日期字符串（基于 `date_parse`，避免 `strtotime` 的边缘值歧义）|
| `dateFormat` | `dateFormat(string $format, string $message = "")` | 匹配指定格式，如 `Y-m-d`、`Y-m-d H:i:s`（基于 `DateTime::createFromFormat`）|

### 跨字段校验

| 方法 | 签名 | 说明 |
|------|------|------|
| `confirmed` | `confirmed(string $message = "")` | 值与 `字段名_confirmation` 字段的值一致（常用于密码确认）|
| `same` | `same(string $field, string $message = "")` | 值与另一个指定字段的值相同 |
| `different` | `different(string $field, string $message = "")` | 值与另一个指定字段的值不同 |

### 组合规则

| 方法 | 签名 | 说明 |
|------|------|------|
| `custom` | `custom(callable $callback)` | 自定义校验闭包，签名 `function($value, $rules, $data): Response` |
| `useRule` | `useRule(RuleInterface $rule)` | 复用已有的 Rule 实例，可多次调用叠加多个规则 |

## 使用场景

### 1. 在控制器中声明校验

通过 `$requestQueryValidator` / `$requestBodyValidator` 属性声明，框架在 `before()` 阶段自动执行校验：

```php
use kernel\Foundation\Controller\Controller;
use kernel\Foundation\Validation\Rule;

class RegisterController extends Controller
{
    protected $requestBodyValidator = [
        'username' => (new Rule())->required('用户名不能为空')
            ->type('string', '用户名必须是字符串')
            ->length(3, 20, '用户名长度 3-20 个字符'),
        'password' => (new Rule())->required('密码不能为空')
            ->type('string')
            ->minLength(6, '密码至少 6 个字符')
            ->confirmed('两次密码不一致'),
        'email'    => (new Rule())->type('string')
            ->email('邮箱格式不正确'),
    ];

    public function data()
    {
        // 校验通过才会执行到这里
        $username = $this->requestBody->get('username');
    }
}
```

### 2. 手动校验

```php
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Validator;

$rule = (new Rule())->required()->type('string')->minLength(2)->maxLength(50);

$validator = new Validator($rule, $inputName);
$result = $validator->validate();

if ($result->error) {
    return $this->response->error(
        $result->errorStatusCode(),
        $result->errorCode(),
        $result->errorMessage()
    );
}
```

### 3. 自定义错误信息

```php
// 链式传入
$rule = (new Rule())
    ->required('用户名不能为空')
    ->type('string', '用户名必须是字符串')
    ->minLength(3, '用户名至少 3 个字符');

// 或直接设置 errorMessages 属性
$rule = new Rule();
$rule->rule = ['required' => true, 'minLength' => 3];
$rule->errorMessages = [
    'required'  => '用户名不能为空',
    'minLength' => '用户名至少 3 个字符',
];
```

### 4. 关联数组校验（Rules）

```php
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Rules;

// 为每个字段定义独立规则
$arrayRule = new Rules([
    'name' => (new Rule())->required()->type('string')->length(1, 50),
    'age'  => (new Rule())->required()->type('integer')->range(0, 150),
    'tags' => (new Rule())->type('array')->hasKeys(['color', 'size']),
]);

$validator = new Validator($arrayRule, $input);
```

### 5. 通配符字段

`Rules` 支持 `*` 通配符，对数组的每个元素递归校验：

```php
$rules = new Rules([
    'photos.*.url'  => (new Rule())->required()->url(),
    'photos.*.size' => (new Rule())->type('integer')->min(0),
]);
```

### 6. 条件规则（sometimes）

仅在回调返回 `true` 时才将规则加入校验：

```php
$rules = new Rules([
    'type'         => Rule::required()->in(['personal', 'company']),
    'company_name' => Rule::type('string')->length(1, 100),
]);

// 仅当 type === 'company' 时才校验 company_name
$rules->sometimes('company_name', Rule::required('企业名必填'), function ($data) {
    return ($data['type'] ?? '') === 'company';
});
```

### 7. 自定义校验函数

```php
use kernel\Foundation\ReturnResult\ReturnResult;

$rule = (new Rule())->required()->type('string')->custom(function ($value, $rules, $data) {
    if (strlen($value) < 3) {
        return ReturnResult::failed(400, '400001', '自定义校验失败');
    }
    // 校验通过：可以返回 succeeded()，也可以什么都不返回
});
```

> 回调返回 `ReturnResult` 且 `$error` 为 `true` 时视为校验失败；返回其他值或不返回均视为校验通过。

### 8. 组合多个规则

```php
$baseRule = (new Rule())->required()->type('string');
$extendedRule = (new Rule())
    ->useRule($baseRule)
    ->minLength(3, '至少 3 个字符')
    ->maxLength(50, '最多 50 个字符');
```

## 校验结果结构

**校验通过**：
```json
{
    "statusCode": 200,
    "code": 200,
    "data": true,
    "message": "ok"
}
```

**校验失败**：
```json
{
    "statusCode": 400,
    "code": "400:ValidateFailed:Required",
    "data": false,
    "message": "用户名不能为空",
    "details": {
        "value": null,
        "empty": true,
        "null": true
    }
}
```

## 错误码一览

| 错误码 | 触发规则 |
|--------|---------|
| `400:ValidateFailed:Required` | `required` |
| `400:ValidateFailed:RequiredIf` | `requiredIf` |
| `400:ValidateFailed:RequiredUnless` | `requiredUnless` |
| `400:ValidateFailed:Type` | `type` |
| `400:ValidateFailed:Minimun` | `min` |
| `400:ValidateFailed:Maximun` | `max` |
| `400:ValidateFailed:Range` | `range` |
| `400:ValidateFailed:MinimumLength` | `minLength` |
| `400:ValidateFailed:MaximumLength` | `maxLength` |
| `400:ValidateFailed:Length` | `length` |
| `400:ValidateFailed:Equal` | `equal` |
| `400:ValidateFailed:Includes` | `includes` |
| `400:ValidateFailed:HasKeys` | `hasKeys` |
| `400:ValidateFailed:Pattern` | `pattern` |
| `400:ValidateFailed:Email` | `email` |
| `400:ValidateFailed:Url` | `url` |
| `400:ValidateFailed:Ip` | `ip` |
| `400:ValidateFailed:Date` | `date` |
| `400:ValidateFailed:DateFormat` | `dateFormat` |
| `400:ValidateFailed:In` | `in` |
| `400:ValidateFailed:NotIn` | `notIn` |
| `400:ValidateFailed:Confirmed` | `confirmed` |
| `400:ValidateFailed:Same` | `same` |
| `400:ValidateFailed:Different` | `different` |
| `400:ValidateFailed:ParamError` | 参数类型不合法 |
| `400:ValidateFailed:Array` | 预期数组但传入非数组 |

## 类关系

| 类 | 角色 | 说明 |
|------|------|------|
| [`Rule`](#) | 单字段规则门面 | 通过魔术方法委托到 `RuleBuilder`，支持静态/实例链式调用 |
| [`Rules`](#) | 关联数组规则 | 继承 `Rule`，管理字段→规则的映射，支持通配符和条件规则 |
| [`RuleInterface`](#) | 规则契约接口 | 定义所有规则方法的完整契约 |
| [`RuleBuilder`](#) | 规则构建器 | `RuleInterface` 的默认实现，持有规则数据 |
| [`Validator`](#) | 校验引擎 | 消费 Rule/Rules 实例执行校验逻辑 |

## 架构设计

```
Rule (门面)  ──委托──▶  RuleBuilder (构建器)  ──实现──▶  RuleInterface (契约)
    │                         │
    │                         ├── $rule          (规则数据)
    │                         └── $errorMessages (错误信息)
    │
    └── Rules (继承 Rule，扩展字段映射、条件规则、通配符)

Validator (引擎)  ──消费──▶  Rule / Rules   ──输出──▶  ReturnResult
```

- `Rule` 是门面，通过 `__call` / `__get` / `__set` 透明代理到 `RuleBuilder`
- `Rules extends Rule`，在继承链式调用能力的基础上增加关联数组字段管理
- `Validator` 读取 `$rule` / `$errorMessages` 属性执行校验
