# Adafruit IO: Block-based Actions

> Automation that clicks!

This repository contains the files and tooling for building the Blockly app
that is used to create automations on Adafruit IO.

The files are organized into directories:
- `/app` the source files for the application
- `/src` the tooling for developing and building the application
- `/docs` the tooling and configuration for building the app documentation

## Quick Start

### Setup

Node v22.x is expected, but other versions may work.

```sh
git clone https://github.com/adafruit/io-actions
cd io-actions
npm i
npm start
```

### Exporting

Export a Blockly application:
```sh
npm run export:app
```

Export the documentation site:
```sh
npm run docs:export
```


## Application Files

Our custom Blockly application lives at `/app`

This is where we create new workspaces, toolboxes, and blocks, as well as block
elements like fields, inputs, mixins, validators, generators, etc.

**TODO: info about generating, editing, and testing definition files**


## Docs

Our documentation site is a VitePress install that lives at `/docs`

We run a task to generate the docs site markdown files based on the definition
files from `/app`.

**TODO: info about generating, testing, and deploying the docs site**


## Developer Tooling

All of our custom tooling lives at `/src`

These are the files that translate and bundle our easy definition formats into
full Blockly application bundles.

Some benefits of this tooling include:
- expressive DSL: block definitions look like the blocks they create
- keep related things together ([Locality of Behavior](https://htmx.org/essays/locality-of-behaviour/))
- higher-level idioms for common interactions

**TODO: more info about how the dev tooling is organized and extended**
