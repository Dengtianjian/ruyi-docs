# 应用层概览

本指南介绍如意框架中如何将控制器、模型、服务组合起来构建一个完整的业务功能。

## 应用目录结构

每个应用是一个独立的目录，目录名 = `new App("AppId")` 传入的 AppId。应用命名空间的根命名空间与 AppId 一致：

```
myapp/                     # AppId = "myapp"，命名空间 = myapp\
├── index.php              # 入口文件  →  new App("myapp")
├── Configs/               # 配置文件
├── Routes/                # 路由定义
│   └── index.php
├── Controller/            # 控制器（命名空间: myapp\Controller\）
├── Model/                 # 数据模型（命名空间: myapp\Model\）
├── Middleware/            # 中间件（命名空间: myapp\Middleware\）
├── Service/               # 业务服务（命名空间: myapp\Service\）
├── Events/                # 事件定义
└── Storage/               # 文件存储
```

多个应用可以共存于同一项目，共用 `kernel/`：

```
项目根目录/
├── kernel/                # 框架内核
├── app-api/               # API 应用
├── app-admin/             # 管理后台应用
└── app-cron/              # 定时任务应用
```

## 应用架构

```
Routes/index.php          ← 定义路由映射
       │
       ▼
Controller/               ← 控制器：处理 HTTP 请求/响应
       │
       ├──▶ Service/      ← 服务层：封装业务逻辑
       │       │
       │       └──▶ Model/    ← 数据模型：数据库 CRUD
       │
       └──▶ Model/        ← 控制器也可直接操作模型
```

## 控制器清单

以下是应用程序中的所有控制器及其功能：

### 系统相关

| 控制器 | 文件路径 | 路由 | 说明 |
|--------|----------|------|------|
| IndexController | `Controller/IndexController.php` | `GET /` | 首页/健康检查 |
| GetSystemVersionController | `Controller/System/Iuu/GetSystemVersionController.php` | `GET system/version` | 获取系统版本 |
| SystemInstallController | `Controller/System/Iuu/SystemInstallController.php` | `POST system/install` | 系统安装 |
| SystemUpgradeController | `Controller/System/Iuu/SystemUpgradeController.php` | `POST system/upgrade` | 系统升级 |

### 用户相关

| 控制器 | 文件路径 | 路由 | 说明 |
|--------|----------|------|------|
| RegisterController | `Controller/Users/Signin/RegisterController.php` | `POST users/register` | 用户注册 |
| LoginController | `Controller/Users/Signin/LoginController.php` | `POST users/login` | 用户登录 |
| LogoutController | `Controller/Users/Signin/LogoutController.php` | `POST users/logout` | 用户登出 |
| UpdateUserController | `Controller/Users/UpdateUserController.php` | `PATCH users/{userId}` | 更新用户信息 |

### 链接相关

| 控制器 | 文件路径 | 路由 | 说明 |
|--------|----------|------|------|
| ListLinksController | `Controller/Links/ListLinksController.php` | `GET links` | 链接列表（支持分组管道） |
| GetLinkController | `Controller/Links/Link/GetLinkController.php` | `GET links/{?linkId}` | 获取单个链接 |
| PostLinkController | `Controller/Links/Link/PostLinkController.php` | `POST links/{?linkId}` | 创建链接 |
| PutLinkController | `Controller/Links/Link/PutLinkController.php` | `PUT links/{?linkId}` | 更新链接 |
| PatchLinkController | `Controller/Links/Link/PatchLinkController.php` | `PATCH links/{?linkId}` | 删除链接 |
| ListCategoryController | `Controller/Links/ListCategoryController.php` | `GET link/categories` | 分类列表 |
| ResourceCategoriesController | `Controller/Links/ResourceCategoriesController.php` | `link/categories/{?categoryId}` | 分类 CRUD |

### 通知相关

| 控制器 | 文件路径 | 路由 | 说明 |
|--------|----------|------|------|
| ListNoticeController | `Controller/Notice/ListNoticeController.php` | `GET notifications` | 通知列表 |
| ResourceNoticeController | `Controller/Notice/ResourceNoticeController.php` | `notifications/{?noticeId}` | 通知 CRUD |
| SendNoticeController | `Controller/Notice/SendNoticeController.php` | `POST notifications/send` | 发送通知（带钉钉中间件） |
| ResetNoticeController | `Controller/Notice/ResetNoticeController.php` | `POST/PATCH notifications/reset` | 重置通知 |
| NoticeStatusController | `Controller/Notice/NoticeStatusController.php` | `PATCH notifications/{noticeId}/status` | 更新通知状态 |

### 文章相关

| 控制器 | 文件路径 | 说明 |
|--------|----------|------|
| PublishPostController | `Controller/Post/PublishPostController.php` | 发布文章 |
| UpdatePostController | `Controller/Post/UpdatePostController.php` | 更新文章 |

### 微信相关

| 控制器 | 文件路径 | 说明 |
|--------|----------|------|
| WechatMPLoginController | `Controller/Wechat/WechatMPLoginController.php` | 微信公众号登录 |
| WechatServerController | `Controller/Wechat/WechatServerController.php` | 微信服务端 |

## 模型清单

### UsersModel

**文件**: `Model/UsersModel.php`

| 方法 | 说明 |
|------|------|
| `usernameExist($username)` | 检查用户名是否已存在 |

继承自 Model 基类，拥有所有通用 CRUD 方法。

### LinksModel

**文件**: `Model/Links/LinksModel.php`

链接数据模型，对应 `links` 表。

### LinkCategoriesModel

**文件**: `Model/Links/LinkCategoriesModel.php`

链接分类模型。

### NotificationsModel

**文件**: `Model/NotificationsModel.php`

通知数据模型。

### PostsModel / PostTagsModel

**文件**: `Model/Post/PostsModel.php`, `Model/Post/PostTagsModel.php`

文章和标签模型。

### DingTalkAccessTokensModel

**文件**: `Model/DingTalkAccessTokensModel.php`

钉钉访问令牌模型。

### WechatAccessTokenModel

**文件**: `Model/WechatAccessTokenModel.php`

微信访问令牌模型。

## 服务清单

### NoticeService

**文件**: `Service/NoticeService.php`

通知发送服务，封装了钉钉和微信的推送逻辑。

### DingTalkService / DingTalkRobotService

**文件**: `Service/DingTalkService.php`, `Service/DingTalkRobotService.php`

钉钉消息推送服务。

### WechatMPService

**文件**: `Service/WechatMPService.php`

微信公众号服务。

### UserBasicService / UserSigninService

**文件**: `Service/User/UserBasicService.php`, `Service/User/UserSigninService.php`

用户基础服务和登录服务。

## 中间件清单

| 中间件 | 文件位置 | 说明 |
|--------|----------|------|
| GlobalAuthMiddleware | `Middleware/GlobalAuthMiddleware.php` | 应用级认证中间件 |
| GlobalDingTalkMiddleware | `Middleware/GlobalDingTalkMiddleware.php` | 钉钉消息中间件 |
| GlobalWechatAccessTokenMiddleware | `Middleware/GlobalWechatAccessTokenMiddleware.php` | 微信 Token 中间件 |

## 完整开发流程示例

以"创建链接"功能为例，展示各层如何协作：

### 1. 定义路由

```php
// Routes/index.php
Router::same("links/{?linkId:\\w+}", function () {
    Router::post(PostLinkController::class);
});
```

### 2. 创建控制器

```php
<?php
// Controller/Links/Link/PostLinkController.php
namespace myapp\Controller\Links\Link;

use myapp\Model\Links\LinksModel;
use kernel\Foundation\Controller\AuthController;

class PostLinkController extends AuthController
{
    // 需要登录
    public $Auth = true;
    
    // 请求体类型转换
    public $body = [
        "name" => "string",
        "url" => "string",
        "description" => "string",
        "categoryId" => "int",
        "private" => "int",
        "sort" => "int"
    ];

    public function data()
    {
        $linkData = $this->requestBody->all();
        
        $model = new LinksModel();
        $model->insert($linkData);
        
        return $this->response->success($linkData, 201, 201, "创建成功");
    }
}
```

### 3. 定义模型

```php
<?php
// Model/Links/LinksModel.php
namespace myapp\Model\Links;

use kernel\Foundation\Database\PDO\Model;

class LinksModel extends Model
{
    // 模型继承框架的 Model 基类
    // 自带 insert、update、delete、getOne、getAll、page、count 等方法
    // 无需额外代码即可完成 CRUD 操作
}
```

### 4. 请求流程

```
POST /links
Body: {"name": "GitHub", "url": "https://github.com", "categoryId": 1}
     │
     ▼
GlobalAuthMiddleware  ← 验证 Token，存储用户信息到 Store
     │
     ▼
Controller::before()  ← 校验/转换请求体参数
     │
     ▼
Controller::data()    ← 执行插入操作
     │
     ▼
Controller::after()   ← 序列化响应数据
     │
     ▼
JSON Response: {"statusCode": 201, "code": 201, "message": "创建成功", ...}
```

## 常用组合模式

### 模式 1：直接模型操作（简单 CRUD）

```php
class SimpleController extends AuthController
{
    public $Auth = true;

    public function data()
    {
        $model = new SomeModel();
        $data = $model->getAll();
        return $data;
    }
}
```

### 模式 2：服务层封装（复杂业务逻辑）

```php
class ComplexController extends AuthController
{
    public $Auth = true;

    public function data()
    {
        $service = new SomeService();
        $result = $service->execute($this->requestBody->all());
        
        if ($result->error) {
            return $result;  // ReturnResult 继承自 Response
        }
        
        return $result->result();
    }
}
```

### 模式 3：数据转换（Transform）

```php
class ListController extends AuthController
{
    public $allowedTransformers = ["withGroup", "withStats"];

    public function data()
    {
        return (new SomeModel())->getAll();
    }

    // 纯函数：Data In, Data Out
    function withGroup($data, $field = null)
    {
        $key = $field ?? 'categoryId';
        $groups = [];
        foreach ($data as $item) {
            $groups[$item[$key]][] = $item;
        }
        return $groups;
    }

    function withStats($data) { /* 返回统计后的数据 */ }
}
```

客户端通过 `_transform` 参数动态调用转换器：

```bash
GET /api/list?_transform=withGroup:categoryId
```
