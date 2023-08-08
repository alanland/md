<template>
  <div id="app">
    <codemirror-editor />
  </div>
</template>

<script setup>
import CodemirrorEditor from '@/views/CodemirrorEditor.vue'

const formQiniu1 = {
  accessKey: process.env.QINIU_accessKey,
  secretKey: process.env.QINIU_secretKey,
  bucket: process.env.QINIU_bucket,
  domain: process.env.QINIU_domain,
  region: process.env.QINIU_region,
}
const formQiniu = {
  accessKey: `M744EOz-2xH0iiZE6i5F7RgSHVmIkCmtnfrTXgRX`,
  secretKey: `r_So9cankGdJdJKa9yUyyl8eMCxwWoqt7e5FnUK-`,
  bucket: `weixin-mp-ai`,
  domain: `http://rv5kfosh2.bkt.clouddn.com`,
  region: `cn-east-2`,
  path: `weixin-mp-ai/${new Date().toISOString().substring(0, 10)}`,
}
localStorage.setItem(`qiniuConfig`, JSON.stringify(formQiniu))
console.log(formQiniu)
localStorage.setItem(`imgHost`, `qiniu`)
localStorage.setItem(`color`, `rgba(161, 27, 218, 1)`)
</script>

<style lang="less">
// 仿 uniapp 外层全屏
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>

<style lang="less">
/* 每个页面公共css */
@import url('./assets/less/style-mirror.css');
@import url('./assets/less/theme.less');

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #ffffff;
}

::-webkit-scrollbar-track {
  border-radius: 6px;
  background-color: rgba(200, 200, 200, 0.3);
}

::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: rgba(144, 146, 152, 0.5);
}

/* CSS-hints */
.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow-y: auto;
  margin: 0;
  padding: 2px;
  border-radius: 4px;
  max-height: 20em;
  min-width: 200px;
  font-size: 12px;
  font-family: monospace;

  color: #333333;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

.CodeMirror-hint {
  margin-top: 10px;
  padding: 4px 6px;
  border-radius: 2px;
  white-space: pre;
  color: #000000;
  cursor: pointer;

  &:first-of-type {
    margin-top: 0;
  }
  &:hover {
    background: #f0f0f0;
  }
}
</style>
