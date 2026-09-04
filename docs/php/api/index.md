# API 参考

本目录是如意框架 **`kernel/`** 的完整 API 参考，按源码目录结构组织。**每个类一个独立页面**，记录其命名空间、文件位置、继承关系、构造方式、公开接口签名与使用示例。

> 提示：入门与使用概念请查阅 [框架核心](../framework/index.md) 等文档；本目录是面向开发者的结构化接口速查。

## 目录结构

`kernel/` 下的核心代码集中在 `kernel/Foundation/`（框架基础层），其余为框架提供、可在应用中扩展的服务、模型、中间件、控制器与平台封装。

```
kernel/
├── Foundation/            → 框架基础层（根层级类 + 命名空间子目录）
│   ├── App.php            → 应用入口
│   ├── Cache.php          → 缓存
│   ├── Common.php         → 全局函数（getApp/config/path/url…）
│   ├── Config.php         → 配置
│   ├── Event.php          → 事件
│   ├── Lifecycle.php      → 生命周期
│   ├── Log.php            → 日志
│   ├── Output.php         → 调试输出
│   ├── Provisioner.php    → 生命周期编排器
│   ├── Result.php         → 返回结果
│   ├── Router.php         → 路由
│   ├── Service.php        → 服务基类
│   ├── URL.php            → 统一 URL 静态门面
│   ├── Console/           → 控制台与命令
│   ├── Controller/        → 控制器体系
│   ├── Data/              → 数据/字符串工具类
│   ├── Database/          → 数据库（PDO/MongoDB/SQLite）
│   ├── Exception/         → 异常体系（Error / ErrorCode / ExceptionHandler）
│   ├── Extension/         → 扩展机制
│   ├── FileSystem/        → 文件系统/路径/压缩/存储
│   ├── HTTP/              → HTTP 请求响应
│   ├── Middleware/        → 中间件
│   ├── Object/            → 对象基类
│   └── Validation/        → 数据校验
├── Service/               → 应用服务类（框架提供）
├── Middleware/            → 全局中间件（框架提供）
├── Model/                 → 数据模型（框架提供）
├── Traits/                → 复用特性（框架提供）
├── Modules/               → 功能模块（框架提供）
├── Controller/            → 命令 / 内置入口控制器
└── Platform/              → 第三方平台（Wechat/Aliyun/QCloud/DiscuzX）
```

## 分篇索引

### Foundation 根层级
- [App 应用入口](./foundation/app.md)
- [Cache 缓存](./foundation/cache.md)
- [Config 配置](./foundation/config.md)
- [Event 事件](./foundation/event.md)
- [Lifecycle 生命周期](./foundation/lifecycle.md)
- [Log 日志](./foundation/log.md)
- [Output 输出](./foundation/output.md)
- [Provisioner 编排器](./foundation/provisioner.md)
- [Result 返回结果](./foundation/result.md)
- [Router 路由](./foundation/router.md)
- [Service 服务基类](./foundation/service.md)
- [URL 统一地址](./foundation/url.md)
- [Common 全局函数](./foundation/common.md)
- [Facade 门面基类](./foundation/facade.md)

### Foundation 命名空间子目录
- [Console 控制台](./foundation/console/console.md)（[Command](./foundation/console/command.md)）
- [Controller 控制器](./foundation/controller/controller.md)（[AuthController](./foundation/controller/auth-controller.md) · [ControllerQuery](./foundation/controller/controller-query.md) · [ControllerBody](./foundation/controller/controller-body.md) · [ControllerResponse](./foundation/controller/controller-response.md)）
- [Data 数据工具](./foundation/data/arr.md)（[Str](./foundation/data/str.md) · [Numeric](./foundation/data/numeric.md) · [Date](./foundation/data/date.md) · [Money](./foundation/data/money.md) · [Mutator](./foundation/data/mutator.md) · [Serializer](./foundation/data/serializer.md) · [Transform](./foundation/data/transform.md)）
- [Error 业务异常](./foundation/exception/error.md)（[ErrorCode](./foundation/exception/error-code.md) · [ExceptionHandler](./foundation/exception/exception-handler.md)）
- [Extension 扩展](./foundation/extension/extensions.md)（[ExtensionMain](./foundation/extension/extension-main.md) · [ExtensionProvisioner](./foundation/extension/extension-provisioner.md)）
- [FileSystem 文件系统](./foundation/filesystem/file-system.md)（[FileHelper](./foundation/filesystem/file-helper.md) · [Path](./foundation/filesystem/path.md) · [Zip](./foundation/filesystem/zip.md) · [Storage](./foundation/filesystem/storage/abstract-storage.md)）
- [HTTP 请求与响应](./foundation/http/request.md)（[Response](./foundation/http/response.md) · [URL](./foundation/http/url.md) · [Curl](./foundation/http/curl.md)）
- [Middleware 中间件](./foundation/middleware/middleware.md)（[MiddlewareBase](./foundation/middleware/middleware-base.md)）
- [Object 对象基类](./foundation/object/base-object.md)（[AbilityBaseObject](./foundation/object/ability-base-object.md) · [DataObject](./foundation/object/data-object.md)）
- [Validation 校验](./foundation/validation/validator.md)（[Rules](./foundation/validation/rules.md) · [Rule](./foundation/validation/rule.md) · [RuleBuilder](./foundation/validation/rule-builder.md) · [RuleInterface](./foundation/validation/rule-interface.md)）
- [Crontab 定时任务](./foundation/crontab/cron.md)（[Cron 基类](./foundation/crontab/cron.md) · [Crons 管理器](./foundation/crontab/crons.md)）

### Database 数据库
- [PDO](./foundation/database/pdo/db.md)（[Query](./foundation/database/pdo/query.md) · [Model](./foundation/database/pdo/model.md) · [Schema](./foundation/database/pdo/schema.md) · [Table](./foundation/database/pdo/table.md) · [Connections](./foundation/database/pdo/connections.md) · [Driver](./foundation/database/pdo/driver.md) · [Statement](./foundation/database/pdo/statement.md) · [Paginator](./foundation/database/pdo/paginator.md) · [Relation](./foundation/database/pdo/relation/relation.md)）
- [MongoDB](./foundation/database/mongodb/mongo.md)（[Driver](./foundation/database/mongodb/driver.md) · [Collection](./foundation/database/mongodb/collection.md)）
- [SQLite](./foundation/database/sqlite/sqlite.md)（[SQLiteModel](./foundation/database/sqlite/sqlite-model.md)）

### 框架提供的应用类
- [Service 服务类](./service/language-service.md)（[RedisService](./service/redis-service.md) · [StorageService](./service/storage-service.md)）
- [全局中间件](./middleware/global-auth-middleware.md)（[GlobalCorsMiddleware](./middleware/global-cors-middleware.md) · [GlobalWechatOfficialAccountMiddleware](./middleware/global-wechat-official-account-middleware.md)）
- [Model 模型](./model/files-model.md)（[AccessTokenModel](./model/access-token-model.md) · [LoginsModel](./model/logins-model.md) · [AttachmentsModel](./model/attachments-model.md) · [ExtensionsModel](./model/extensions-model.md) · [OrderModel](./model/order-model.md) · [SettingsModel](./model/settings-model.md) · [WechatUsersModel](./model/wechat-users-model.md)）
- [Traits 特性](./traits/model/files-model-trait.md)
- [Modules 模块](./modules/setting-module/setting-module-base.md)（[SettingService](./modules/setting-module/setting-service.md) · [SettingsModel](./modules/setting-module/settings-model.md)）

### Controller 命令与内置入口
- [命令控制器](./controller/commands/make-command.md)（[make:app](./controller/commands/make-app-command.md) · [make:model](./controller/commands/make-model-command.md) · [make:controller](./controller/commands/make-controller-command.md) · [make:middleware](./controller/commands/make-middleware-command.md) · [schedule:run](./controller/commands/schedule-run-command.md)）
- [Main 内置入口](./controller/main/index-controller.md)（[文件控制器](./controller/main/files/file-base-controller.md) · [扩展控制器](./controller/main/extensions/extension-list-view-controller.md)）

### 具体门面（kernel/Facades）
- [Crons 定时任务门面](./facades/crons.md)

### Platform 第三方平台
- [Wechat 微信](./platform/wechat/wechat.md)（[AccessToken](./platform/wechat/access-token.md) · [小程序](./platform/wechat/miniprogram/wechat-mini-program.md) · [公众号](./platform/wechat/official-account/wechat-official-account.md) · [微信支付](./platform/wechat/wechat-pay/wechat-pay.md)）
- [Aliyun 阿里云](./platform/aliyun/aliyun.md)（[AliyunRequest](./platform/aliyun/aliyun-request.md) · [AliyunSignature](./platform/aliyun/aliyun-signature.md) · [AliyunOSS](./platform/aliyun/aliyun-oss/aliyun-oss-storage.md)）
- [QCloud 腾讯云](./platform/qcloud/qcloud.md)（[QCloudFaceId](./platform/qcloud/qcloud-face-id.md) · [QCloudSTS](./platform/qcloud/qcloud-sts.md) · [QCloudCOS](./platform/qcloud/qcloud-cos/qcloud-cos-storage.md)）
- [DiscuzX](./platform/discuzx/discuzx-forum.md)（[Foundation 基类](./platform/discuzx/foundation/discuzx-app.md) · [Model](./platform/discuzx/model/discuzx-files-model.md) · [Member](./platform/discuzx/member/discuzx-member.md) · [Middleware](./platform/discuzx/middleware/global-discuzx-auth-middleware.md) · [Controller](./platform/discuzx/controller/attachment/upload-attachment-controller.md)）

## 通用约定

- **命名空间**：根层级类为 `kernel\Foundation`；子目录类为 `kernel\Foundation\{子目录}\...`；`kernel\` 下其他目录（`Service`/`Model`/`Platform` 等）对应各自命名空间
- **camelCase**：框架方法/参数统一小写驼峰命名
- **自动装配**：`App` 延迟实例化组件，由 `Setup/Bootstrap.php` 通过 `$app->set([...])` 注入；也可用 `getApp()` 在业务代码中获取当前实例
- **返回结果**：Service/Controller 等方法多以 `Result` 作为统一返回，判断 `->isSuccess()`/`->isError()` 后处理
- **单例**：多数 Model/Service 通过 `BaseObject::singleton()` 获取，具体见对应页面
