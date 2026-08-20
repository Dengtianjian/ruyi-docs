# 校验规则详解

Validator 的全部 30+ 条规则，按类别分组列出签名、示例与错误码。所有方法在 `Rule` / `Rules` 上链式调用，最后一个参数 `$message` 均可省略（默认错误信息为"参数错误"）。

- **所属文档**: [Validator 校验器](./validator.md)
- **入口类**: `kernel\Foundation\Validation\Rule`

## 规则执行顺序

单字段校验按以下顺序短路执行（命中失败立即返回，不再执行后续规则）：

```
nullable → present → required → requiredIf → requiredUnless
→ type → min → max → range → minLength → maxLength → length
→ equal → includes → hasKeys → pattern → email → url → ip
→ date → dateFormat → in → notIn → confirmed → same → different
→ custom → use
```

## 基础校验

### required — 必填

签名：`required(string $message = "")`
错误码：`400:ValidateFailed:Required`

```php
Rule::required('用户名不能为空');
```

`required` 判定规则：
- `null` → 失败
- 数组 → 空数组失败
- 数值（`0`、`"0"`、`0.0`）→ 视为有效值，通过
- 其他类型 → `trim` 后长度为 0 失败

```php
// 通过：0、"0"、0.0、false、空格字符串"  "之外的任何非空值
// 失败：null、[]、""、"   "
```

### nullable — 可空

签名：`nullable(string $message = "")`

值为 `null` 时跳过后续所有规则（如 `type`、`length` 等）：

```php
Rule::nullable()->type('string')->length(1, 50);

// "hello"  → 继续校验 type/length
// null     → 直接通过，不再执行后续规则
// ""       → 继续校验（注意：空串不是 null）
```

### present — 字段存在

签名：`present(string $message = "")`

值为空字符串时跳过后续所有规则：

```php
Rule::present()->type('string');

// "hello"  → 继续校验
// ""       → 直接通过
// null     → 继续校验
```

### prohibited — 禁止存在

签名：`prohibited(string $message = "")`
错误码：`400:ValidateFailed:ParamError`

该字段不能存在于输入数据中（仅关联数组场景生效）：

```php
$rules = new Rules([
    'username' => Rule::required(),
    'is_admin' => Rule::prohibited(),  // 前端提交 is_admin 直接失败
]);

// 输入含 is_admin 字段 → 校验失败
// 输入不含 is_admin 字段 → 通过
```

## 条件必填

### requiredIf — 条件必填

签名：`requiredIf(string $field, array|string $values, string $message = "")`
错误码：`400:ValidateFailed:RequiredIf`

另一字段的值在指定列表中时，本字段必填：

```php
$rules = new Rules([
    'type'         => Rule::required()->in(['personal', 'company']),
    'company_name' => Rule::requiredIf('type', ['company'], '企业名必填')->type('string'),
]);

// type = 'company' → company_name 必填
// type = 'personal' → company_name 可省略
```

- `$values` 支持数组或单个字符串：`Rule::requiredIf('type', 'company')`
- `$field` 支持点号路径：`Rule::requiredIf('user.type', ['company'])`
- 另一字段值不在数据中时视为不满足条件

### requiredUnless — 除非...否则必填

签名：`requiredUnless(string $field, array|string $values, string $message = "")`
错误码：`400:ValidateFailed:RequiredUnless`

除非另一字段的值在指定列表中，否则本字段必填：

```php
$rules = new Rules([
    'type'  => Rule::required()->in(['personal', 'company', 'guest']),
    'email' => Rule::requiredUnless('type', ['guest'], '邮箱必填'),
]);

// type = 'guest' → email 可省略
// type = 'company' → email 必填
// type 不在数据中 → email 必填
```

## 类型校验

### type — 类型校验

签名：`type(string|array $type, string $message = "")`
错误码：`400:ValidateFailed:Type`

```php
Rule::type('string');                    // 必须是字符串
Rule::type('integer');                   // 必须是整数
Rule::type('boolean');                   // 必须是布尔值
Rule::type(['string', 'integer']);       // 多类型任一匹配即可
```

- `int` 自动转为 `integer`，`bool` 自动转为 `boolean`
- 使用 `gettype()` 判定：`null` 的类型是 `"NULL"`，数组是 `"array"`
- `type('int')` 与 `type('integer')` 等价

```php
// 失败时 details 包含实际类型
// details: {"type": "string", "exceptType": ["integer"]}
```

## 数值比较

### min — 最小值

签名：`min(int $value, string $message = "")`
错误码：`400:ValidateFailed:Minimun`

```php
Rule::min(18, '年龄不能小于 18 岁');

// 18、18.5、"18"、20 → 通过
// 17、17.9、"17" → 失败
```

比较前先通过 `Numeric::val()` 归一化为数值，`"18"` 与 `18` 等价。目标为数组/对象时返回 `400:ValidateFailed:ParamError`。

### max — 最大值

签名：`max(int $value, string $message = "")`
错误码：`400:ValidateFailed:Maximun`

```php
Rule::max(65, '年龄不能大于 65 岁');

// 65、60、"60" → 通过
// 66、70 → 失败
```

### range — 区间

签名：`range(int $min, int $max, string $message = "")`
错误码：`400:ValidateFailed:Range`

```php
Rule::range(18, 65, '年龄须在 18-65 之间');

// 18、30、65 → 通过（闭区间）
// 17、66 → 失败
```

## 长度校验

以下规则字符串优先使用 `mb_strlen`（多字节安全），未安装 mbstring 时回退 `strlen`；数组按元素个数计算。

### minLength — 最小长度

签名：`minLength(int $value, string $message = "")`
错误码：`400:ValidateFailed:MinimumLength`

```php
Rule::minLength(6, '密码至少 6 位');

// "abc123"（长度 6）、[1,2,3,4,5,6] → 通过
// "abc12"、[1,2,3] → 失败
```

### maxLength — 最大长度

签名：`maxLength(int $value, string $message = "")`
错误码：`400:ValidateFailed:MaximumLength`

```php
Rule::maxLength(50, '最多 50 个字符');

// "a" × 50、[1,...,50] → 通过
// "a" × 51 → 失败
```

### length — 长度区间

签名：`length(int $min, int $max, string $message = "")`
错误码：`400:ValidateFailed:Length`

```php
Rule::length(3, 20, '长度 3-20 个字符');

// "abc"、"ab...z"（20位）→ 通过
// "ab"（2位）、"a...z"（21位）→ 失败
// 中文按字符数计算："你好世界"（4个字符）→ 通过
```

## 值比较

### equal — 严格相等

签名：`equal(mixed $value, string $message = "")`
错误码：`400:ValidateFailed:Equal`

```php
Rule::equal('active');

// 'active' → 通过
// 'ACTIVE'、'Active' → 失败（严格 === 比较）
```

### in — 在列表中

签名：`in(array|string ...$values)`
错误码：`400:ValidateFailed:In`

```php
Rule::in('pending', 'published', 'archived');   // 可变参数
Rule::in(['a', 'b'], '不在允许列表');            // 数组 + 消息

// 使用严格比较（in_array(..., true)），1 与 "1" 不相等
```

### notIn — 不在列表中

签名：`notIn(array|string ...$values)`
错误码：`400:ValidateFailed:NotIn`

```php
Rule::notIn('admin', 'superadmin', '该名称不可用');

// 'admin' → 失败
// 'user' → 通过
```

`in` / `notIn` 目标为数组/对象时返回 `400:ValidateFailed:ParamError`。

## 包含与键名

### includes — 包含子串/元素

签名：`includes(string|array $value, string $message = "")`
错误码：`400:ValidateFailed:Includes`

```php
Rule::includes('@', '邮箱必须包含 @');             // 字符串包含子串
Rule::includes(['a', 'b'], '数组必须包含 a 和 b');  // 数组包含全部元素
```

- 数组场景要求目标数组包含规则中**每一个**元素
- 字符串场景要求包含**每一个**子串

```php
// "a@b.com" + includes('@') → 通过
// ['a', 'b', 'c'] + includes(['a', 'b']) → 通过
// ['a', 'c'] + includes(['a', 'b']) → 失败
```

### hasKeys — 包含键名

签名：`hasKeys(string|array $keys, string $message = "")`
错误码：`400:ValidateFailed:HasKeys`

```php
Rule::hasKeys('title', '必须包含 title 键');
Rule::hasKeys(['title', 'content'], '必须包含全部键');

// ['title' => 'x', 'content' => 'y'] → 通过
// ['title' => 'x'] → 失败
// 目标非数组 → 400:ValidateFailed:ParamError
```

## 格式校验

### pattern — 正则匹配

签名：`pattern(string $regex, string $message = "")`
错误码：`400:ValidateFailed:Pattern`

```php
Rule::pattern('/^1[3-9]\d{9}$/', '手机号格式不正确');
Rule::pattern('/^[a-zA-Z0-9_]{3,20}$/', '用户名仅限字母数字下划线');

// '13800138000' → 通过
// '123456' → 失败
```

### email — 邮箱

签名：`email(string $message = "")`
错误码：`400:ValidateFailed:Email`

```php
Rule::email('邮箱格式不正确');

// 'user@example.com' → 通过
// 'user@example'、'user@@example.com' → 失败
```

使用 `FILTER_VALIDATE_EMAIL` 校验。

### url — 链接

签名：`url(string $message = "")`
错误码：`400:ValidateFailed:Url`

```php
Rule::url('URL 格式不正确');

// 'https://example.com'、'http://example.com/path?q=1' → 通过
// 'example.com'、'not a url' → 失败
```

使用 `FILTER_VALIDATE_URL` 校验。

### ip — IP 地址

签名：`ip(string $message = "")`
错误码：`400:ValidateFailed:Ip`

```php
Rule::ip('IP 地址无效');

// '192.168.1.1'（IPv4）、'::1'（IPv6）→ 通过
// '999.999.999.999'、'not an ip' → 失败
```

使用 `FILTER_VALIDATE_IP` 校验，同时支持 IPv4 与 IPv6。

### date — 日期

签名：`date(string $message = "")`
错误码：`400:ValidateFailed:Date`

```php
Rule::date('日期无效');

// '2024-01-01'、'2024-01-01 12:30:00'、'2024/01/01' → 通过
// '2024-13-99'、'2024-99-01'、'abc' → 失败
```

基于 `date_parse` 校验，规避 `strtotime` 的边缘值歧义（如 `"2024-13-99"` 在 `strtotime` 下会被解析为未来时间）。

### dateFormat — 指定格式日期

签名：`dateFormat(string $format, string $message = "")`
错误码：`400:ValidateFailed:DateFormat`

```php
Rule::dateFormat('Y-m-d', '日期格式须为 Y-m-d');
Rule::dateFormat('Y-m-d H:i:s', '时间格式须为 Y-m-d H:i:s');

// '2024-01-01' + dateFormat('Y-m-d') → 通过
// '2024-1-1' + dateFormat('Y-m-d') → 失败（严格往返格式匹配）
// '2024-01-01 10:00:00' + dateFormat('Y-m-d H:i:s') → 通过
```

目标为数组/对象时返回 `400:ValidateFailed:ParamError`。

## 跨字段校验

以下规则依赖 `fullData`（完整数据集）进行取值比较。

### confirmed — 确认字段

签名：`confirmed(string $message = "")`
错误码：`400:ValidateFailed:Confirmed`

值与 `字段名_confirmation` 一致：

```php
$rules = new Rules([
    'password' => Rule::required()->minLength(6)->confirmed('两次密码不一致'),
]);

// 输入：['password' => 'abc123', 'password_confirmation' => 'abc123'] → 通过
// 输入：['password' => 'abc123', 'password_confirmation' => 'abc124'] → 失败
```

- `Rules` 场景下框架自动设置字段名
- 手动校验需调用 `setFieldName()`

### same — 与指定字段相同

签名：`same(string $field, string $message = "")`
错误码：`400:ValidateFailed:Same`

```php
$rules = new Rules([
    'email'        => Rule::required()->email(),
    'confirm_email' => Rule::same('email', '两次邮箱不一致'),
]);
```

- `$field` 支持点号路径：`Rule::same('user.email')`
- 通过 `Arr::get($fullData, $field)` 取值比较

### different — 与指定字段不同

签名：`different(string $field, string $message = "")`
错误码：`400:ValidateFailed:Different`

```php
$rules = new Rules([
    'username' => Rule::required()->different('email', '用户名不能与邮箱相同'),
    'email'    => Rule::required()->email(),
]);
```

## 组合规则

### custom — 自定义校验

签名：`custom(callable $callback)`

回调签名：`function ($value, $rule, $data): mixed`

```php
use kernel\Foundation\Result;

$rule = Rule::required()->type('string')->custom(function ($value, $rule, $data) {
    // 查询数据库判断唯一性
    $exists = DB::table('users')->where('username', $value)->exists();
    if ($exists) {
        return Result::failed(400, '400:ValidateFailed:Custom', '用户名已存在');
    }
    // 返回非 error 的 Result 或不返回 → 视为通过
});
```

回调返回 `Result` 且 `$error === true` 时判定失败，其余情况视为通过。

### useRule — 复用规则

签名：`useRule(RuleInterface $rule)`

复用已有 Rule 实例，可多次调用叠加：

```php
$base = Rule::required()->type('string');

Rule::useRule($base)->minLength(3)->maxLength(50);
Rule::useRule(Rule::required('必填'))->useRule(Rule::type('string'))->email();
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
| `400:ValidateFailed:ParamError` | 参数类型不合法（min/hasKeys/in 等遇数组、prohibited 冲突等） |
| `400:ValidateFailed:Array` | 预期数组但传入非数组 |

## 各规则 details 诊断字段

| 规则 | details 附加字段 |
|------|------------------|
| `required` | `value`、`empty`、`null` |
| `requiredIf` / `requiredUnless` | `anotherField`、`anotherValue`、`expectValues` |
| `type` | `type`（实际类型）、`exceptType`（期望类型） |
| `min` / `max` | `min` / `max` |
| `range` | `range` |
| `minLength` / `maxLength` / `length` | `length`、`minLength` / `maxLength` / `exceptLength` |
| `equal` | `expect` |
| `includes` | `include` |
| `hasKeys` | `keys` |
| `pattern` | `pattern` |
| `in` / `notIn` | `list` |
| `confirmed` | `confirmedValue` |
| `same` / `different` | `otherField`、`otherValue` |
