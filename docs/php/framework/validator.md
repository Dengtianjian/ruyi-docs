# Validator — 数据校验器

Validator 提供灵活、可链式调用的数据校验功能，涵盖类型、长度、范围、格式、关联字段、通配符、条件规则等 30 余种规则，支持自定义校验与规则复用。既可校验单个值，也可对关联数组的每个字段逐一校验，还能对嵌套/索引数组递归校验。

- **命名空间**: `kernel\Foundation\Validation`
- **文件位置**: `kernel/Foundation/Validation/`

## 文档结构

本校验器文档拆分为四篇：

| 文档 | 内容 |
|------|------|
| [Validator 校验器（本篇）](./validator.md) | 总览、快速上手、Validator 类 API、结果结构、架构 |
| [校验规则详解](./validation/rules.md) | 全部 30+ 条规则的签名、示例、错误码 |
| [关联数组校验](./validation/array-rules.md) | Rules 字段映射、点号/通配符、条件规则 |
| [使用场景示例](./validation/examples.md) | 控制器声明、手动校验、自定义等完整示例 |

## 核心类

| 类 | 角色 | 说明 |
|------|------|------|
| `Rule` | 单字段规则门面 | 支持静态/实例链式调用，委托到 `RuleBuilder` |
| `Rules` | 关联数组规则 | 继承 `Rule`，管理字段→规则的映射 |
| `RuleInterface` | 规则契约接口 | 定义所有规则方法的完整契约 |
| `RuleBuilder` | 规则构建器 | `RuleInterface` 的默认实现，持有规则数据 |
| `Validator` | 校验引擎 | 消费 Rule/Rules 实例执行校验逻辑 |

## 快速上手

```php
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Validator;

// 静态入口与实例入口等价，推荐静态入口
$rule = Rule::required('必填')->type('string')->length(1, 100);

$validator = new Validator($rule, 'hello');
$result = $validator->validate();

if ($result->error) {
    echo $result->errorCode();     // "400:ValidateFailed:Required"
    echo $result->errorMessage();  // "必填"
} else {
    // $result->getData() === true，校验通过
}
```

### 两种规则定义方式

```php
// 方式一：静态链式（推荐）
$rule = Rule::required()->type('string')->minLength(3);

// 方式二：实例链式
$rule = (new Rule())->required()->type('string')->minLength(3);

// 方式三：直接操作规则数据
$rule = new Rule();
$rule->rule = ['required' => true, 'type' => 'string'];
$rule->errorMessages = ['required' => '必填'];
```

三种方式完全等价，最终都通过 `$rule->rule` 与 `$rule->errorMessages` 两个属性驱动校验。

## Validator 方法

### `__construct(Rule $rule, $data = null, $fullData = null)`

构建校验器。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$rule` | `Rule` | 校验规则实例（`Rule` 或 `Rules`） |
| `$data` | `mixed` | 待校验的数据 |
| `$fullData` | `mixed` | 完整数据集（跨字段校验时必需，如 `confirmed`/`same`/`different`） |

```php
// 校验单个值
$validator = new Validator(Rule::required()->type('string'), 'hello');

// 校验字段 + 完整数据集（跨字段规则使用）
$validator = new Validator(
    Rule::required()->confirmed('两次密码不一致'),
    '123456',
    ['password' => '123456', 'password_confirmation' => '123456']
);
```

### `data($data): Validator`

设置要校验的数据，返回 `$this` 支持链式调用。

```php
$validator->data('hello')->validate();
$validator->data('world')->validate();  // 可复用同一规则校验多个值
```

### `fullData($data): Validator`

设置完整数据集。当被校验数据是数组中的某个字段时，传入整个数组，供跨字段规则（`same`、`confirmed`、`requiredIf` 等）取值。

```php
$validator = new Validator(Rule::same('confirm_email'));
$validator->data('a@b.com')
    ->fullData(['email' => 'a@b.com', 'confirm_email' => 'a@b.com'])
    ->validate();
```

### `setFieldName($name): Validator`

设置当前校验的字段名。`confirmed` 规则依赖字段名生成 `字段名_confirmation`。在 `Rules` 关联数组场景下框架会自动设置，手动校验时需显式调用：

```php
$validator = new Validator(Rule::confirmed('两次密码不一致'), '123456', [
    'password' => '123456',
    'password_confirmation' => '123456',
]);
$validator->setFieldName('password')->validate();  // 通过
```

### `getErrorMessage($key): string`

获取指定规则的错误信息；未设置时返回默认值 `"参数错误"`。

```php
$validator = new Validator(Rule::required('用户名必填'), null);
echo $validator->getErrorMessage('required');  // "用户名必填"
echo $validator->getErrorMessage('type');      // "参数错误"（未设置）
```

### `validate(): Result`

执行校验并返回 `Result` 实例：
- 校验通过：`$result->error === false`，`$result->getData()` 为 `true`
- 校验失败：`$result->error === true`，可通过 `errorCode()`、`errorMessage()`、`errorDetails()` 获取详情

`validate()` 会先处理条件规则（`sometimes`），随后按顺序执行全部规则，命中首个失败规则即短路返回。

### `ReturnParamError(): Result`

返回通用"参数错误"结果（`400:ValidateFailed:ParamError`）。内部在参数类型不合法时调用（如 `min` 规则遇到数组、`hasKeys` 遇到非数组等）。

```php
$result = $validator->ReturnParamError();
echo $result->errorCode();     // "400:ValidateFailed:ParamError"
echo $result->errorMessage();  // "参数错误"
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

**校验失败**（`required` 为例）：
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

每条规则失败时 `details` 携带不同的诊断字段，详见[校验规则详解](./validation/rules.md)中对应规则。

## 架构设计

```
Rule (门面)  ──委托──▶  RuleBuilder (构建器)  ──实现──▶  RuleInterface (契约)
    │                         │
    │                         ├── $rule          (规则数据)
    │                         └── $errorMessages (错误信息)
    │
    └── Rules (继承 Rule，扩展字段映射、点号/通配符、条件规则)

Validator (引擎)  ──消费──▶  Rule / Rules   ──输出──▶  Result
```

- `Rule` 是门面，通过 `__call` / `__callStatic` / `__get` / `__set` 透明代理到 `RuleBuilder`
- `Rules extends Rule`，在继承链式调用能力的基础上增加关联数组字段管理
- `Validator` 读取 `$rule` / `$errorMessages` 属性执行校验，支持规则短路、通配符展开、条件规则合并
- 校验结果统一为 [`Result`](./result.md)，与框架错误体系无缝衔接

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Controller](./controller.md) | 集成 | `$requestQueryValidator` / `$requestBodyValidator` 自动校验 |
| [Result](./result.md) | 返回值 | `validate()` 返回 Result，供控制器统一处理 |
| [Arr](./arr.md) | 使用 | 点号取值（`Arr::get`）、关联数组判断（`Arr::isAssoc`） |
| [Numeric](./numeric.md) | 使用 | 数值归一化（`Numeric::val`） |

## 下一步

- 查看全部校验规则 → [校验规则详解](./validation/rules.md)
- 校验整个数组 → [关联数组校验](./validation/array-rules.md)
- 控制器/手动/自定义场景 → [使用场景示例](./validation/examples.md)
