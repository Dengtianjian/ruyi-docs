# File — 文件操作

File 提供文件和目录操作的静态方法集合，包括文件上传、目录复制/删除、文件创建等。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/File.php`
- **特点**: 全部为静态方法

> **注意**: 该类标记为 `@deprecated`，新代码建议使用 `kernel\Foundation\File\FileHelper` 和 `kernel\Foundation\File\FileManager`。

## 方法列表

### `isVideo($fileName)`

判断指定文件是否为视频文件（文件必须存在）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$fileName` | `string` | 文件完整路径 |

返回值：`bool`

```php
if (File::isVideo("/path/to/movie.mp4")) {
    // 是视频文件
}
```

### `isImage($fileName)`

判断指定文件是否为图片文件（文件必须存在）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$fileName` | `string` | 文件完整路径 |

返回值：`bool`

```php
if (File::isImage("/path/to/photo.png")) {
    // 是图片文件
}
```

### `upload($files, $savePath, $fileName = null)`

上传文件并保存到服务器。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$files` | `array\|string` | 上传的文件或文件路径字符串 |
| `$savePath` | `string` | 保存的目标目录完整路径 |
| `$fileName` | `string\|null` | 保存的文件名（不含扩展名），`null` 自动生成 |

返回值：`array` — 文件信息数组，包含 `path`、`extension`、`sourceFileName`、`size`、`fullPath` 等

```php
$result = File::upload($_FILES['avatar'], F_APP_STORAGE . "/avatars");
// ["path" => "...", "extension" => "png", "size" => 12345, "fullPath" => "..."]
```

### `cloneDirectory($sourcePath, $destPath)`

克隆目录（递归复制所有文件和子目录）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$sourcePath` | `string` | 源目录路径 |
| `$destPath` | `string` | 目标目录路径 |

```php
File::cloneDirectory("/path/source", "/path/dest");
```

### `createFile($filePath, $fileContent = "", $overwrite = false)`

创建文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 文件完整路径 |
| `$fileContent` | `string` | 文件内容 |
| `$overwrite` | `bool` | 是否覆盖已存在的文件 |

返回值：`bool`

```php
File::createFile("/path/to/file.txt", "Hello World");
File::createFile("/path/to/file.txt", "New Content", true);  // 覆盖
```

### `deleteDirectory($path)`

递归删除目录及其下所有文件（**不可恢复，谨慎使用**）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 要删除的目录路径 |

返回值：`bool`

```php
File::deleteDirectory("/path/to/temp");
```

### `mkdir($dirs, $baseDir = "", $permissions = 0757)`

创建文件夹。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$dirs` | `array` | 路径项数组 |
| `$baseDir` | `string` | 基目录 |
| `$permissions` | `int` | 文件夹权限 |

返回值：`bool`

```php
File::mkdir(["storage", "uploads"], F_APP_ROOT);
// 创建 {F_APP_ROOT}/storage/uploads
```

### `genPath(...$els)`

生成路径字符串（自动使用系统分隔符）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$els` | `string` | 路径组成部分 |

返回值：`string`

```php
$path = File::genPath(F_APP_ROOT, "Storage", "images");
// 在 Linux 上: /path/to/app/Storage/images
```

### `scandir($targetPath, $sorting_order = 0, $context = null)`

扫描目录，排除 `.` 和 `..`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 目录路径 |
| `$sorting_order` | `int` | 排序方式 |
| `$context` | `mixed` | 上下文 |

返回值：`array|false`

```php
$files = File::scandir("/path/to/dir");
// ["file1.txt", "file2.txt", "subdir"]
```

### `clearFolder($targetPath, $whiteList = [])`

清空文件夹内容（保留文件夹本身）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 目标文件夹路径 |
| `$whiteList` | `array` | 跳过的白名单路径 |

返回值：`bool`

```php
File::clearFolder("/path/to/cache", ["/path/to/cache/keep.txt"]);
```

### `copyFolder($targetPath, $destPath, $whiteList = [])`

复制文件夹（递归复制）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 源目录 |
| `$destPath` | `string` | 目标目录 |
| `$whiteList` | `array` | 跳过的白名单路径 |

返回值：`bool`

### `compareDirectories($targetPath, $sourcePath)`

比较两个目录是否相等（深度比较）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 目录 1 |
| `$sourcePath` | `string` | 目录 2 |

返回值：`bool`

### `recursionScanDir($rootDir, $includeDir = false)`

递归扫描目录下的所有文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$rootDir` | `string` | 根目录 |
| `$includeDir` | `bool` | 是否包含目录路径 |

返回值：`string[]`

```php
$allFiles = File::recursionScanDir("/path/to/project");
// ["/path/to/project/a.php", "/path/to/project/b.php", ...]
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 加载文件 | 用于加载路由文件 |
| [Cache](./cache.md) | 文件操作 | 缓存底层使用文件存储 |
