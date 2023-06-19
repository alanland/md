import Vue from 'vue'
import Vuex from 'vuex'
import config from '../assets/scripts/config'
import WxRenderer from '../assets/scripts/renderers/wx-renderer'
import { marked } from 'marked'

import markedAdmonition from 'marked-admonition-extension'
marked.use(markedAdmonition)
import 'marked-admonition-extension/dist/index.css'

import CodeMirror from 'codemirror/lib/codemirror'
import DEFAULT_CONTENT from '@/assets/example/markdown.md'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt'
import { setColor, formatDoc, formatCss } from '@/assets/scripts/util'

Vue.use(Vuex)

const state = {
  wxRenderer: null,
  output: ``,
  html: ``,
  editor: null,
  cssEditor: null,
  currentFont: ``,
  currentSize: ``,
  currentColor: ``,
  citeStatus: false,
  nightMode: false,
  codeTheme: config.codeThemeOption[2].value,
  isMacCodeBlock: true,
}
const mutations = {
  setEditorValue(state, data) {
    state.editor.setValue(data)
  },
  setCssEditorValue(state, data) {
    state.cssEditor.setValue(data)
  },
  setWxRendererOptions(state, data) {
    state.wxRenderer.setOptions(data)
  },
  setCiteStatus(state, data) {
    state.citeStatus = data
    localStorage.setItem(`citeStatus`, data)
  },
  setCurrentFont(state, data) {
    state.currentFont = data
    localStorage.setItem(`fonts`, data)
  },
  setCurrentSize(state, data) {
    state.currentSize = data
    localStorage.setItem(`size`, data)
  },
  setCurrentColor(state, data) {
    state.currentColor = data
    localStorage.setItem(`color`, data)
  },
  setCurrentCodeTheme(state, data) {
    state.codeTheme = data
    localStorage.setItem(`codeTheme`, data)
  },
  setIsMacCodeBlock(state, data) {
    state.isMacCodeBlock = data
    localStorage.setItem(`isMacCodeBlock`, data)
  },
  themeChanged(state) {
    state.nightMode = !state.nightMode
    localStorage.setItem(`nightMode`, state.nightMode)
  },
  initEditorState(state) {
    state.currentFont =
      localStorage.getItem(`fonts`) || config.builtinFonts[0].value
    state.currentColor =
      localStorage.getItem(`color`) || config.colorOption[0].value
    state.currentSize =
      localStorage.getItem(`size`) || config.sizeOption[2].value
    state.codeTheme =
      localStorage.getItem(`codeTheme`) || config.codeThemeOption[2].value
    state.citeStatus = localStorage.getItem(`citeStatus`) === `true`
    state.nightMode = localStorage.getItem(`nightMode`) === `true`
    state.isMacCodeBlock = !(localStorage.getItem(`isMacCodeBlock`) === `false`)
    state.wxRenderer = new WxRenderer({
      theme: setColor(state.currentColor),
      fonts: state.currentFont,
      size: state.currentSize,
    })
  },
  initEditorEntity(state) {
    const editorDom = document.getElementById(`editor`)

    if (!editorDom.value) {
      editorDom.value =
        localStorage.getItem(`__editor_content`) || formatDoc(DEFAULT_CONTENT)
    }
    state.editor = CodeMirror.fromTextArea(editorDom, {
      mode: `text/x-markdown`,
      theme: `xq-light`,
      lineNumbers: false,
      lineWrapping: true,
      styleActiveLine: true,
      autoCloseBrackets: true,
      extraKeys: {
        'Ctrl-F': function autoFormat(editor) {
          const doc = formatDoc(editor.getValue(0))
          localStorage.setItem(`__editor_content`, doc)
          editor.setValue(doc)
        },
        'Ctrl-S': function save(editor) {},
        'Ctrl-B': function bold(editor) {
          const selected = editor.getSelection()
          editor.replaceSelection(`**${selected}**`)
        },
        'Ctrl-D': function del(editor) {
          const selected = editor.getSelection()
          editor.replaceSelection(`~~${selected}~~`)
        },
        'Ctrl-I': function italic(editor) {
          const selected = editor.getSelection()
          editor.replaceSelection(`*${selected}*`)
        },
      },
    })
  },
  initCssEditorEntity(state) {
    const cssEditorDom = document.getElementById(`cssEditor`)

    if (!cssEditorDom.value) {
      cssEditorDom.value =
        localStorage.getItem(`__css_content`) || DEFAULT_CSS_CONTENT
    }
    state.cssEditor = CodeMirror.fromTextArea(cssEditorDom, {
      mode: `css`,
      theme: `style-mirror`,
      lineNumbers: false,
      lineWrapping: true,
      matchBrackets: true,
      autofocus: true,
      extraKeys: {
        'Ctrl-F': function autoFormat(editor) {
          const doc = formatCss(editor.getValue(0))
          localStorage.setItem(`__css_content`, doc)
          editor.setValue(doc)
        },
        'Ctrl-S': function save(editor) {},
      },
    })
  },
  editorRefresh(state) {
    const renderer = state.wxRenderer.getRenderer(state.citeStatus)
    marked.setOptions({ renderer })

    let output = marked.parse(state.editor.getValue(0))

    output += `
    <style>
    .admonition {
  background-color: var(--bg-color);
  border-radius: 0.5rem;
  box-shadow: 0 0 0.4rem 0 var(--bg);
  color: var(--color);
  display: flow-root;
  font-size: 1rem;
  margin: 1em 0;
  padding: 0 0.6rem;
  page-break-inside: avoid;
}
.admonition-note {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #448aff;
  --bg-title: rgba(68, 138, 255, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-abstract {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #02b1ff;
  --bg-title: rgba(0, 176, 255, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17 9H7V7h10m0 6H7v-2h10m-3 6H7v-2h7M12 3a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m7 0h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-info {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #02b8d5;
  --bg-title: rgba(0, 184, 212, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-tip {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #04bfa5;
  --bg-title: rgba(0, 191, 165, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 0 1-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26m-3.16 6.3c-.28.24-.74.5-1.1.6-1.12.4-2.24-.16-2.9-.82 1.19-.28 1.9-1.16 2.11-2.05.17-.8-.15-1.46-.28-2.23-.12-.74-.1-1.37.17-2.06.19.38.39.76.63 1.06.77 1 1.98 1.44 2.24 2.8.04.14.06.28.06.43.03.82-.33 1.72-.93 2.27z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-success {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #00c852;
  --bg-title: rgba(0, 200, 83, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m9 20.42-6.21-6.21 2.83-2.83L9 14.77l9.88-9.89 2.83 2.83L9 20.42z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-question {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #64dd18;
  --bg-title: rgba(100, 221, 23, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m15.07 11.25-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2 2 2 0 0 0-2 2H8a4 4 0 0 1 4-4 4 4 0 0 1 4 4 3.2 3.2 0 0 1-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10c0-5.53-4.5-10-10-10z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-warning {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #ff9104;
  --bg-title: rgba(255, 145, 0, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2 1 21z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-failure {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #ff5252;
  --bg-title: rgba(255, 82, 82, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6.91 17.09 4 12 9.09 6.91 4 4 6.91 9.09 12 4 17.09 6.91 20 12 14.91 17.09 20 20 17.09 14.91 12 20 6.91z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-danger {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #c2185b;
  --bg-title: rgba(255, 23, 68, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 15H6l7-14v8h5l-7 14v-8z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-bug {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #f60357;
  --bg-title: rgba(245, 0, 87, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 12h-4v-2h4m0 6h-4v-2h4m6-6h-2.81a5.985 5.985 0 0 0-1.82-1.96L17 4.41 15.59 3l-2.17 2.17a6.002 6.002 0 0 0-2.83 0L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-example {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #7c4dff;
  --bg-title: rgba(124, 77, 255, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 13v-2h14v2H7m0 6v-2h14v2H7M7 7V5h14v2H7M3 8V5H2V4h2v4H3m-1 9v-1h3v4H2v-1h2v-.5H3v-1h1V17H2m2.25-7a.75.75 0 0 1 .75.75c0 .2-.08.39-.21.52L3.12 13H5v1H2v-.92L4 11H2v-1h2.25z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-quote {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #9e9e9e;
  --bg-title: hsla(0, 0%, 62%, 0.1);
  --icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 17h3l2-4V7h-6v6h3M6 17h3l2-4V7H5v6h3l-2 4z"/></svg>');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-hint {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #009688;
  --bg-title: rgba(0, 150, 136, 0.2);
  --icon: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cstyle%3E.cls-1,.cls-2%7Bfill:none;stroke:%230832ff;stroke-linecap:round;stroke-linejoin:round;%7D.cls-1%7Bstroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3E%3C/title%3E%3Cpath class="cls-1" d="M24,13.1a8,8,0,1,0-13.6,5.7A5.07,5.07,0,0,1,12,22.4V23h8v-.53a5.23,5.23,0,0,1,1.63-3.69A8,8,0,0,0,24,13.1Z"%3E%3C/path%3E%3Cline class="cls-1" x1="12" x2="20" y1="26" y2="26"%3E%3C/line%3E%3Cline class="cls-1" x1="13" x2="19" y1="27" y2="27"%3E%3C/line%3E%3Cline class="cls-1" x1="16" x2="16" y1="28" y2="27"%3E%3C/line%3E%3Cpolyline class="cls-2" points="16 12.42 15 15.25 17 15.25 16 18.17"%3E%3C/polyline%3E%3C/svg%3E');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-caution {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #ffa726;
  --bg-title: rgba(255, 167, 38, 0.2);
  --icon: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"%3E%3Cg data-name="Layer 58" id="Layer_58"%3E%3Cpath class="cls-1" d="M16 26a2 2 0 1 1 2-2 2 2 0 0 1-2 2Zm0-2ZM16 20a1 1 0 0 1-1-1v-8a1 1 0 0 1 2 0v8a1 1 0 0 1-1 1Z"/%3E%3Cpath class="cls-1" d="M27.78 30H4.22a3.19 3.19 0 0 1-2.77-1.57 3.13 3.13 0 0 1-.06-3.13L13.17 3.67a3.23 3.23 0 0 1 5.66 0L30.61 25.3a3.13 3.13 0 0 1-.06 3.13A3.19 3.19 0 0 1 27.78 30ZM16 4a1.18 1.18 0 0 0-1.07.63L3.15 26.25a1.12 1.12 0 0 0 0 1.16 1.19 1.19 0 0 0 1 .59h23.63a1.19 1.19 0 0 0 1-.59 1.12 1.12 0 0 0 0-1.16L17.07 4.63A1.18 1.18 0 0 0 16 4Z"/%3E%3C/g%3E%3C/svg%3E');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-error {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #d32f2f;
  --bg-title: rgba(211, 47, 47, 0.2);
  --icon: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"%3E%3Cg data-name="Layer 57" id="Layer_57"%3E%3Cpath class="cls-1" d="M16 31a15 15 0 1 1 15-15 15 15 0 0 1-15 15Zm0-28a13 13 0 1 0 13 13A13 13 0 0 0 16 3Z"/%3E%3Cpath class="cls-1" d="M16 24a2 2 0 1 1 2-2 2 2 0 0 1-2 2Zm0-2ZM16 18a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v9a1 1 0 0 1-1 1Z"/%3E%3C/g%3E%3C/svg%3E');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-attention {
  --color: rgba(0, 0, 0, 0.87);
  --bg: #455a64;
  --bg-title: rgba(69, 90, 100, 0.2);
  --icon: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"%3E%3Cg data-name="Warning" id="Warning-3"%3E%3Cpath class="cls-1" d="M16 2a4 4 0 0 0-4 4v11a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z"/%3E%3Ccircle class="cls-1" cx="16" cy="26" r="4"/%3E%3C/g%3E%3C/svg%3E');
  --bg-color: #fff;
  --shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05), 0 0 0 0.05rem rgba(0, 0, 0, 0.1);
}
.admonition-title {
  background-color: var(--bg-title);
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  margin: 0 -0.6rem 0 -0.8rem;
  padding: 0.4rem 0.6rem 0.4rem 1rem;
  position: relative;
}
.admonition-title::before {
  content: "";
  background-color: var(--bg);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: cover;
  height: 2rem;
  -webkit-mask-image: var(--icon);
  width: 2rem;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.6rem;
}
.admonition + p:empty, .admonition + p:empty + p:empty {
  display: none;
}

/*# sourceMappingURL=index.css.map */

    </style>
    `
    // 去除第一行的 margin-top
    output = output.replace(/(style=".*?)"/, `$1;margin-top: 0"`)
    if (state.citeStatus) {
      // 引用脚注
      output += state.wxRenderer.buildFootnotes()
      // 附加的一些 style
      output += state.wxRenderer.buildAddition()
    }

    if (state.isMacCodeBlock) {
      output += `
        <style>
          .hljs.code__pre::before {
            position: initial;
            padding: initial;
            content: '';
            display: block;
            height: 25px;
            background-color: transparent;
            background-image: url("https://doocs.oss-cn-shenzhen.aliyuncs.com/img/123.svg");
            background-position: 14px 10px;
            background-repeat: no-repeat;
            background-size: 40px;
          }

          .hljs.code__pre {
            padding: 0!important;
          }

          .hljs.code__pre code {
            display: -webkit-box;
            padding: 0.5em 1em 1em;
            overflow-x: auto;
            text-indent: 0;
          }
        </style>
      `
    }
    state.output = output
  },
}

export default new Vuex.Store({
  state,
  mutations,
  actions: {},
})
