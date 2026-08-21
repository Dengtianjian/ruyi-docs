# StorageFileInfoData — 文件信息数据对象

- **文件位置**: `kernel/Foundation/FileSystem/Storage/StorageFileInfoData.php`
- **命名空间**: `kernel\Foundation\FileSystem\Storage`
- **继承**: 继承 `kernel\Foundation\Object\DataObject`
- **是否可继承**: 是

描述单个文件信息的只读数据对象，`DataObject` 的唯一子类。实例化时一次性赋值，之后只读。构造时会自动用 `path` + `name` 拼接 `filePath`（除非显式传入 `filePath`）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$key` | `string\|null` | `null` | protected | 文件键 |
| `$name` | `string\|null` | `null` | protected | 文件名称 |
| `$sourceFileName` | `string\|null` | `null` | protected | 原文件名称 |
| `$path` | `string\|null` | `null` | protected | 文件路径（相对存储根目录的目录部分） |
| `$extension` | `string\|null` | `null` | protected | 文件扩展名 |
| `$size` | `int\|null` | `null` | protected | 文件大小（字节） |
| `$filePath` | `string\|null` | `null` | protected | 文件保存路径（完整，含目录与文件名） |
| `$width` | `int\|null` | `null` | protected | 媒体文件宽度；非媒体文件为 `null` |
| `$height` | `int\|null` | `null` | protected | 媒体文件高度；非媒体文件为 `null` |
| `$remote` | `bool` | `false` | protected | 是否远程存储 |
| `$platform` | `string` | `"local"` | protected | 存储平台 |
| `$url` | `string\|null` | `null` | protected | 文件访问 URL |
| `$previewURL` | `string\|null` | `null` | protected | 预览 URL 链接 |
| `$downloadURL` | `string\|null` | `null` | protected | 下载 URL 链接 |
| `$transferPreviewURL` | `string\|null` | `null` | protected | 中转预览 URL 链接 |
| `$transferDownloadURL` | `string\|null` | `null` | protected | 中转下载 URL 链接 |
| `$accessControl` | `string\|bool` | `false` | protected | 访问权限控制标签 |
| `$ownerId` | `string\|bool` | `false` | protected | 所属用户标识 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($data)` | 构造：自动拼接 `filePath`，一次性赋值 |

## 方法

### `__construct($data)` — 构造

自动拼接 `filePath`：当传入数据**未显式提供** `filePath`（或其为空）、且同时提供 `path` 与 `name` 时，用 `FileHelper::combinedFilePath($path, $name)` 拼接。随后交给父类 `DataObject` 填充属性（缺键保留默认值）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `array\|object` | 无 | 文件信息数据 |

**返回值**

- 无。

**示例**

```php
$info = new StorageFileInfoData([
    "key" => "avatars/a.png",
    "path" => "avatars",
    "name" => "a.png",
]);
$info->filePath;   // "avatars/a.png"（自动拼接）
```

---

> **继承自 `DataObject`**：`toArray()` / `toJson()` / `has()` / `get()` / `keys()` 等只读容器方法可用，见《Object/DataObject》页。
