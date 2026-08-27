# 如意 PHP 框架

如意（Ruyi）PHP 框架是一个轻量级 PHP 框架，采用 **内核 + 应用** 的分层架构。

| 部分 | 目录 | 说明 |
|------|------|------|
| **内核** | `kernel/` | 框架核心，提供路由、控制器、中间件、ORM 等基础能力 |
| **应用** | `<app-id>/` | 业务应用代码，目录名 = `new App("app-id")` 传入的 AppId |

> **核心理念**：框架代码不干涉应用代码。`kernel/` 只提供通用能力，应用按自己的目录组织路由、控制器、模型、服务等。一个内核可以支撑多个应用。

## 多应用架构

```
项目根目录/
├── kernel/          # 内核（所有应用共享）
├── app1/            # 应用 1  →  new App("app1")
│   └── index.php    #     入口文件
├── app2/            # 应用 2  →  new App("app2")
│   └── index.php    #     入口文件
└── ...
```

## 快速导航

### 开始

- [快速上手](./getting-started) — 新手指南，从安装到第一个应用

### 基础

框架核心能力，涵盖应用入口、路由、控制器、中间件、请求响应、校验、缓存、事件日志、工具类、文件系统、控制台等。

- [App 应用入口](./framework/app) — 应用启动与生命周期
- [Router 路由](./framework/router) — URL 与控制器映射
- [Controller 控制器](./framework/controller) — 业务逻辑处理
- [Middleware 中间件](./framework/middleware) — 请求拦截处理
- [Request 请求](./framework/request) — HTTP 请求封装
- [Response 响应](./framework/response) — HTTP 响应构建
- [Config 配置](./framework/config) — 多环境配置管理
- [Result 返回结果](./framework/result) — 标准化返回值
- [Cache 缓存](./framework/cache) — 文件缓存
- [Validator 校验器](./framework/validator) — 数据校验
- [Event 事件](./framework/event) — 事件注册与分发
- [Log 日志](./framework/log) — 文件日志
- [Console 控制台](./framework/console) — CLI 命令
- [应用概览](./application/overview) — 控制器/模型/服务协作

### 数据库

PDO（MySQL）、MongoDB、SQLite 三种数据库支持。

- [使用指南](./database/usage) — 连接配置、CRUD、事务
- [DB 门面](./database/db) — 数据库操作入口
- [Query Builder](./database/query) — 链式查询构建器
- [Model 模型](./database/model) — ActiveRecord ORM
- [Relation 关联查询](./database/relation) — hasOne / hasMany / belongsTo
- [Table](./database/table) — DDL 建表
- [Schema](./database/schema) — 字段定义
- [MongoDB](./database/mongodb) — MongoDB 驱动
- [SQLite](./database/sqlite) — SQLite 支持
