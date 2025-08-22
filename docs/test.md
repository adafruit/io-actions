# Markdown Tester

## Works

<span v-pre>
  {{ span v-pre }}

  ::: warning
  what a warning!
  :::
</span>

```
{{ triple_backticks }}
```

```js
  {{ js_triple_backticks }}
```

::: details Embedded in a panel
::: details multiple panels
::: details multiple panels
::: details multiple panels
a message!


:::

## Doesn't Work

<span v-pre>
`{{ single_backticks }}`
</span>

## Experiment

::: v-pre
| Separator |
|-----------|
| <span v-pre>{{ in_span_table }}</span> |
| {{ in_span_table }} |
:::

