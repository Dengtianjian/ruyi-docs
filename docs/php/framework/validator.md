# Validator — 数据校验器

Validator 提供灵活的数据校验功能，支持 required、type、min/max、length、enum、pattern 等多种校验规则。

- **命名空间**: `kernel\Foundation\Validate`
- **文件位置**: `kernel/Foundation/Validate/Validator.php`
- **配合类**: `ValidateRules`、`ValidateArray`

## 方法列表

### `__construct(ValidateRules $ValidateRule, $data = null, $FullData = null)`

构建校验器。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$ValidateRule` | `ValidateRules` | 校验规则实例 |
| `$data` | `mixed` | 待校验的数据 |
| `$FullData` | `mixed` | 完整数据集 |

```php
$rule = (new ValidateRules)->required()->type("string")->minLength(3);
$validator = new Validator($rule, "hello");
$result = $validator->validate();
```

### `data($data)`

设置要校验的数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 被校验的数据 |

返回值：`Validator`

### `fullData($data)`

设置被校验数据所属的完整数据集。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 完整数据集 |

返回值：`Validator`

### `getErrorMessage($key)`

获取校验失败错误信息。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 错误信息键 |

返回值：`string`

### `validate()`

执行校验，返回校验结果。

返回值：`ReturnResult` — `error=true` 表示校验失败

```php
$result = $validator->validate();
if ($result->error) {
    echo $result->errorMessage();  // 错误信息
    echo $result->errorCode();     // 错误码
}
```

### `ReturnParamError()`

返回一个"参数错误"的结果。校验失败时内部使用。

返回值：`ReturnResult`

## 校验规则一览

在 `ValidateRules` 上通过链式调用设置规则：

| 方法 | 说明 | 示例 |
|------|------|------|
| `required()` | 必传，不能为 null 或空 | `(new ValidateRules)->required()` |
| `type($type)` | 类型校验 | `->type("string")`, `->type(["string","integer"])` |
| `min($value)` | 数值最小值 | `->min(0)` |
| `max($value)` | 数值最大值 | `->max(100)` |
| `range($min, $max)` | 数值范围 | `->range(["min"=>0,"max"=>100])` |
| `minLength($length)` | 最小长度（字符串/数组） | `->minLength(3)` |
| `maxLength($length)` | 最大长度（字符串/数组） | `->maxLength(50)` |
| `length($min, $max)` | 长度范围 | `->length(["min"=>2,"max"=>10])` |
| `enum($list)` | 枚举值 | `->enum(["active","inactive"])` |
| `equal($value)` | 等于指定值 | `->equal("confirmed")` |
| `includes($value)` | 包含指定值 | `->includes("keyword")` |
| `hasKeys($keys)` | 数组包含指定键 | `->hasKeys(["name","email"])` |
| `pattern($regex)` | 正则匹配 | `->pattern("/^\\w+$/")` |
| `CustomValidate($callback)` | 自定义校验函数 | `->CustomValidate(function($val){...})` |
| `use($rules)` | 使用其他校验规则 | `->use([$otherRule])` |

## 使用方式

### 1. 在控制器中使用（通过属性声明）

```php
use kernel\Foundation\Controller\Controller;
use kernel\Foundation\Validate\ValidateRules;

class RegisterController extends Controller
{
    // 定义校验规则
    protected $requestBodyValidator = [
        "username" => (new ValidateRules)
            ->required()
            ->type("string")
            ->minLength(3)
            ->maxLength(20),
        "password" => (new ValidateRules)
            ->required()
            ->type("string")
            ->minLength(6),
        "email" => (new ValidateRules)
            ->type("string")
            ->pattern("/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/"),
    ];

    public function data()
    {
        // 如果校验失败，before() 会自动拦截
        // 校验通过才能执行到这里
        $username = $this->requestBody->get("username");
    }
}
```

### 2. 手动校验

```php
$rule = (new ValidateRules)
    ->required()
    ->type("string")
    ->minLength(2)
    ->maxLength(50);

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
$rule = (new ValidateRules)
    ->required("用户名不能为空")
    ->type("string", "用户名必须是字符串")
    ->minLength(3, "用户名至少3个字符");

// 或通过 ErrorMessages 设置
$rule = new ValidateRules();
$rule->Rule = ["required" => true, "minLength" => 3];
$rule->ErrorMessages = [
    "required" => "用户名不能为空",
    "minLength" => "用户名至少3个字符"
];
```

### 4. 数组校验

```php
// 校验数组中每个元素的格式
$itemRule = (new ValidateRules)
    ->required()
    ->type("string");

$arrayRule = new ValidateArray($itemRule);
// 或为每个键定义不同规则
$arrayRule = new ValidateArray([
    "name" => (new ValidateRules)->required()->type("string"),
    "age" => (new ValidateRules)->required()->type("integer")->min(0),
]);
```

### 5. 自定义校验函数

```php
$rule = (new ValidateRules)
    ->required()
    ->type("string")
    ->CustomValidate(function ($value, $allRules, $fullData) {
        // $value: 当前值
        // $allRules: 所有规则
        // $fullData: 完整数据
        
        if (strlen($value) < 3) {
            $RR = new \kernel\Foundation\ReturnResult\ReturnResult(false);
            $RR->error(400, "400001", "自定义校验失败");
            return $RR;
        }
        
        // 校验通过
        return new \kernel\Foundation\HTTP\Response();
    });
```

## 校验结果结构

校验通过：
```json
{
    "statusCode": 200,
    "code": 200,
    "data": true,
    "message": "ok"
}
```

校验失败：
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

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Controller](./controller.md) | 集成 | 控制器通过 `$requestBodyValidator` 等属性使用 |
| [ReturnResult](./return-result.md) | 返回结果 | validate() 返回 ReturnResult |
| [ValidateRules] | 规则定义 | 通过 ValidateRules 定义校验规则 |
