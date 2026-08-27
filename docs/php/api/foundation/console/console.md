# Console — 控制台应用

- **文件位置**: `kernel/Foundation/Console/Console.php`
- **命名空间**: `kernel\Foundation\Console`
- **继承自**: `App`
- **是否可继承**: 是

控制台应用入口，继承自 `App`。命令完全由本类实例管理，不再依赖 Router（Router 只负责 HTTP 路由）。Request 始终实例化（CLI 下其 URI 即命中的命令名）。提供命令注册、分发、参数解析、彩色输出与交互输入能力。

## 命令注册方式

命令通过本实例 `register()` / `discover()` 注册（存入实例级命令表 `$commands`）。业务方在各自 console 入口手动注册，内核命令在内核 `kernel/console` 入口注册。

命令处理器支持三种形式：

1. 命令控制器类：实现 `handle(Console $console, array $args, array $options): int`，类放 `Controller/` 目录。
2. `[类名, 方法名]`：指定命令控制器中的处理方法（`register` 第二参传数组）。
3. 闭包：`function (Console $console, array $args, array $options): int`。

命令名支持冒号命名空间（如 `make:controller`）；输入空参数、`help`、`-h` 或 `--help` 时自动列出全部已注册命令。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$commands` | `array<string, array>` | `[]` | protected | 已注册的命令，值为 `{handler, description}` |
| `$argv` | `array` | `[]` | protected | 命令行参数（不含脚本名） |
| `$commandName` | `string` | `""` | protected | 当前命令名 |
| `$arguments` | `array` | `[]` | protected | 位置参数 |
| `$options` | `array` | `[]` | protected | 选项参数 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($AppId, $KernelId)` | 构建控制台应用并注册 CLI 异常/错误处理器 |
| `register($name, $handler, $description)` | 注册命令 |
| `discover($directory, $namespace)` | 从目录自动发现并注册命令类 |
| `commands()` | 获取已注册的全部命令（本实例命令表） |
| `command()` | 获取当前命令名 |
| `argument($index, $default)` | 获取位置参数 |
| `option($name, $default)` | 获取选项值 |
| `handle($argv)` | 分发执行命令 |
| `parseArguments($argv)` | 解析命令行参数（protected） |
| `isOption($arg)` | 判断参数是否为选项形式（protected） |
| `isOptionValue($argv, $nextIndex)` | 判断下一参数是否为选项值（protected） |
| `execute($command)` | 执行命令处理器（protected） |
| `listCommands($exitCode)` | 输出帮助，列出所有命令（protected） |
| `line($text, $color, $stream)` | 输出一行文本 |
| `success($text)` | 绿色成功输出 |
| `info($text)` | 青色信息输出 |
| `warning($text)` | 黄色警告输出 |
| `error($text)` | 红色错误输出，写入 STDERR |
| `supportsColor()` | 是否支持 ANSI 颜色（protected） |
| `ask($question, $default)` | 提示输入 |
| `confirm($question, $default)` | 确认询问 |
| `secret($question)` | 静默输入（不回显） |
| `run()` | 覆写 App::run，执行命令分发并以退出码结束 |

## 方法

### `__construct($AppId = "kernel", $KernelId = "kernel")` — 构建控制台应用

调用父类构造，捕获 `GLOBALS['argv']`（去掉脚本名），并注册 CLI 环境下的异常处理与错误处理：异常输出到 stderr 并以非 0 退出，非致命错误输出警告。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$AppId` | `string` | `"kernel"` | 应用 ID |
| `$KernelId` | `string` | `"kernel"` | 内核 ID |

**返回值**

- 无。

### `register($name, $handler, $description)` — 注册命令

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 命令名，如 `"make:controller"`，支持冒号命名空间 |
| `$handler` | `callable\|string` | 无 | 闭包 `function(Console, array $args, array $options): int`，或命令类名（类需实现 `handle(Console, array, array): int`） |
| `$description` | `string` | `""` | 命令说明，用于帮助列表 |

**返回值**

- `Console`：当前实例（支持链式调用）。

### `discover($directory, $namespace)` — 从目录自动发现命令类

扫描指定目录下所有 `.php` 文件，按 PSR-4 约定推断类名（命名空间 + 文件名）。类存在且定义了 `$name` 属性（命令名）即注册，`$description` 属性作为命令说明。目录不存在或无可发现命令时静默返回。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$directory` | `string` | 无 | 命令类所在目录（绝对路径） |
| `$namespace` | `string` | 无 | 命令类命名空间，类名取文件名，如 `"App\Commands"` |

**返回值**

- `Console`：当前实例（支持链式调用）。

### `commands()` — 获取已注册的全部命令

返回本实例 `register()`/`discover()` 注册的全部命令（`$this->commands`）。

**参数**

- 无。

**返回值**

- `array<string, array>`：命令名 => 命令定义（`{handler, description}`）。

### `command()` — 获取当前命令名

**参数**

- 无。

**返回值**

- `string`：当前命令名。

### `argument($index, $default)` — 获取位置参数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$index` | `int` | 无 | 参数下标，从 0 开始 |
| `$default` | `mixed` | `null` | 不存在时返回的默认值 |

**返回值**

- `mixed`：位置参数值。

### `option($name, $default)` — 获取选项值

支持 `--key=value`、`--key value`、`-k value`、`--flag`（布尔 `true`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 选项名 |
| `$default` | `mixed` | `null` | 不存在时返回的默认值 |

**返回值**

- `mixed`：选项值。

### `handle($argv)` — 分发执行命令

分发前触发生命周期"启动"钩子（bootUp），命令执行完毕（正常或异常）后触发"结束"钩子（shutdown）。命令抛出的异常会先执行错误钩子（onError）与结束钩子，再交由 CLI 异常处理器输出并退出。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$argv` | `array` | `null` | 命令行参数（不含脚本名）。不传时使用构造时捕获的 `GLOBALS['argv']` |

**返回值**

- `int`：退出码。

### `parseArguments($argv)` — 解析命令行参数

> protected。第一个非选项参数作为命令名，其余为位置参数；选项支持 `--key=value`、`--key value`、`-k value`、`--flag`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$argv` | `array` | 无 | 参数数组 |

**返回值**

- `array`：`[命令名, 位置参数, 选项]`。

### `isOption($arg)` — 判断参数是否为选项形式

> protected。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$arg` | `string` | 无 | 参数 |

**返回值**

- `bool`：以 `-` 开头且长度大于 1 返回 `true`。

### `isOptionValue($argv, $nextIndex)` — 判断下一参数是否为选项值

> protected。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$argv` | `array` | 无 | 参数数组 |
| `$nextIndex` | `int` | 无 | 下一参数下标 |

**返回值**

- `bool`：存在且非选项形式返回 `true`。

### `execute($command)` — 执行命令处理器

> protected。命令定义统一为 `handler` 键：命令类名（调用 `handle()`）、`[类名, 方法名]` 或闭包。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$command` | `array` | 无 | 命令定义 |

**返回值**

- `int`：退出码。

### `listCommands($exitCode)` — 输出帮助

> protected。列出所有已注册命令及选项说明。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$exitCode` | `int` | `0` | 返回的退出码，help 场景为 `0`，命令不存在时传 `1` |

**返回值**

- `int`：退出码。

### `line($text, $color, $stream)` — 输出一行文本

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$text` | `string` | `""` | 文本 |
| `$color` | `string\|null` | `null` | ANSI 颜色码，如 `"32"` 绿色；`null` 无色 |
| `$stream` | `resource\|null` | `null` | 输出流，默认 `STDOUT` |

**返回值**

- `Console`：当前实例（支持链式调用）。

### `success($text)` — 绿色成功输出

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$text` | `string` | 无 | 文本 |

**返回值**

- `Console`：当前实例（支持链式调用）。

### `info($text)` — 青色信息输出

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$text` | `string` | 无 | 文本 |

**返回值**

- `Console`：当前实例（支持链式调用）。

### `warning($text)` — 黄色警告输出

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$text` | `string` | 无 | 文本 |

**返回值**

- `Console`：当前实例（支持链式调用）。

### `error($text)` — 红色错误输出

输出到 `STDERR`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$text` | `string` | 无 | 文本 |

**返回值**

- `Console`：当前实例（支持链式调用）。

### `supportsColor()` — 是否支持 ANSI 颜色

> protected。TTY 且未设置 `NO_COLOR` 环境变量时支持。

**参数**

- 无。

**返回值**

- `bool`：支持返回 `true`，否则 `false`。

### `ask($question, $default)` — 提示输入

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$question` | `string` | 无 | 问题 |
| `$default` | `mixed` | `null` | 默认值，回车直接使用 |

**返回值**

- `string`：输入内容。

### `confirm($question, $default)` — 确认询问

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$question` | `string` | 无 | 问题 |
| `$default` | `bool` | `true` | 默认值，回车直接使用 |

**返回值**

- `bool`：输入 `y`/`yes` 返回 `true`，否则按默认或 `false`。

### `secret($question)` — 静默输入

用于密码等敏感信息。Unix 下通过 `stty` 关闭回显。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$question` | `string` | 无 | 问题 |

**返回值**

- `string`：输入内容。

### `run()` — 运行控制台

覆写 `App::run()`，执行命令分发并以退出码结束进程。

**参数**

- 无。

**返回值**

- 无（内部 `exit()`）。

## 示例

入口脚本 `kernel/console`：

```php
$console = new Console("kernel");
$console->run(); // 内部调用 handle() 分发命令并以退出码结束
```

命令行调用：

```bash
php kernel/console make:app hello --name=john
```
