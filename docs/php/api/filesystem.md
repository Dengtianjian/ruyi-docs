# FileSystem 文件系统

- **目录位置**: `kernel/Foundation/FileSystem/`
- **命名空间**: `kernel\Foundation\FileSystem`

文件操作、路径推导与压缩。路径 getter 集中在 **`Path`** 类；文件操作在 **`FileSystem`** 类；另有 `Zip`（压缩）与 `FileHelper`（路径拼接）。

## Path — 路径

- **文件位置**: `kernel/Foundation/FileSystem/Path.php`
- **命名空间**: `kernel\Foundation\FileSystem`

纯静态、无副作用，非 `final` 可继承扩展。依赖 `App::id()` 的 getter 未实例化时返回 `null`。

### 7 个静态 getter

| 方法 | 返回路径 |
|------|----------|
| `Path::kernelRoot()` | kernel 目录：`dirname(__DIR__, 2)` |
| `Path::projectRoot()` | 项目根：`\DISCUZ_ROOT`(rtrim) 否则 `dirname(kernelRoot())` |
| `Path::root()` | `dirname(kernelRoot()) / {App::id()}` |
| `Path::data()` | `root / Data` |
| `Path::storage()` | `root / Storage` |
| `Path::kernelDir()` | kernel 相对目录 |
| `Path::dir()` | 相对目录 |

```php
use kernel\Foundation\FileSystem\Path;

$storage = Path::storage();     // {projectRoot}/{App::id()}/Storage
$root = Path::root();
$kernel = Path::kernelRoot();
```

## FileSystem — 文件操作

- **文件位置**: `kernel/Foundation/FileSystem/FileSystem.php`
- **命名空间**: `kernel\Foundation\FileSystem`

仅文件操作。无参构造自动 `ensureDirectories()`。路径统一用 `Path::storage()` 等。

```php
use kernel\Foundation\FileSystem\FileSystem;

$fs = new FileSystem();
$content = $fs->read(Path::storage() . "/config.json");
$fs->write(Path::storage() . "/config.json", $content);
```

### 常用方法

| 方法 | 说明 |
|------|------|
| `ensureDirectories()` | 确保 data/storage 目录存在（构造时调用） |
| `read($path)` | 读取文件 |
| `write($path, $content)` | 写入文件 |
| `delete($path)` | 删除文件 |
| `exists($path)` | 判断存在 |
| `copy($src, $dest)` | 复制 |
| `move($src, $dest)` | 移动 |
| `mkdir($dir, $recursive)` | 创建目录 |
| `listFiles($dir)` | 列出文件 |
| `isDirectory($path)` / `isFile($path)` | 类型判断 |

## FileHelper — 路径拼接

- **文件位置**: `kernel/Foundation/FileSystem/FileHelper.php`
- **命名空间**: `kernel\Foundation\FileSystem`

路径拼接辅助。

| 方法 | 说明 |
|------|------|
| `FileHelper::combinedFilePath(...$parts)` | 拼接多段路径 |

```php
use kernel\Foundation\FileSystem\FileHelper;

$path = FileHelper::combinedFilePath($basePath, $fileName);
```

## Zip — 压缩

- **文件位置**: `kernel/Foundation/FileSystem/Zip.php`
- **命名空间**: `kernel\Foundation\FileSystem`

ZIP 压缩/解压。实例 API 与静态 API 并存。解压有严格安全守卫（防 zip slip / zip bomb / 符号链接逃逸）。

### 实例 API

| 方法 | 说明 |
|------|------|
| `zipDirectory($sourceDir, $zipPath)` | 压缩目录 |
| `unzip($zipPath, $destDir)` | 解压（带安全守卫） |
| `setCompressionLevel($level)` | 压缩级别 |
| `exclude($pattern)` | 排除规则 |
| `lastError()` | 最近错误 |
| `isZip($path)` | 是否合法 ZIP |

### 静态 API

| 方法 | 说明 |
|------|------|
| `Zip::pack($source, $zipPath)` | 压缩 |
| `Zip::extract($zipPath, $destDir)` | 解压 |

```php
use kernel\Foundation\FileSystem\Zip;

$zip = new Zip();
$zip->zipDirectory($sourceDir, $zipPath);
$zip->unzip($zipPath, $destDir);
```
