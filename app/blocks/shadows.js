export const
  singleLineTemplate = {
    type: 'text_template',
    inputs: { TEMPLATE: {
      shadow: {
        type: 'io_text',
        fields: {
          TEXT: ''
        }
      }
    }}
  },
  multilineLineTemplate = {
    type: 'text_template',
    inputs: { TEMPLATE: {
      shadow: {
        type: 'io_text_multiline',
        fields: {
          TEXT: ""
        }
      }
    }}
  }
