# 如意 PHP 框架文档

欢迎来到如意（Ruyi）PHP 框架文档。以下是完整的文档导航：

## 快速开始

- [入门指南](./getting-started.md) — 新手从这里开始，了解框架的整体架构和基本用法

## 框架核心

- [App 应用入口](./framework/app.md) — 应用启动器，管理生命周期、中间件和控制器
- [Lifecycle 应用装配](./framework/lifecycle.md) — 入口中 `$app->onBootUp(Bootup::class)` / `$app->onShutdown(Shutdown::class)` 加载的应用装配类
- [Router 路由](./framework/router.md) — URL 与控制器的映射，支持静态/动态/分组路由
- [Controller 控制器](./framework/controller.md) — 基础控制器，参数校验和数据序列化
- [AuthController 认证控制器](./framework/auth-controller.md) — 带用户认证的控制器
- [Middleware 中间件](./framework/middleware.md) — 请求拦截处理（认证、CORS 等）

## 请求与响应

- [Request 请求](./framework/request.md) — HTTP 请求信息封装
- [Response 响应](./framework/response.md) — HTTP 响应构建和输出
- [Result 返回结果](./framework/result.md) — 标准化方法返回值
- [Config 配置](./framework/config.md) — 多环境配置管理
- [Cache 缓存](./framework/cache.md) — 文件缓存读写

## 校验 Validation

- [Validator 校验器](./framework/validator.md) — 单字段/关联数组/条件规则校验
- [校验规则详解](./framework/validation/rules.md) — 30+ 规则签名、示例与错误码
- [关联数组校验](./framework/validation/array-rules.md) — Rules 字段映射、点号/通配符、条件规则
- [使用场景示例](./framework/validation/examples.md) — 控制器/手动/自定义等完整示例

## 工具类

- [Event 事件](./framework/event.md) — 事件注册和分发
- [Log 日志](./framework/log.md) — 文件日志记录
- [File 文件操作](./framework/file.md) — 文件和目录操作
- [Zip 压缩解压](./framework/zip.md) — 目录打包与安全解压（zip slip / zip bomb 防护）
- [BaseObject 基对象](./framework/base-object.md) — 单例与工厂实例化
- [AbilityBaseObject 能力基对象](./framework/ability-base-object.md) — 实例级错误机制
- [DataObject 数据对象](./framework/data-object.md) — 不可变值对象
- [Output 输出工具](./framework/output.md) — 调试输出、堆栈打印与数据格式化

### 数据处理

- [Str 字符串工具](./framework/str.md) — 字符串处理
- [Numeric 数值工具](./framework/numeric.md) — 数值转换与格式化
- [Money 货币工具](./framework/money.md) — 金额处理
- [Date 时间工具](./framework/date.md) — 高精度时间戳、单位转换与耗时计算
- [Arr 数组工具](./framework/arr.md) — 数组判断、合并、分组与树形分级
- [Transform 数据转换器](./framework/transform.md) — _transform 参数解析与转换器链执行
- [Mutator 数据突变器](./framework/mutator.md) — 数据类型安全转换
- [Serializer 序列化](./framework/serializer.md) — 响应数据过滤和转换

## 依赖管理

- [依赖按需安装](./framework/dependencies.md) — 内核零依赖，云存储 SDK 按需安装

## 控制台

- [Console 控制台与命令执行](./framework/console.md) — CLI 命令注册、参数解析、系统命令执行器

## 数据库

- [DB 门面](./database/db.md) — 数据库操作入口
- [Query Builder](./database/query.md) — 链式查询构建器
- [Model 模型](./database/model.md) — 数据模型 CRUD
- [Table](./database/table.md) — DDL 建表与表管理
- [Schema](./database/schema.md) — 字段定义

## 应用层

- [应用概览](./application/overview.md) — 控制器/模型/服务协作指南
