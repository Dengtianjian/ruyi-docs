# Output — 输出工具

- **文件位置**: `kernel/Foundation/Output.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是

输出工具（全静态）。提供调试输出（`debug` / `backtrace`）、打印（`printContent`）、格式化输出（`format`）与格式化字符串（`string`）。

- `format()` 输出 HTML `<pre>` 适合 HTTP 场景；CLI 场景应优先用 `string()` 取纯文本，避免 HTML 标签污染。
- `isCli()` 可感知运行环境。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （无属性） | — | — | — | 全静态工具类，无实例属性 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `debug(...$data)` | 调试输出并终止脚本 |
| `backtrace($options, $limit)` | 输出调用堆栈并终止脚本 |
| `printContent($outputString, ...$value)` | 打印内容到标准输出 |
| `format(...$data)` | 将数据以 HTML `<pre>` 形式输出 |
| `string(...$data)` | 将数据格式化为纯文本字符串（不含 HTML） |
| `isCli()` | 是否为 CLI 运行环境 |

## 方法

### `debug(...$data)` — 调试输出并终止脚本

以 HTML `<pre>` 输出所有传入数据后 `exit` 终止脚本。**空参时不终止**，仅输出一条提示，避免误调终止脚本。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed`（可变参数） | 无 | 任意数量的调试数据 |

**返回值**

- 无（正常路径会 `exit`；空参时输出提示后返回）。

**示例**

```php
Output::debug($user, $config);   // 输出后终止
```

### `backtrace($options = DEBUG_BACKTRACE_IGNORE_ARGS, $limit = 0)` — 输出调用堆栈并终止脚本

获取调用堆栈后交给 `debug()` 输出并终止脚本。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$options` | `int` | `DEBUG_BACKTRACE_IGNORE_ARGS` | `debug_backtrace` 选项（默认忽略函数参数，减少输出） |
| `$limit` | `int` | `0` | 返回的最大帧数；`0` 表示不限制 |

**返回值**

- 无（输出后 `exit`）。

### `printContent($outputString, ...$value)` — 打印内容到标准输出

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$outputString` | `mixed` | 无 | 字符串时按 `printf` 格式输出；非字符串（如数组）用 `print_r` 输出 |
| `$value` | `mixed`（可变参数） | 无 | 配合 `$outputString` 的格式占位符值（如 `%s`） |

**返回值**

- 无（直接 `echo` / `print_r` 输出）。

**示例**

```php
Output::printContent("姓名：%s，年龄：%d\n", $name, $age);
Output::printContent($array);   // 数组直接 print_r
```

### `format(...$data)` — 以 HTML `<pre>` 形式输出

将数据格式化为纯文本后，用 `<pre>` 包裹并输出，适合 HTTP 调试场景。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed`（可变参数） | 无 | 任意数量的格式化数据 |

**返回值**

- 无（直接 `echo`）。

### `string(...$data)` — 格式化为纯文本字符串

返回不含 HTML 标签的文本，CLI / HTTP 通用。字符串与数字原样拼接，其他类型用 `print_r` 格式化，各项用换行连接。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed`（可变参数） | 无 | 任意数量的格式化数据 |

**返回值**

- `string`：拼接后的纯文本。

**示例**

```php
$text = Output::string($user, $config);   // CLI 下打印用
```

### `isCli()` — 是否为 CLI 运行环境

**参数**

- 无。

**返回值**

- `bool`：`PHP_SAPI === "cli"` 时返回 `true`，否则 `false`。
