---
title: Schema
---

# Schema — 字段定义

`Schema` 是字段定义类，通过流式 API 定义列的类型、约束和索引。定义好的 `Schema[]` 数组放入 `Table::$schema`，由 `Table::create()` 生成建表 SQL。

## 基础用法

```php
use kernel\Foundation\Database\PDO\Schema;

// 基础格式：new Schema('字段名')->类型方法(参数)->修饰符...
new Schema('id')->bigint()->unsigned()->autoIncrement()->comment('主键');
new Schema('name')->varchar(100)->nullable(false)->comment('用户名');
new Schema('created_at')->datetime()->default('CURRENT_TIMESTAMP');
```

---

## 数值类型

| 方法 | SQL 类型 | 默认长度 |
|------|---------|---------|
| `bigint($length)` | BIGINT | 20 |
| `int($length)` | INT | 11 |
| `mediumint($length)` | MEDIUMINT | 9 |
| `smallint($length)` | SMALLINT | 6 |
| `tinyint($length)` | TINYINT | 4 |
| `decimal($precision, $scale)` | DECIMAL | (10, 2) |
| `float()` | FLOAT | - |
| `double()` | DOUBLE | - |

---

## 字符串类型

| 方法 | SQL 类型 | 默认长度 |
|------|---------|---------|
| `varchar($length)` | VARCHAR | 255 |
| `char($length)` | CHAR | 1 |
| `text()` | TEXT | - |
| `mediumtext()` | MEDIUMTEXT | - |
| `longtext()` | LONGTEXT | - |

---

## 日期/时间类型

| 方法 | SQL 类型 |
|------|---------|
| `datetime()` | DATETIME |
| `timestamp()` | TIMESTAMP |
| `date()` | DATE |
| `time()` | TIME |
| `timestamp_ms($length)` | VARCHAR（存储含毫秒的格式化时间） |

---

## 其他类型

| 方法 | SQL 类型 | 说明 |
|------|---------|------|
| `bool()` | TINYINT(1) | 布尔值 |
| `json()` | JSON | JSON 列 |
| `blob()` | BLOB | 二进制大对象 |
| `enum(array $values)` | ENUM | 枚举 |

---

## 修饰符

```php
// 约束
->nullable(false)                 // NOT NULL（默认允许 NULL）
->default('CURRENT_TIMESTAMP')   // 默认值
->unsigned()                      // 无符号（仅整数/浮点类型）
->autoIncrement()                 // 自增（自动设置 unsigned）

// 注释
->comment('字段说明')
```

---

## 索引

```php
// 主键
new Schema('id')->bigint()->primary();

// 自增主键（自动成为 PRIMARY KEY）
new Schema('id')->bigint()->autoIncrement();

// 唯一索引 → UNIQUE KEY `uk_code`
new Schema('code')->varchar(32)->unique();

// 普通索引 → INDEX `idx_name`（自动生成索引名）
new Schema('name')->varchar(100)->index();

// 自定义索引名 → INDEX `idx_custom`
new Schema('status')->tinyint()->index('idx_custom');
```

---

## getPhpType — 字段类型 → PHP 类型映射

`Schema::getPhpType()` 根据 SQL 类型自动推导对应的 PHP 类型：

| SQL 类型 | PHP 类型 |
|---------|---------|
| JSON | `array` |
| TINYINT(1) | `bool` |
| INT / BIGINT / SMALLINT / MEDIUMINT | `int` |
| FLOAT / DOUBLE / DECIMAL | `float` |
| DATETIME / TIMESTAMP (precision ≥ 3) | `timestamp_ms` |
| DATETIME / TIMESTAMP | `timestamp` |
| DATE | `date` |
| 其他 (VARCHAR, TEXT, BLOB, ENUM...) | `string` |

这个映射用于 `Table::getPhpSchema()`，供 `Model` 构造时自动生成 `$schemaCasts`，决定字段写入 DB 时的类型转换逻辑。

---

## 完整建表示例

```php
use kernel\Foundation\Database\PDO\Table;
use kernel\Foundation\Database\PDO\Schema;

class UsersTable extends Table
{
    public $schema = [];

    function __construct()
    {
        parent::__construct('users');
        $this->schema = [
            new Schema('id')->bigint()->unsigned()->autoIncrement()->comment('用户ID'),
            new Schema('name')->varchar(100)->nullable(false)->comment('用户名'),
            new Schema('email')->varchar(200)->unique()->comment('邮箱'),
            new Schema('password')->varchar(255)->nullable(false)->comment('密码哈希'),
            new Schema('avatar')->varchar(500)->default('')->comment('头像URL'),
            new Schema('status')->tinyint()->default(1)->index()->comment('状态 1正常 0禁用'),
            new Schema('role')->enum(['user', 'admin', 'moderator'])->default('user')->comment('角色'),
            new Schema('metadata')->json()->comment('扩展元数据'),
            new Schema('created_at')->datetime()->default('CURRENT_TIMESTAMP')->comment('创建时间'),
            new Schema('updated_at')->timestamp()->nullable()->comment('更新时间'),
            new Schema('deleted_at')->timestamp()->nullable()->comment('删除时间'),
        ];
    }
}

// 建表
(new UsersTable())->create();
```

生成的 SQL 等价于：

```sql
CREATE TABLE IF NOT EXISTS `prefix_users` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '用户名',
  `email` VARCHAR(200) NOT NULL COMMENT '邮箱',
  `password` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `avatar` VARCHAR(500) DEFAULT '' COMMENT '头像URL',
  `status` TINYINT(4) DEFAULT 1 COMMENT '状态 1正常 0禁用',
  `role` ENUM('user','admin','moderator') DEFAULT 'user' COMMENT '角色',
  `metadata` JSON COMMENT '扩展元数据',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NULL DEFAULT NULL COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
