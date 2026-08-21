# Statement — SQL 语句

- **文件位置**: `kernel/Foundation/Database/PDO/Statement.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **是否可继承**: 是

预处理语句封装，绑定参数并执行，支持遍历结果。

## 使用

```php
use kernel\Foundation\Database\PDO\Statement;

$stmt = new Statement($driver, "SELECT * FROM users WHERE id = ?");
$stmt->bindParams([$id]);
$row = $stmt->fetch();
```

## 方法

| 方法 | 说明 |
|------|------|
| `__construct($driver, $sql)` | 构建语句 |
| `bindParams(array $params)` | 绑定参数 |
| `execute()` | 执行 |
| `fetch()` / `fetchAll()` | 获取结果 |
| `rowCount()` | 影响行数 |
