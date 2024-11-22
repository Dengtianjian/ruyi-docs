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
      { text: 'PHP', link: '/php/index' },
      { text: '微信小程序', link: '/wechat_miniProgram/token/index.html' }
    ],

    sidebar: {
      '/vue/': [
        {
          text: "介绍",
          link: "/vue/index"
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
