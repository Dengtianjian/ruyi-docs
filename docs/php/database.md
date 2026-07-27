---
title: 数据库
---

# 数据库操作

如意框架的数据库层位于 `kernel/Foundation/Database/`，提供 PDO（MySQL）、MongoDB 和 SQLite 三种数据库支持。

## 架构概览

PDO 模块是核心 ORM 体系，由 9 个类组成，分为四个层次：

```
┌──────────────────────────────────────────────────────────┐
│  应用层                                                   │
│  ┌─────────┐  ┌──────────────────────────────────┐       │
│  │   DB    │  │           Model (AR+代理)         │       │
│  │ (门面)  │  │  find/save/delete + 类型转换      │       │
│  └────┬────┘  │  ┌────────────────────────────┐   │       │
│       │       │  │  Relation 关联查询          │   │       │
│       │       │  │  hasOne/hasMany/belongsTo   │   │       │
│       │       │  └────────────────────────────┘   │       │
│       │       └──────────────┬─────────────────────┘       │
├───────┼──────────────────────┼─────────────────────────────┤
│  查询层                       │                             │
│  ┌────┴──────────────────────┴────┐    ┌─────────┐         │
│  │           Query                │    │ Statement│         │
│  │  where/select/order/join/...  │    │ SQL生成  │         │
│  └───────────────┬───────────────┘    └─────────┘         │
│                  │                                         │
├──────────────────┼─────────────────────────────────────────┤
│  表操作层         │                                         │
│  ┌───────────────┴──────┐      ┌──────────────┐           │
│  │        Table         │      │    Schema    │           │
│  │  create/drop/rename  │      │  字段定义    │           │
│  │  getColumns/exists   │      │  类型/约束   │           │
│  └──────────────────────┘      └──────────────┘           │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  连接层                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐          │
│  │ Connections  │  │   Driver     │  │Paginator│          │
│  │ 多库切换管理 │  │  PDO封装     │  │ 分页     │          │
│  └──────────────┘  └──────────────┘  └────────┘          │
└──────────────────────────────────────────────────────────┘
```

## 两种使用模式

### 模式一：Query Builder（直接查询）

通过 `DB` 门面或 `Query` 类构建 SQL，适合复杂查询、报表统计等场景。

```php
use kernel\Foundation\Database\PDO\DB;

// Query Builder 链式调用
$users = DB::table('users')
  ->where('status', 1)
  ->orderBy('id', 'DESC')
  ->limit(10)
  ->get();

// 原生 SQL + 参数绑定
$user = DB::selectOne('SELECT * FROM users WHERE id = ?', [1]);
```

### 模式二：Model（ActiveRecord）

继承 `Model`，自动获得类型转换、时间戳维护、软删除等能力，适合业务实体操作。

```php
use kernel\Foundation\Database\PDO\Model;

class UserModel extends Model
{
  protected $casts = [
    'id'         => 'int',
    'status'     => 'int',
    'created_at' => 'timestamp',
    'updated_at' => 'timestamp_ms',
    'deleted_at' => 'timestamp',
  ];
}

// Active Record
$user = UserModel::find(1);
$user->name = 'New Name';
$user->save();

// Query 代理（链式查询自动转发）
$users = UserModel::where('status', 1)->orderBy('id', 'DESC')->get();
```

### 选择建议

| 场景 | 推荐方式 |
|------|---------|
| 简单 CRUD、类型自动转换 | Model |
| 复杂 JOIN、子查询、聚合统计 | Query Builder |
| 建表、改表、表信息查询 | Table + Schema |
| 事务、查询日志 | DB 门面 |

## 快速导航

### 入门
- [使用指南](./database/usage) — 连接配置、多数据库、CRUD、事务、日志、最佳实践

### 核心 API
- [DB 门面](./database/db) — 数据库操作入口，原生 SQL + Query Builder
- [Query Builder](./database/query) — 链式查询构建器，支持 JOIN/子查询
- [Model 模型](./database/model) — ActiveRecord ORM，类型转换、软删除
- [Relation 关联查询](./database/relation) — hasOne / hasMany / belongsTo 关联

### 底层组件
- [Driver 驱动](./database/driver) — PDO 底层封装，连接与执行
- [Connections 连接管理器](./database/connections) — 多库切换管理
- [Statement SQL 生成器](./database/statement) — 底层 SQL 片段生成

### 表结构与辅助
- [Table](./database/table) — DDL 建表、表信息查询、复制/重命名
- [Schema](./database/schema) — 字段定义，类型、约束、索引
- [Paginator 分页器](./database/paginator) — 分页结果封装

### 其他数据库
- [MongoDB](./database/mongodb) — MongoDB 驱动、门面与集合基类
- [SQLite](./database/sqlite) — SQLite 连接与模型
