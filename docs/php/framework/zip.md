# Zip — ZIP 压缩/解压工具

Zip 提供目录递归打包与安全解压能力，基于 PHP 内置 `ZipArchive`（需启用 `ext-zip` 扩展）封装：

- **打包**：`zipDirectory()` / `pack()` 将目录递归打包为 zip，支持黑名单排除、压缩等级配置；
- **解压**：`unzip()` / `extract()` 解压到指定目录，内置 **zip slip（路径穿越）防护**、**zip bomb（解压炸弹）双上限**、符号链接策略；
- **校验**：`isZip()` 通过 magic bytes 快速判断文件是否为合法 zip。

同时提供实例链式调用（`setCompressionLevel()` / `exclude()` 返回 `$this`）与静态无状态入口（`pack()` / `extract()`，选项数组传入，不依赖实例状态）。

- **命名空间**: `kernel\Foundation\FileSystem\Zip`
- **文件位置**: `kernel/Foundation/FileSystem/Zip.php`
- **依赖**: PHP `ext-zip`（`ZipArchive`）

## 快速开始

### 静态打包 `pack($sourcePath, $outputPath, $options = [])`

将目录递归打包为 zip，无需实例化。输出文件已存在时自动覆盖。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$sourcePath` | `string` | 源目录路径 |
| `$outputPath` | `string` | 输出 zip 文件路径（已存在则覆盖） |
| `$options` | `array` | 选项数组，见下表 |

`$options` 支持的键：

| 键 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `blacklist` | `string\|array` | 类默认黑名单 | 追加打包排除条目（合并进默认黑名单） |
| `compressionLevel` | `int` | `-1` | 压缩等级，`-1`=ZipArchive 默认，`0-9`=DEFLATE 等级 |

返回值：`bool`

```php
use kernel\Foundation\FileSystem\Zip;

// 最简打包
Zip::pack('/path/to/project', '/path/to/project.zip');

// 追加排除 *.log，使用高压缩
Zip::pack('/path/to/project', '/path/to/project.zip', [
    'blacklist'        => ['*.log', 'vendor'],
    'compressionLevel' => 9,
]);
```

### 静态解压 `extract($filePath, $dest, $options = [])`

解压 zip 到指定目录，目标目录不存在时自动创建（0755）。内置多重安全防护（见[安全防护](#安全防护)）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | zip 文件路径 |
| `$dest` | `string` | 解压目标目录 |
| `$options` | `array` | 选项数组，见下表 |

`$options` 支持的键：

| 键 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `maxExtractSize` | `int` | `0` | 解压后总大小上限（字节），`0`=不限制（防 zip bomb） |
| `maxExtractFiles` | `int` | `0` | 解压文件数上限，`0`=不限制（防 zip bomb） |
| `preserveSymlinks` | `bool` | `false` | 是否保留符号链接条目，`false`=跳过链接条目（防链接指向目标目录外） |

返回值：`bool`

```php
// 最简解压（自动创建目标目录）
Zip::extract('/path/to/project.zip', '/path/to/extracted');

// 限制解压规模，防止 zip 炸弹
Zip::extract('/path/to/project.zip', '/path/to/extracted', [
    'maxExtractSize'  => 1024 * 1024 * 500,   // 500MB
    'maxExtractFiles' => 1000,                // 最多 1000 个文件
]);
```

## 实例使用

实例方式适合需要**复用配置**（黑名单、压缩等级、解压上限）的场景，`setCompressionLevel()` 与 `exclude()` 支持链式调用：

```php
$zip = new Zip();
$zip->exclude(['.svn', '*.tmp'])
    ->setCompressionLevel(9)
    ->zipDirectory('/path/to/project', '/path/to/project.zip');
```

### `zipDirectory($sourcePath, $outputPath)`

将目录递归打包为 zip。打包过程中黑名单内条目（任意层级）会被跳过，符号链接不打包。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$sourcePath` | `string` | 源目录路径（不存在返回 `false`） |
| `$outputPath` | `string` | 输出 zip 文件路径（已存在则覆盖） |

返回值：`bool` — 失败时可通过 `lastError()` 读取原因

```php
$ok = $zip->zipDirectory('/path/to/project', '/path/to/project.zip');
if (!$ok) {
    echo $zip->lastError();
}
```

### `unzip($filePath, $dest)`

解压 zip 到指定目录，目标目录不存在时自动创建（0755）。防护逻辑与静态 `extract()` 一致，限制通过实例属性配置。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | zip 文件路径 |
| `$dest` | `string` | 解压目标目录 |

返回值：`bool`

```php
$zip = new Zip();
$zip->maxExtractSize  = 1024 * 1024 * 500;  // 500MB
$zip->maxExtractFiles = 1000;
$zip->unzip('/path/to/project.zip', '/path/to/extracted');
```

### `setCompressionLevel($level)`（链式）

配置压缩等级。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$level` | `int` | `-1`=使用 ZipArchive 默认，`0-9`=DEFLATE 压缩等级；越界值不生效并写入 `lastError()` |

返回值：`$this`

### `exclude(array $names)`（链式）

追加黑名单条目，去重合并进 `$blacklist`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$names` | `array` | 文件名或 fnmatch 通配符（如 `[".svn", "*.log"]`） |

返回值：`$this`

### `lastError()`

获取最近一次操作的错误信息。

返回值：`string|null` — 失败原因描述；成功或未操作时为 `null`

### `isZip($path)`

通过 magic bytes（`PK\x03\x04` 等）快速校验文件是否为合法 zip。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 待校验文件路径 |

返回值：`bool` — 是 zip 返回 `true`；文件不存在或 magic 不符返回 `false`

```php
$zip = new Zip();
if ($zip->isZip($file)) {
    // 处理上传的 zip 文件
}
```

## 黑名单规则

`$blacklist` 属性控制打包排除条目，默认 `[".git", "README.md"]`，每次 `zipDirectory()` 打包时**重置解析结果**（连续打包多个目录互不残留），按**文件名**匹配**任意层级**：

- **普通条目**：精确匹配文件名，任意层级同名即排除（如 `.git`、`README.md`）；
- **含通配符条目**（`*`、`?`、`[]`）：按 `fnmatch` 对文件名匹配（如 `*.md`、`*.log`）。

```php
$zip = new Zip();
$zip->blacklist = ['.git', 'README.md', '*.log', 'vendor'];  // 直接设置
$zip->exclude(['.svn', '*.tmp']);                             // 或链式追加
```

## 安全防护

解压（`unzip` / `extract`）内置四重防护，任一校验失败即中止并返回 `false`：

| 防护 | 说明 |
|------|------|
| **zip slip（路径穿越）** | 含 `..`、以 `/` 开头（绝对路径）、盘符开头（`C:`）的条目直接拒绝 |
| **目标目录越界** | 条目解析出的真实目录（`realpath`）必须在解压目标之内，防止软链接/符号路径逃逸 |
| **zip bomb 双上限** | 解压总大小（`maxExtractSize`，按实际写入量累计）与文件数（`maxExtractFiles`）超限即中止 |
| **符号链接策略** | 默认跳过符号链接条目；`preserveSymlinks = true` 时保留（仅限非空链接目标） |

::::: warning 注意
从不可信来源（如用户上传）解压 zip 时，务必设置 `maxExtractSize` / `maxExtractFiles` 上限，防止 zip 炸弹耗尽磁盘与内存。未设置（`0`）时不做规模限制。
:::::

## 属性参考

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$blacklist` | `array` | `[".git", "README.md"]` | 打包排除名单：普通条目精确匹配文件名，含通配符条目 `fnmatch` 匹配 |
| `$compressionLevel` | `int` | `-1` | 压缩等级：`-1`=ZipArchive 默认，`0-9`=DEFLATE 等级 |
| `$maxExtractSize` | `int` | `0` | 解压后总大小上限（字节），`0`=不限制 |
| `$maxExtractFiles` | `int` | `0` | 解压文件数上限，`0`=不限制 |
| `$preserveSymlinks` | `bool` | `false` | 解压时是否保留符号链接条目（`false`=跳过） |

## 方法参考

| 方法 | 类型 | 说明 |
|------|------|------|
| `pack($sourcePath, $outputPath, $options)` | `static` | 静态快捷打包（无状态入口） |
| `extract($filePath, $dest, $options)` | `static` | 静态快捷解压（无状态入口） |
| `zipDirectory($sourcePath, $outputPath)` | 实例 | 目录递归打包 |
| `unzip($filePath, $dest)` | 实例 | 安全解压 |
| `setCompressionLevel($level)` | 实例（链式） | 配置压缩等级 |
| `exclude(array $names)` | 实例（链式） | 追加黑名单条目 |
| `lastError()` | 实例 | 获取最近一次错误信息 |
| `isZip($path)` | 实例 | 校验文件是否为合法 zip |
