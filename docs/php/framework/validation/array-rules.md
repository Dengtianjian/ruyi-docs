# 关联数组校验（Rules）

当需要校验整个数组时，使用 `Rules` 类定义字段→规则的映射。支持点号路径访问嵌套字段、通配符展开、索引数组递归校验，以及条件规则（`sometimes`）。

- **所属文档**: [Validator 校验器](./validator.md)
- **命名空间**: `kernel\Foundation\Validation`

## 基本用法

### 构造函数

```php
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Rules;

$rules = new Rules([
    'name' => Rule::required('姓名必填')->type('string')->length(1, 50),
    'age'  => Rule::required('年龄必填')->type('integer')->range(0, 150),
]);
```

- 参数必须是**关联数组**，否则抛出异常
- 每个字段的值必须是 `Rule` 实例
- 字段名支持**点号语法**（如 `user.profile.age`）和**通配符**（如 `items.*.price`）

### 执行校验

```php
$validator = new Validator($rules, $inputArray);
$result = $validator->validate();
```

`validate()` 对数据做三种分发：

1. **数据非数组** → 返回 `400:ValidateFailed:Array`
2. **关联数组** → 按字段规则逐一校验（支持点号取值、通配符展开、`prohibited`）
3. **索引数组** → 遍历每个元素递归执行校验

## 字段管理 API

| 方法 | 签名 | 说明 |
|------|------|------|
| `has` | `has(string $key): bool` | 是否存在指定字段的规则 |
| `get` | `get(string $key): Rule\|null` | 获取指定字段的规则，不存在返回 null |
| `all` | `all(): array` | 获取全部字段规则映射 |
| `addRule` | `addRule(string $attribute, Rule $rule): $this` | 动态添加字段规则 |
| `sometimes` | `sometimes(string $attribute, Rule $rule, callable $callback): $this` | 条件规则：回调返回 true 才参与校验 |
| `getConditionalRules` | `getConditionalRules(): array` | 获取所有条件规则 |
| `hasWildcard` | `hasWildcard(): bool` | 是否存在含 `*` 的字段 |
| `wildcardRules` | `wildcardRules(): array` | 获取含 `*` 的字段规则集合 |

```php
$rules->has('name');                       // true
$rules->get('age');                        // Rule 实例
$rules->all();                             // ['name' => Rule, 'age' => Rule]
$rules->addRule('gender', Rule::in('male', 'female'));
$rules->hasWildcard();                     // false
```

## 关联数组逐字段校验

```php
$rules = new Rules([
    'username' => Rule::required('用户名必填')->type('string')->length(3, 20),
    'email'    => Rule::required('邮箱必填')->email(),
    'age'      => Rule::type('integer')->range(18, 65),
]);

$validator = new Validator($rules, [
    'username' => 'Tom',
    'email'    => 'tom@example.com',
    'age'      => 30,
]);
$result = $validator->validate();  // 通过

// 失败示例：age 不在范围内
$result = $validator->data([
    'username' => 'Tom',
    'email'    => 'tom@example.com',
    'age'      => 10,
])->validate();
// $result->error === true
// $result->errorCode()  === "400:ValidateFailed:Range"
```

## 点号字段语法

深层嵌套字段通过点号路径取值校验：

```php
$rules = new Rules([
    'user.profile.age'  => Rule::type('integer')->range(0, 150),
    'user.profile.name' => Rule::required()->type('string'),
]);

$validator = new Validator($rules, [
    'user' => ['profile' => ['age' => '25', 'name' => 'Tom']],
]);
$result = $validator->validate();  // 通过

// 缺失嵌套字段
$result = $validator->data([
    'user' => ['profile' => ['age' => 25]],
])->validate();  // name 必填失败：400:ValidateFailed:Required
```

点号路径支持跨字段规则取值（`same`、`requiredIf` 等同样可用点号指向嵌套字段）：

```php
$rules = new Rules([
    'billing.address'  => Rule::required(),
    'shipping.address' => Rule::same('billing.address', '收货地址与账单地址不一致'),
]);
```

## 通配符字段

对索引数组的每个元素执行相同规则：

```php
$rules = new Rules([
    'photos.*.url'  => Rule::required()->url(),
    'photos.*.size' => Rule::type('integer')->min(0),
]);

$validator = new Validator($rules, [
    'photos' => [
        ['url' => 'https://example.com/a.jpg', 'size' => 1024],
        ['url' => 'https://example.com/b.jpg', 'size' => 2048],
    ],
]);
$result = $validator->validate();  // 通过

// 任一元素失败即短路
$result = $validator->data([
    'photos' => [
        ['url' => 'https://example.com/a.jpg', 'size' => 1024],
        ['url' => 'not-a-url', 'size' => 2048],
    ],
])->validate();  // 400:ValidateFailed:Url
```

通配符支持多层：

```php
$rules = new Rules([
    'order.items.*.product.id'  => Rule::required()->type('integer'),
    'order.items.*.product.sku' => Rule::required()->type('string'),
]);
```

## 索引数组递归校验

对数组中每个元素都应用同一规则集：

```php
$rules = new Rules([
    'id'   => Rule::required()->type('integer'),
    'name' => Rule::required()->type('string')->length(1, 50),
]);

$validator = new Validator($rules, [
    ['id' => 1, 'name' => '张三'],
    ['id' => 2, 'name' => '李四'],
]);
$result = $validator->validate();  // 通过

// 第 2 个元素 id 缺失
$result = $validator->data([
    ['id' => 1, 'name' => '张三'],
    ['id' => 2],  // name 缺失 → 失败
])->validate();   // 400:ValidateFailed:Required
```

## 条件规则 sometimes

### 基本用法

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

条件规则的回调接收**完整数据**，返回 `true` 时规则才会在 `validate()` 开头被合并进主规则列表。

### 多字段条件

```php
$rules->sometimes('id_card', Rule::required('身份证必填'), function ($data) {
    return $data['type'] === 'personal';
});

$rules->sometimes('tax_no', Rule::required('税号必填'), function ($data) {
    return $data['type'] === 'company';
});
```

### 查看条件规则

```php
$rules->getConditionalRules();  // [['attribute' => 'company_name', 'rule' => Rule, 'callback' => Closure]]
```

## prohibited 与过滤

### 禁止字段

防止前端提交不该提交的字段（如提权字段）：

```php
$rules = new Rules([
    'username' => Rule::required(),
    'is_admin' => Rule::prohibited(),   // 含 is_admin 即失败
    'role'     => Rule::prohibited(),
]);

$validator = new Validator($rules, ['username' => 'Tom', 'is_admin' => true]);
$result = $validator->validate();  // 400:ValidateFailed:ParamError
```

### 字段自动过滤

在 `Rules` 场景下，未定义规则的字段默认被过滤（不参与校验），可在控制器中配合 Mutator 做白名单：

```php
$rules = new Rules([
    'username' => Rule::required(),
    'password' => Rule::required()->minLength(6),
]);

// 输入：['username' => 'Tom', 'password' => 'abc123', 'is_admin' => true]
// 校验只关心 username/password，is_admin 不在规则中，不参与校验
```

> 提示：结合 `Mutator` 的 `removeNotExistRuleKey` 可彻底剔除多余字段，参见 [Mutator 数据突变器](./mutator.md)。

## 完整示例：用户注册

```php
use kernel\Foundation\Validation\Rule;
use kernel\Foundation\Validation\Rules;
use kernel\Foundation\Validation\Validator;

$rules = new Rules([
    'username'             => Rule::required('用户名必填')->type('string')->length(3, 20),
    'email'                => Rule::required('邮箱必填')->email('邮箱格式不正确'),
    'password'             => Rule::required('密码必填')->minLength(6, '密码至少 6 位')->confirmed('两次密码不一致'),
    'age'                  => Rule::type('integer')->range(18, 100, '年龄须在 18-100 之间'),
    'subscribe'            => Rule::type('boolean'),
    'address.province'     => Rule::required('省份必填')->type('string'),
    'address.city'         => Rule::required('城市必填')->type('string'),
    'address.detail'       => Rule::type('string')->length(1, 200),
    'tags.*'               => Rule::type('string')->maxLength(20),
]);

$input = [
    'username'             => 'Tom123',
    'email'                => 'tom@example.com',
    'password'             => 'abc123',
    'password_confirmation' => 'abc123',
    'age'                  => 25,
    'subscribe'            => true,
    'address'              => [
        'province' => '广东省',
        'city'     => '深圳市',
        'detail'   => '南山区科技园',
    ],
    'tags'                 => ['php', 'backend'],
];

$validator = new Validator($rules, $input);
$result = $validator->validate();
// 通过：$result->error === false
```

## 相关导航

- [校验规则详解](./rules.md) — 单字段全部规则
- [使用场景示例](./examples.md) — 控制器/手动校验完整示例
- [Validator 校验器](./validator.md) — Validator 类 API
