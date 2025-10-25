---
title: "Block: JSONPath Query"
editLink: true
definitionPath: advanced/jsonpath.js
---

# Block: JSONPath Query

Type: `advanced_json_path_query`

![the JSONPath Query block](/block_images/advanced_json_path_query.png "JSONPath Query")

Extract specific values from JSON data using JSONPath query syntax. Query JSON feed data to pull out nested values, array elements, or filtered results. The actual parsing happens server-side - this block defines the query that will be executed on your JSON data.



## Fields

### `Path`

Enter your JSONPath query string to extract data from JSON.

Examples:
- '$.store.book[0].title' - Get the title of the first book
- '$..author' - Get all author values anywhere in the document
- '$.store.book[?@.price < 10]' - Get books cheaper than 10
- '$.store.book[*].author' - Get all book authors
- '$.store.book[-1]' - Get the last book

Query syntax follows RFC 9535 JSONPath specification. The query will be executed server-side when processing your feed data.

Default: "$."

## Inputs

### `Data`

The JSON data source to query - typically a feed containing JSON data. Connect a feed value or variable that contains valid JSON. The JSONPath query will be applied to this data to extract matching values.
