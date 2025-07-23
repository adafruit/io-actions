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
      // runs on the frontend, must be a pure function!
      pattern: ({ filePath }) => {
        // special handling for block pages
        if(filePath.match(/^blocks\//)) {
          // docs come from the js, md is not the true source
          const jsPath = filePath.replace(/.md$/, '.js')
          // and we want to link to the main branch, not docs
          return `https://github.com/adafruit/io-actions/edit/main/app/${jsPath}`
        }

        return `https://github.com/adafruit/io-actions/edit/main/docs/${filePath}`
      }
    },

    nav: [
      { text: '🧩', link: '/sandbox' },
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Block List', link: '/block-index' },
      // { text: 'Examples', link: '/automation-examples' }
    ],

    sidebar: {
      // covers /blocks/* and /block-index
      "/block": [ blocksSidebar ],

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
