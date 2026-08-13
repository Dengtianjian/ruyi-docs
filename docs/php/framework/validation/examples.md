# 使用场景示例

校验器在框架中的常见使用场景与完整示例。

- **所属文档**: [Validator 校验器](./validator.md)
- **相关文档**: [校验规则详解](./rules.md)、[关联数组校验](./array-rules.md)

## 场景一：控制器自动校验（推荐）

通过 `$requestQueryValidator` / `$requestBodyValidator` 属性声明，框架在 `before()` 阶段自动执行校验，校验失败自动拦截响应，无需手动处理：

```php
use kernel\Foundation\Controller\Controller;
use kernel\Foundation\Validation\Rule;

class RegisterController extends Controller
{
    // 查询参数（GET）自动校验
    protected $requestQueryValidator = [
        'page' => Rule::type('integer')->min(1),
        'size' => Rule::type('integer')->range(1, 100),
    ];

    // 请求体（POST）自动校验
    protected $requestBodyValidator = [
        'username' => Rule::required('用户名不能为空')
            ->type('string', '用户名必须是字符串')
            ->length(3, 20, '用户名长度 3-20 个字符'),
        'password' => Rule::required('密码不能为空')
            ->type('string')
            ->minLength(6, '密码至少 6 个字符')
            ->confirmed('两次密码不一致'),
        'email'    => Rule::type('string')->email('邮箱格式不正确'),
    ];

    public function data()
    {
        // 校验通过才会执行到这里
        $username = $this->requestBody->get('username');
        $page = $this->requestQuery->get('page', 1);
    }
}
```

## 场景二：手动校验单个值

```php
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Validator;

$rule = Rule::required()->type('string')->minLength(2)->maxLength(50);

$validator = new Validator($rule, $inputName);
$result = $validator->validate();

if ($result->error) {
    return $this->response->error(
        $result->errorStatusCode(),
        $result->errorCode(),
        $result->errorMessage()
    );
}

// 校验通过，继续业务逻辑
```

复用同一规则校验多个值：

```php
$rule = Rule::required()->type('string')->maxLength(100);

foreach (['title', 'subtitle', 'summary'] as $field) {
    $result = (new Validator($rule, $input[$field] ?? null))->validate();
    if ($result->error) {
        return $this->response->error(400, $result->errorCode(), "{$field}：" . $result->errorMessage());
    }
}
```

## 场景三：手动校验关联数组

```php
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Rules;
use kernel\Foundation\Validation\Validator;

$rules = new Rules([
    'title'   => Rule::required('标题必填')->type('string')->length(1, 100),
    'content' => Rule::required('内容必填')->type('string')->minLength(10),
    'status'  => Rule::in('draft', 'published', 'archived', '状态不合法'),
    'tags'    => Rule::type('array')->maxLength(10),
]);

$validator = new Validator($rules, $requestData);
$result = $validator->validate();

if ($result->error) {
    return $this->response->error(400, $result->errorCode(), $result->errorMessage());
}
```

## 场景四：跨字段确认（密码、邮箱）

```php
$rules = new Rules([
    'password' => Rule::required('密码必填')->minLength(6, '密码至少 6 位')
        ->confirmed('两次密码不一致'),
    'email'        => Rule::required('邮箱必填')->email('邮箱格式不正确'),
    'confirm_email' => Rule::same('email', '两次邮箱不一致'),
]);

$validator = new Validator($rules, [
    'password' => 'abc123',
    'password_confirmation' => 'abc123',
    'email' => 'user@example.com',
    'confirm_email' => 'user@example.com',
]);
// 通过
```

手动校验 `confirmed` 时记得设置字段名：

```php
$validator = new Validator(
    Rule::required()->minLength(6)->confirmed('两次密码不一致'),
    'abc123',
    ['password' => 'abc123', 'password_confirmation' => 'abc124']
);
$validator->setFieldName('password')->validate();  // 失败：400:ValidateFailed:Confirmed
```

## 场景五：条件必填

```php
$rules = new Rules([
    'type'         => Rule::required()->in(['personal', 'company']),
    'company_name' => Rule::requiredIf('type', ['company'], '企业名必填')->type('string'),
    'id_card'      => Rule::requiredIf('type', ['personal'], '身份证必填'),
    'email'        => Rule::requiredUnless('type', ['guest'], '邮箱必填'),
]);

// type = 'company' → company_name 必填，id_card 可省略
// type = 'personal' → id_card 必填，company_name 可省略
// type = 'guest' → email 可省略
```

## 场景六：条件规则 sometimes

```php
$rules = new Rules([
    'shipping_method' => Rule::required()->in(['express', 'pickup']),
    'address'         => Rule::type('string'),
]);

// 选择快递时才要求填写地址
$rules->sometimes('address', Rule::required('请填写收货地址')->length(5, 200), function ($data) {
    return ($data['shipping_method'] ?? '') === 'express';
});

$validator = new Validator($rules, [
    'shipping_method' => 'express',
    'address'         => '',  // 失败：400:ValidateFailed:Required
]);
```

## 场景七：嵌套数组与通配符

```php
$rules = new Rules([
    'order.customer.name'  => Rule::required('客户姓名必填')->type('string'),
    'order.customer.phone' => Rule::required('手机号必填')->pattern('/^1[3-9]\d{9}$/', '手机号格式不正确'),
    'order.items.*.sku'    => Rule::required()->type('string'),
    'order.items.*.qty'    => Rule::required()->type('integer')->range(1, 999),
]);

$validator = new Validator($rules, [
    'order' => [
        'customer' => ['name' => '张三', 'phone' => '13800138000'],
        'items' => [
            ['sku' => 'A-1001', 'qty' => 2],
            ['sku' => 'B-2002', 'qty' => 1],
        ],
    ],
]);
// 通过
```

## 场景八：自定义校验（唯一性检查）

```php
use kernel\Foundation\ReturnResult\ReturnResult;
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Validator;

$rule = Rule::required('用户名不能为空')
    ->type('string')
    ->custom(function ($value, $rule, $data) {
        $exists = DB::table('users')->where('username', $value)->exists();
        if ($exists) {
            return ReturnResult::failed(400, '400:ValidateFailed:Custom', '用户名已被占用');
        }
    });

$result = (new Validator($rule, $input['username']))->validate();
```

## 场景九：规则复用

```php
// 基础规则
$baseString = Rule::required()->type('string');
$baseEmail = Rule::useRule($baseString)->email('邮箱格式不正确');

// 派生规则
$loginName = Rule::useRule($baseString)->length(3, 50);
$password = Rule::useRule($baseString)->minLength(6)->maxLength(32);
$remark = Rule::useRule($baseString)->nullable()->maxLength(500);
```

## 场景十：校验结果处理

```php
$result = $validator->validate();

if ($result->error) {
    $statusCode = $result->errorStatusCode();  // 400
    $code = $result->errorCode();              // "400:ValidateFailed:Required"
    $message = $result->errorMessage();        // "用户名不能为空"
    $details = $result->errorDetails();        // ["value" => null, "empty" => true, "null" => true]
    return $this->response->error($statusCode, $code, $message);
}

$data = $result->getData();  // true
```

### 完整失败响应示例

```json
{
    "statusCode": 400,
    "code": "400:ValidateFailed:Email",
    "data": false,
    "message": "邮箱格式不正确",
    "details": {
        "value": "user@@example.com"
    }
}
```

## 相关导航

- [校验规则详解](./rules.md) — 全部规则签名与错误码
- [关联数组校验](./array-rules.md) — Rules 字段映射/通配符/条件规则
- [Validator 校验器](./validator.md) — Validator 类 API 与结果结构
