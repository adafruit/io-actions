/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'advanced_json_path_query',
  bytecodeKey: "jsonPathQuery",
  name: "JSONPath Query",

  colour: 360,
  inputsInline: true,

  description: "Extract specific values from JSON data using JSONPath query syntax. Query JSON feed data to pull out nested values, array elements, or filtered results. The actual parsing happens server-side - this block defines the query that will be executed on your JSON data.",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: `
    JSONPath Query |CENTER
    Data: %DATA
    Path: %PATH
  `,

  fields: {
    PATH: {
      description: `
Enter your JSONPath query string to extract data from JSON.

Examples:
- '$.store.book[0].title' - Get the title of the first book
- '$..author' - Get all author values anywhere in the document
- '$.store.book[?@.price < 10]' - Get books cheaper than 10
- '$.store.book[*].author' - Get all book authors
- '$.store.book[-1]' - Get the last book

Query syntax follows RFC 9535 JSONPath specification. The query will be executed server-side when processing your feed data.
      `,
      text: '$.store.book[0].title'
    }
  },

  inputs: {
    DATA: {
      description: "The JSON data source to query - typically a feed containing JSON data. Connect a feed value or variable that contains valid JSON. The JSONPath query will be applied to this data to extract matching values.",
      check: "expression",
      shadow: "io_text"
    }
  },

  generators: {
    json: (block, generator) => {
      const
        path = block.getFieldValue('PATH'),
        data = generator.valueToCode(block, 'DATA', 0) || null,
        blockPayload = JSON.stringify({
          jsonPathQuery: {
            path: path,
            data: JSON.parse(data)
          },
        })
      return [ blockPayload, 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { path, data } = blockObject.jsonPathQuery,
        inputs = {
          DATA: helpers.expressionToBlock(data, { shadow: "io_text" })
        },
        fields = {
          PATH: path
        }
      return { type: 'advanced_json_path_query', inputs, fields }
    }
  }
}
