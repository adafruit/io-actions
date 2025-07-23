export default {
  type: 'text_template',
  bytecodeKey: "textTemplate",
  name: "Text Template",
  colour: 180,
  inputsInline: true,
  description: `
    Render a text template.

    ::: v-pre
    Special forms surrounded by {{ curly_braces }}
    will be replaced with their current value during the action run.

    These templates use the Liquid templating language, from Shopify, and many
    helpful functions come built-in. See the
    [Liquid Documentation](https://shopify.github.io/liquid/basics/introduction/)
    to learn more.

    ### Template Variables:

    \`{{ variables.var_name }}\` - get the value of a variable you have defined
    with name 'var_name'

    \`{{ vars.var_name }}\` - shorthand for same as above

    \`{{ variables['var name'] }}\` - get the value of a variable you have
    defined with name 'var name' (allows spaces in variable names

    \`{{ vars['var name'] }}\` - shorthand for same as above

    \`{{ user.name }}\` - your user's name

    \`{{ user.username }}\` - your user's username

    \`{{ feeds['group_key.feed_key'].name }}\` - access a feed with key
    'group_key.feed_key' and get its name

    \`{{ feeds[...].key }}\` - ...get its key

    \`{{ feeds[...].value }}\` - ...get its last value
    :::
  `,

  connections: {
    mode: "value",
    output: [ "expression", "string" ],
  },

  template: "{{ %TEMPLATE",

  inputs: {
    TEMPLATE: { shadow: 'io_text_multiline' }
  },

  generators: {
    json: (block, generator) => {
      const
        template = generator.valueToCode(block, 'TEMPLATE', 0) || null,

        blockPayload = JSON.stringify({
          textTemplate: {
            template: JSON.parse(template)
          },
        })

      return [ blockPayload, 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { template } = blockObject.textTemplate,
        inputs = {
          TEMPLATE: helpers.expressionToBlock(template, { shadow: "io_text" })
        }

      return { type: 'text_template', inputs }
    }
  }
}
