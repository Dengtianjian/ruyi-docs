# RequestData — 请求数据基类

- **文件位置**: `kernel/Foundation/HTTP/Request/RequestData.php`
- **命名空间**: `kernel\Foundation\HTTP\Request`
- **是否可继承**: 是（抽象基类）

请求数据容器基类。`Request` 下的各个数据子对象（`RequestQuery` / `RequestBody` / `RequestHeader` / `RequestParams`）均继承本类，获得统一的**取值（get/some/has）、转换（mutator）与校验（validator）**能力。

> 注：`Request` 下的参数提取类 `RequestPagination` / `RequestSorting` / `RequestFiltering` 位于 `Request/Extract/` 子目录，继承自 `DataObject`（而非本类），用于从 query 中提取分页/排序/筛选参数。

**核心流程** `handle()`：先执行校验器（validator）校验，再用数据转换器（mutator）转换数据，转换结果回写 `$data`，校验结果存入 `$validatedResult`。

**mutator / validator 支持两种形态**：
- 实例：`Mutator` / `Validator` 实例
- 数组规则：`handle()` 会自动包装成 `Rules` / `Mutator` 处理

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$data` | `array` | `[]` | protected | 数据（各子类构造时从对应来源填充） |
| `$mutator` | `Mutator\|array\|null` | `null` | protected | 数据转换规则 |
| `$validator` | `Validator\|array\|null` | `null` | protected | 数据校验规则或校验器 |
| `$validatedResult` | `Result\|null` | `null` | public | 校验结果 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($mutator, $validator)` | 构造：设置转换与校验规则 |
| `has($key)` | 是否存在某个键 |
| `get($key)` | 获取某个键的值 |
| `some($keys, $completion)` | 批量获取某些键的值 |
| `handle()` | 执行校验并转换数据 |
| `fill($data)` | 注入数据并合并（`RequestParams` 路由匹配后经此注入参数） |
| `remove($key)` | 移除指定键（支持点号路径） |

## 方法

### `__construct($mutator = null, $validator = null)` — 构造

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$mutator` | `Mutator\|array\|null` | `null` | 数据转换规则 |
| `$validator` | `Validator\|array\|null` | `null` | 数据校验规则或校验器 |

**返回值**

- 无。

### `has($key)` — 是否存在某个键

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 键名 |

**返回值**

- `bool`：存在返回 `true`，否则 `false`。

### `get($key)` — 获取某个键的值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 键名 |

**返回值**

- `mixed`：键值；键不存在返回 `null`。

### `some($keys = null, $completion = false)` — 批量获取某些键的值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$keys` | `string[]\|null` | `null` | 要获取的键名索引数组；`null` 返回全部数据 |
| `$completion` | `bool` | `false` | `true` 时，键缺失补 `null`（全量时对数据执行转换器） |

**返回值**

- `array|null`：对应键值组成的数组；无数据返回 `null`。

**示例**

```php
$request->body->some(["name", "email"]);          // 取这两个键
$request->body->some();                            // 全部数据
$request->body->some(["a"], true);                 // 缺失键补 null
```

### `handle()` — 执行校验并转换数据

流程：校验器校验（结果存入 `$validatedResult`）→ 转换器转换 → 转换结果回写 `$data`。校验失败或 `$validatedResult->error` 为真时跳过转换直接返回。

**参数**

- 无。

**返回值**

- 无（`void`）。

**异常**

- 校验器字段既非 `Validator` 实例也非 `Rule` 实例时，`$validatedResult` 会记录 500 错误（不抛异常）。

### `fill($data)` — 注入数据并合并

将传入数据与既有数据合并，用于在构造之后补充数据。`RequestParams` 由 `App::run()`/`Console` 路由匹配完成后经此注入路由参数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `array` | 无 | 待合并的数据映射 |

**返回值**

- 无（`void`）。

**示例**

```php
$request->params->fill(["id" => "42"]); // 注入路由参数
```

### `remove($key)` — 移除指定键

与 `fill()` 对应的移除操作，支持点号路径（如 `user.profile.name`）。键不存在时静默忽略，不报错。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 键名，支持点号语法 |

**返回值**

- 无（`void`）。

**示例**

```php
$request->params->remove("user.profile.name"); // 移除该键
```
