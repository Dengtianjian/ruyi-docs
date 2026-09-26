# Storage — 文件存储门面

- **文件位置**: `kernel/Facades/Storage.php`
- **命名空间**: `kernel\Facades`
- **继承**: `kernel\Foundation\Facade`
- **类型**: 单例门面（覆写 `resolve()`，自动判定为单例）

文件存储门面，是存储聚合类 [`FileStorage`](../foundation/filesystem/storage/file-storage.md) 的静态入口：通过本门面可静态调用上传、URL 生成、签名校验、访问控制等能力，无需手动持有实例。

## 单例实例来源

按优先级：

1. **推荐**：装配阶段 `new FileStorage([...])` 注入磁盘。聚合类构造时会自动调用 `Storage::setInstance($this)`，本门面随即就绪。
2. 手动 `Storage::setInstance($customInstance)` 注入自定义实例（多磁盘 / 云存储 / 元信息落库）。
3. 若都未设置，首次静态调用触发 `resolve()` 兜底：`new FileStorage(["local" => new LocalStorage()])`（本地磁盘、未启用数据存储）。

## 用法

```php
use kernel\Facades\Storage;

Storage::put($file, "images/a.png");   // 上传到当前磁盘
$url = Storage::url("images/a.png");   // 生成带签名访问 URL
Storage::use("cos");                   // 切换当前磁盘
```

## 方法

本门面是 `FileStorage` 的单例代理，所有静态方法转发到同一个 `FileStorage` 实例。完整方法（`disks` / `disk` / `use` / `enableDataSave` / `model` / `auth` / `accessControl` / `get` / `put` / `save` / `add` / `update` / `delete` / `exists` / `url` / `verifySignature` …）见 [FileStorage 使用文档](../foundation/filesystem/storage/file-storage.md)。

## 相关

- 聚合类（被转发对象）：[FileStorage](../foundation/filesystem/storage/file-storage.md)
- 门面基类：[Facade](../foundation/facade.md)
- 同类单例门面参照：[Crons 门面](./crons.md)
