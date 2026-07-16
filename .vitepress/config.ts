import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "如意技术库文档",
  lang: 'zh-Hans',
  description: "如意技术库文档",
  lastUpdated: true,
  srcDir: "docs",
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/favicon.png'
      }
    ]
  ],
  markdown: {
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    },
    lineNumbers: true,
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Vue', link: '/vue/index' },
      { text: 'PHP', link: '/php/getting-started' },
      { text: '微信小程序', link: '/wechat_miniProgram/token/index.html' }
    ],

    sidebar: {
      '/vue/': [
        {
          text: "介绍",
          link: "/vue/index"
        }
      ],
      '/php/': [
        {
          text: "入门指南",
          link: "/php/getting-started"
        },
        {
          text: "框架核心",
          collapsed: false,
          items: [
            {
              text: "App 应用入口",
              link: "/php/framework/app"
            },
            {
              text: "Router 路由",
              link: "/php/framework/router"
            },
            {
              text: "Controller 控制器",
              link: "/php/framework/controller"
            },
            {
              text: "AuthController 认证控制器",
              link: "/php/framework/auth-controller"
            },
            {
              text: "Middleware 中间件",
              link: "/php/framework/middleware"
            }
          ]
        },
        {
          text: "请求与响应",
          collapsed: false,
          items: [
            {
              text: "Request 请求",
              link: "/php/framework/request"
            },
            {
              text: "Response 响应",
              link: "/php/framework/response"
            },
            {
              text: "Config 配置",
              link: "/php/framework/config"
            },
            {
              text: "Cache 缓存",
              link: "/php/framework/cache"
            }
          ]
        },
        {
          text: "数据与校验",
          collapsed: false,
          items: [
            {
              text: "Validator 校验器",
              link: "/php/framework/validator"
            },
            {
              text: "DataConversion 类型转换",
              link: "/php/framework/data-conversion"
            },
            {
              text: "Serializer 序列化",
              link: "/php/framework/serializer"
            },
            {
              text: "ReturnResult 返回结果",
              link: "/php/framework/return-result"
            }
          ]
        },
        {
          text: "工具类",
          collapsed: false,
          items: [
            {
              text: "Store 全局存储",
              link: "/php/framework/store"
            },
            {
              text: "Event 事件",
              link: "/php/framework/event"
            },
            {
              text: "Log 日志",
              link: "/php/framework/log"
            },
            {
              text: "File 文件操作",
              link: "/php/framework/file"
            },
            {
              text: "BaseObject & DataObject",
              link: "/php/framework/base-object"
            }
          ]
        },
        {
          text: "数据库",
          link: "/php/database",
          collapsed: false,
          items: [
            {
              text: "使用指南",
              link: "/php/database/usage"
            },
            {
              text: "DB 门面",
              link: "/php/database/db"
            },
            {
              text: "Query Builder",
              link: "/php/database/query"
            },
            {
              text: "Model 模型",
              link: "/php/database/model"
            },
            {
              text: "Table",
              link: "/php/database/table"
            },
            {
              text: "Schema",
              link: "/php/database/schema"
            },
            {
              text: "Driver 驱动",
              link: "/php/database/driver"
            },
            {
              text: "Connections 连接管理器",
              link: "/php/database/connections"
            },
            {
              text: "Statement SQL 生成器",
              link: "/php/database/statement"
            },
            {
              text: "Paginator 分页器",
              link: "/php/database/paginator"
            },
            {
              text: "MongoDB",
              link: "/php/database/mongodb"
            },
            {
              text: "SQLite",
              link: "/php/database/sqlite"
            }
          ]
        },
        {
          text: "应用层",
          collapsed: false,
          items: [
            {
              text: "应用概览",
              link: "/php/application/overview"
            }
          ]
        }
      ],
      '/wechat_miniProgram/': [
        {
          text: "开发指南",
          items: [
            {
              text: "设计变量",
              link: "/wechat_miniProgram/token/index"
            },
            {
              text: "图标",
              link: "/wechat_miniProgram/icons/index"
            },
            {
              text: "组件",
              items: [
                {
                  text: "面板",
                  collapsed: false,
                  items: [
                    {
                      text: "面板列表",
                      link: "/wechat_miniProgram/components/panel/panelList"
                    },
                    {
                      text: "普通面板",
                      link: "/wechat_miniProgram/components/panel/panel"
                    },
                    {
                      text: "内嵌面板",
                      link: "/wechat_miniProgram/components/panel/innerPanel"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    }
  }
})
