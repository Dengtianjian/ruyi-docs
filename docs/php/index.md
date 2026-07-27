# 如意 PHP 框架文档

欢迎来到如意（Ruyi）PHP 框架文档。以下是完整的文档导航：

## 快速开始

- [入门指南](./getting-started.md) — 新手从这里开始，了解框架的整体架构和基本用法

## 框架核心

- [App 应用入口](./framework/app.md) — 应用启动器，管理生命周期、中间件和控制器
- [Router 路由](./framework/router.md) — URL 与控制器的映射，支持静态/动态/分组路由
- [Controller 控制器](./framework/controller.md) — 基础控制器，参数校验和数据序列化
- [AuthController 认证控制器](./framework/auth-controller.md) — 带用户认证的控制器
- [Middleware 中间件](./framework/middleware.md) — 请求拦截处理（认证、CORS 等）

## 请求与响应

- [Request 请求](./framework/request.md) — HTTP 请求信息封装
- [Response 响应](./framework/response.md) — HTTP 响应构建和输出
- [Config 配置](./framework/config.md) — 多环境配置管理
- [Cache 缓存](./framework/cache.md) — 文件缓存读写

## 数据与校验

- [Validator 校验器](./framework/validator.md) — 请求参数校验
- [Mutator 数据突变器](./framework/data-conversion.md) — 数据类型安全转换
- [Serializer 序列化](./framework/serializer.md) — 响应数据过滤和转换
- [ReturnResult 返回结果](./framework/return-result.md) — 标准化方法返回值

## 工具类

- [Store 全局存储](./framework/store.md) — 请求级数据共享
- [Event 事件](./framework/event.md) — 事件注册和分发
- [Log 日志](./framework/log.md) — 文件日志记录
- [File 文件操作](./framework/file.md) — 文件和目录操作
- [BaseObject & DataObject](./framework/base-object.md) — 基类和值对象

## 数据库

- [DB 门面](./database/db.md) — 数据库操作入口
- [Query Builder](./database/query.md) — 链式查询构建器
- [Model 模型](./database/model.md) — 数据模型 CRUD
- [Table](./database/table.md) — DDL 建表与表管理
- [Schema](./database/schema.md) — 字段定义

## 应用层

- [应用概览](./application/overview.md) — 控制器/模型/服务协作指南
