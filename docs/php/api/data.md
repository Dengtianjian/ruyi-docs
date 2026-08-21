# Data 数据工具类

- **目录位置**: `kernel/Foundation/Data/`
- **命名空间**: `kernel\Foundation\Data`

纯静态工具类，用于数组、字符串、日期、数字、序列化等通用数据处理。全部以静态方法调用。

## Arr — 数组工具

- **文件位置**: `kernel/Foundation/Data/Arr.php`

数组操作，支持**点号路径**。

| 方法 | 说明 |
|------|------|
| `Arr::get($array, $key, $default = null)` | 点号路径取值 |
| `Arr::has($array, $key)` | 点号路径判断存在 |
| `Arr::set($array, $key, $value)` | 点号路径赋值 |
| `Arr::pluck($array, $key)` | 提取某键构成数组 |
| `Arr::flatten($array)` | 展平多维数组 |
| `Arr::dot($array)` | 多维数组转点号扁平结构 |
| `Arr::undot($array)` | 点号结构还原多维数组 |
| `Arr::where($array, $callback)` | 过滤 |

```php
$name = Arr::get($user, "profile.name", "未命名");
if (Arr::has($user, "profile")) { /* ... */ }
$ids = Arr::pluck($users, "id");
```

## Str — 字符串工具

- **文件位置**: `kernel/Foundation/Data/Str.php`

字符串处理。

| 方法 | 说明 |
|------|------|
| `Str::camel($str)` | 转小驼峰 `hello_world` → `helloWorld` |
| `Str::studly($str)` | 转大驼峰 `hello_world` → `HelloWorld` |
| `Str::snake($str)` | 转下划线 `helloWorld` → `hello_world` |
| `Str::kebab($str)` | 转连字符 `helloWorld` → `hello-world` |
| `Str::contains($str, $needle)` | 是否包含 |
| `Str::startsWith($str, $needle)` / `Str::endsWith($str, $needle)` | 前后缀判断 |
| `Str::random($length)` | 随机字符串 |

```php
$controller = Str::studly("user_profile");   // UserProfile
$class = $controller . "Controller";
```

## Numeric — 数字工具

- **文件位置**: `kernel/Foundation/Data/Numeric.php`

数字处理。

```php
Numeric::format($number, 2);
Numeric::round($number, 2);
```

## Money — 金额工具

- **文件位置**: `kernel/Foundation/Data/Money.php`

金额计算与格式化。

```php
Money::fenToYuan(100);    // 1.00 分转元
Money::yuanToFen(1.00);   // 100 元转分
Money::format(100);       // 格式化金额
```

## Date — 日期工具

- **文件位置**: `kernel/Foundation/Data/Date.php`

日期时间处理。

```php
Date::format($timestamp, "Y-m-d H:i:s");
Date::timestamp($datetime);
Date::diff($start, $end);
```

## Mutator — 数据变更器

- **文件位置**: `kernel/Foundation/Data/Mutator.php`

数据变更/转换器，用于模型属性或请求数据的统一处理。

```php
Mutator::set($value);     // 设值
Mutator::get($value);     // 取值
```

## Serializer — 序列化

- **文件位置**: `kernel/Foundation/Data/Serializer.php`

数据序列化/反序列化。`load()` 是全局 `import()` 的唯一真实调用点。

| 方法 | 说明 |
|------|------|
| `Serializer::serialize($data)` | 序列化 |
| `Serializer::unserialize($data)` | 反序列化 |
| `Serializer::load($fileName, $args, $basePath)` | 导入 PHP 文件（底层调用 `import()`） |
| `Serializer::encode($data)` / `Serializer::decode($data)` | JSON 编解码 |

```php
$json = Serializer::encode($data);
$data = Serializer::decode($json);
```

## Transform — 数据转换

- **文件位置**: `kernel/Foundation/Data/Transform.php`

数据结构转换，常用于数组按映射规则转换。

```php
Transform::transform($input, $map);
Transform::transformArray($inputs, $map);
```
