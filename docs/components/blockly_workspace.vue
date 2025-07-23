<script setup>
  import { onMounted, onUnmounted } from 'vue'
  import { dispose, inject } from "../blockly/blockly_app.js"
  import initialWorkspace from "../blockly/workspace.json"

  const
    { block, blocks=[], width="100%", height="200px", toolbox=true } = defineProps(
      ['block', 'blocks', 'width', 'height', 'toolbox']
    ),
    injectOptions = {},
    options = {
      injectOptions,
      workspaceJson: block
        ? {
            blocks: {
              languageVersion: 0,
              blocks: [
                {
                  ...block,
                  deletable: false,
                  x: 20,
                  y: 20
                },
                ...blocks.map((otherBlock, idx) => ({
                  ...otherBlock,
                  x: 180,
                  y: idx*30 + 20
                }))
              ]
            }
          }
        : initialWorkspace
    }

  if(!toolbox) {
    injectOptions.toolbox = false
  }

  onMounted(() => {
    inject("blocklyDiv", options)
  })

  // clear workspace
  onUnmounted(() => {
    dispose()
  })
</script>

<template>
  <div id="blocklyDiv" />
</template>

<style>
  div#blocklyDiv {
    width: v-bind(width);
    height: v-bind(height);

    .injectionDiv {
      border-radius: 5px;
    }
  }

  /* category labels need a color style or
     dark mode will bleed into them unfavorably */
  .blocklyTreeLabel {
    color: #000;
  }

  /* fix a style bleed where toolbox scrollbars will
  fail to hide after being shown
  see: https://github.com/google/blockly/issues/5840
  */
  svg[display="none"] {
    display: none;
  }
</style>
