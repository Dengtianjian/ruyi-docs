# Validation 校验

- **目录位置**: `kernel/Foundation/Validation/`
- **命名空间**: `kernel\Foundation\Validation`

数据校验体系：`RuleInterface`（规则接口）、`Rule`（规则基类）、`Rules`（内置规则集）、`RuleBuilder`（链式构建器）、`Validator`（校验器）。

## RuleInterface — 规则接口

- **文件位置**: `kernel/Foundation/Validation/RuleInterface.php`
- **命名空间**: `kernel\Foundation\Validation`

校验规则的统一接口，自定义规则需实现它。

```php
use kernel\Foundation\Validation\RuleInterface;

class MyRule implements RuleInterface
{
    public function passes($value, $params): bool { /* ... */ }
    public function message($field, $params): string { /* ... */ }
}
```

## Rule — 规则基类

- **文件位置**: `kernel/Foundation/Validation/Rule.php`
- **命名空间**: `kernel\Foundation\Validation`

内置规则的基类，实现 `RuleInterface` 并附带参数解析。

```php
use kernel\Foundation\Validation\Rule;

$rule = new Rule("min:5");     // 构造时带规则参数
```

## Rules — 内置规则集

- **文件位置**: `kernel/Foundation/Validation/Rules.php`
- **命名空间**: `kernel\Foundation\Validation`

内置校验规则常量/方法。

| 规则 | 说明 |
|------|------|
| `required` | 必填 |
| `email` | 邮箱格式 |
| `min:N` | 最小长度/值 |
| `max:N` | 最大长度/值 |
| `numeric` | 数字 |
| `string` | 字符串 |
| `in:a,b,c` | 枚举 |
| `regex:...` | 正则 |

## RuleBuilder — 规则构建器

- **文件位置**: `kernel/Foundation/Validation/RuleBuilder.php`
- **命名空间**: `kernel\Foundation\Validation`

链式构建校验规则。

```php
use kernel\Foundation\Validation\RuleBuilder;

$rule = RuleBuilder::make()
    ->required()
    ->email()
    ->min(5)
    ->max(50);
```

## Validator — 校验器

- **文件位置**: `kernel/Foundation/Validation/Validator.php`
- **命名空间**: `kernel\Foundation\Validation`

执行数据校验。

### `Validator::make($data, $rules)`

创建校验器。

```php
use kernel\Foundation\Validation\Validator;

$validator = Validator::make($input, [
    "name" => "required|min:2|max:20",
    "email" => "required|email",
]);
```

### 校验与结果

| 方法 | 说明 |
|------|------|
| `validate()` | 执行校验，失败抛异常或返回 Result |
| `fails()` / `passes()` | 是否失败/通过 |
| `errors()` | 错误信息 |

```php
if ($validator->fails()) {
    return Result::failed(400, "400:Validation", "校验失败", $validator->errors());
}
```
