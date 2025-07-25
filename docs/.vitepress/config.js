import { defineConfig } from 'vitepress'
import blocksSidebar from '../blocks/_blocks_sidebar.json'


const REPO = 'https://github.com/adafruit/io-actions'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "IO Actions: Block Reference",
  description: "Documentation for Adafruit IO's block-based Actions",

  head: [
    ['link', { rel: 'icon', href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧩</text></svg>" }]
  ],

  base: "/io-actions/",

  lastUpdated: true,

  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    search: {
      provider: 'local'
    },

    editLink: {
      text: "Suggest an edit to this page",
      // runs on the frontend, must be a pure function!
      pattern: ({ filePath, frontmatter }) => {
        // special handling for block pages
        if(filePath.match(/^blocks\//)) {
          // block pages have their source paths in their frontmatter
          return `https://github.com/adafruit/io-actions/edit/main/app/blocks/${frontmatter.definitionPath}`
        }

        return `https://github.com/adafruit/io-actions/edit/main/docs/${filePath}`
      }
    },

    nav: [
      { text: '🧩', link: '/sandbox' },
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Block List', link: '/blocks/index' },
      { text: 'Contributing', link: '/contributing' },
      // { text: 'Examples', link: '/automation-examples' }
    ],

    sidebar: {
      // block index and pages
      "/blocks/": [ blocksSidebar ],

      // devtools for the sandbox
      "/sandbox": [
        {
          "text": "Tools",
          "items": [
            {
              "text": "Custom Feed Names",
              "link": "#"
            },
            {
              "text": "Weather Locations",
              "link": "#"
            },
            {
              "text": "Air Quality Locations",
              "link": "#"
            },
            {
              "text": "IO Bytecode Explorer",
              "link": "#"
            },
            {
              "text": "Blockly JSON Explorer",
              "link": "#"
            },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: REPO }
    ]
  }
})
