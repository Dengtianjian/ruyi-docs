# File — 文件操作

如意框架提供两个文件操作类，分工明确：

| 类 | 命名空间 | 定位 |
|------|------|------|
| [FileSystem](./filesystem.md) | `kernel\Foundation\FileSystem\FileSystem` | 文件系统总管理：路径计算与文件操作（上传、创建、复制、移动、删除、读取等） |
| [FileHelper](./file-helper.md) | `kernel\Foundation\FileSystem\FileHelper` | 文件辅助：类型判断、路径处理、目录扫描、格式化等底层工具方法 |

> **历史说明**: 旧版 `kernel\Foundation\File` 类已删除，其能力已全部并入上述两个新类（文件操作用于 FileSystem，类型判断/路径拼接/目录扫描用于 FileHelper）。

## 快速选择

| 你需要... | 使用 |
|-----------|------|
| 获取目录路径（root/data/storage） | [FileSystem](./filesystem.md) |
| 上传文件、读取/写入文件内容 | [FileSystem](./filesystem.md) |
| 复制/移动/删除文件或目录 | [FileSystem](./filesystem.md) |
| 判断文件类型（图片/视频/音频） | [FileHelper](./file-helper.md) |
| 拼接路径、格式化文件大小 | [FileHelper](./file-helper.md) |
| 扫描/比较目录 | [FileHelper](./file-helper.md) |
| 获取文件 MIME 类型、扩展名 | [FileHelper](./file-helper.md) |
