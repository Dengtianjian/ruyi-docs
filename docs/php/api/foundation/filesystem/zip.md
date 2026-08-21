# Zip — ZIP 压缩/解压工具

- **文件位置**: `kernel/Foundation/FileSystem/Zip.php`
- **命名空间**: `kernel\Foundation\FileSystem`
- **是否可继承**: 是

基于 PHP 内置 `ZipArchive` 的目录打包与解压封装。

- `zipDirectory()` / `pack()`：目录递归打包，支持黑名单排除、压缩等级配置；
- `unzip()` / `extract()`：解压并内置 **zip slip**（路径穿越）、**zip bomb**（解压大小/文件数上限）、**符号链接**三重防护；
- `isZip()`：按 magic bytes 快速校验是否合法 zip。

**提供两种用法**：
- **实例链式**：`setCompressionLevel()` / `exclude()` / `maxExtractSize` 等属性可配置；
- **静态无状态**：`pack()` / `extract()` 通过 `$options` 数组传参，不依赖实例状态。

**黑名单规则**（`blacklist`，默认 `[".git", "README.md"]`）：
- 普通条目按**文件名精确匹配**（任意层级同名即排除，如 `.git`）；
- 含通配符（`*`、`?`、`[]`）的条目按 `fnmatch` 对文件名匹配（如 `*.md`）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$blacklist` | `array` | `[".git", "README.md"]` | public | 打包排除名单：精确文件名或 fnmatch 通配符 |
| `$compressionLevel` | `int` | `-1` | public | 压缩等级：`-1` 使用默认，`0-9` 为 DEFLATE 等级 |
| `$maxExtractSize` | `int` | `0` | public | 解压总大小上限（字节），`0` 不限制（防 zip bomb） |
| `$maxExtractFiles` | `int` | `0` | public | 解压文件数上限，`0` 不限制（防 zip bomb） |
| `$preserveSymlinks` | `bool` | `false` | public | 解压是否保留符号链接；`false` 跳过链接条目（防链接越界） |
| `$blacklistFileNames` | `array` | `[]` | protected | 本次打包精确匹配的黑名单（每次打包前重置） |
| `$blacklistWildcards` | `array` | `[]` | protected | 本次打包的通配符黑名单（仅本次生效） |
| `$lastError` | `string\|null` | `null` | protected | 最近一次操作的错误信息；成功或未操作为 `null` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `setCompressionLevel($level)` | 配置压缩等级（链式） |
| `exclude(array $names)` | 追加黑名单条目（链式） |
| `lastError()` | 获取最近一次操作的错误信息 |
| `isZip($path)` | 快速校验文件是否为合法 zip |
| `zipDirectory($sourcePath, $outputPath)` | 目录递归打包为 zip |
| `unzip(string $filePath, string $dest)` | 解压 zip 到指定目录 |
| `Zip::pack($sourcePath, $outputPath, $options)` | 静态快捷打包 |
| `Zip::extract($filePath, $dest, $options)` | 静态快捷解压 |
| `extractWithGuard($zip, $dest)` | 守卫式解压（private） |
| `directoryToZip($zip, $directory, $removedLength)` | 递归遍历目录写入 zip（private） |

## 方法

### `setCompressionLevel($level)` — 配置压缩等级

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$level` | `int` | 无 | 压缩等级：`-1` 使用 ZipArchive 默认，`0-9` 为 DEFLATE 等级 |

**返回值**

- `$this`：支持链式调用。

### `exclude(array $names)` — 追加黑名单条目

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$names` | `array` | 无 | 文件名或 fnmatch 通配符数组，如 `[".svn", "*.log"]`，会去重合并进 `blacklist` |

**返回值**

- `$this`：支持链式调用。

### `lastError()` — 获取错误信息

**参数**

- 无。

**返回值**

- `string|null`：失败原因描述；成功或未操作为 `null`。

### `isZip($path)` — 校验是否为合法 zip

按文件头 magic bytes（`PK\x03\x04` / `PK\x05\x06` / `PK\x07\x08`）判断。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$path` | `string` | 无 | 待校验文件路径 |

**返回值**

- `bool`：是 zip 返回 `true`；文件不存在或 magic 不符返回 `false`。

### `zipDirectory($sourcePath, $outputPath)` — 目录递归打包

目录不存在返回 `false`；打包过程中黑名单条目（任意层级）被跳过。失败原因可经 `lastError()` 读取。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sourcePath` | `string` | 无 | 源目录路径 |
| `$outputPath` | `string` | 无 | 输出 zip 文件路径（已存在则覆盖） |

**返回值**

- `bool`：打包成功返回 `true`；源目录不存在或打开 zip 失败返回 `false`。

### `unzip(string $filePath, string $dest)` — 解压 zip

目标目录不存在自动创建（0755）。内置多重防护：zip slip（拒绝含 `..`/绝对路径条目）、目标越界（realpath 校验）、zip bomb（大小/文件数上限）、符号链接策略。失败原因可经 `lastError()` 读取。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | zip 文件路径 |
| `$dest` | `string` | 无 | 解压目标目录 |

**返回值**

- `bool`：解压成功返回 `true`；zip 无效、含危险条目或超限返回 `false`。

### `Zip::pack($sourcePath, $outputPath, array $options = [])` — 静态快捷打包

无状态入口，内部 `new Zip` 并应用选项后调用 `zipDirectory()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sourcePath` | `string` | 无 | 源目录路径 |
| `$outputPath` | `string` | 无 | 输出 zip 文件路径 |
| `$options` | `array` | `[]` | 选项：`blacklist`（追加黑名单）、`compressionLevel`（压缩等级 `-1~9`） |

**返回值**

- `bool`：打包成功返回 `true`。

### `Zip::extract($filePath, $dest, array $options = [])` — 静态快捷解压

无状态入口。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | zip 文件路径 |
| `$dest` | `string` | 无 | 解压目标目录 |
| `$options` | `array` | `[]` | 选项：`maxExtractSize`（总大小上限，`0` 不限）、`maxExtractFiles`（文件数上限，`0` 不限）、`preserveSymlinks`（是否保留符号链接） |

**返回值**

- `bool`：解压成功返回 `true`。

### `extractWithGuard($zip, $dest)` — 守卫式解压

> private。逐条目流式解压并累计写入字节数：校验 zip slip、目标越界、文件数/总大小上限，超限即中止返回 `false`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$zip` | `\ZipArchive` | 无 | 已打开的 zip 实例 |
| `$dest` | `string` | 无 | 解压目标目录 |

**返回值**

- `bool`：全部安全解压返回 `true`；任一校验失败返回 `false`。

### `directoryToZip($zip, $directory, $removedLength)` — 递归遍历目录写入 zip

> private。文件条目 `addFile`、目录条目 `addEmptyDir` 后递归；符号链接跳过；黑名单按文件名匹配任意层级；压缩等级非默认时逐条目设置。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$zip` | `\ZipArchive` | 无 | 目标 zip 实例 |
| `$directory` | `string` | 无 | 当前遍历目录 |
| `$removedLength` | `int` | 无 | 源目录字符串长度（计算 zip 内相对路径） |

**返回值**

- 无（`void`）。
