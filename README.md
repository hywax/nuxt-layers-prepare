# Nuxt Layers Prepare

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

This module solves the problem with creating meta data for layers. It automatically scans all changes and creates a `.nuxt` folder in the layer if there were changes there.

**This is a temporary solution until nuxt developers add this to the kernel! As soon as it appears in the kernel this package will be deprecated!**

Linked issues:
- [nuxt#24048](https://github.com/nuxt/nuxt/issues/24048)

## Installation

```bash
# Using pnpm
pnpm add nuxt-layers-prepare -D

# Using yarn
yarn add nuxt-layers-prepare -D

# Using npm
npm install nuxt-layers-prepare -D
```

## Usage

Add `nuxt-layers-prepare` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['nuxt-layers-prepare']
})
```

## Contributing

A huge thank you to everyone who is helping to improve nuxt-layers-prepare. Thanks to you, the project can evolve!

Here are some ways you can contribute:

- [Open an issue](https://github.com/hywax/nuxt-layers-prepare/issues/new/choose) to report a bug.
- [Create a pull request](https://github.com/hywax/nuxt-layers-prepare/compare) to add a new feature or fix a bug.

<a href="https://github.com/hywax/nuxt-layers-prepare/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hywax/nuxt-layers-prepare" alt="nuxt-layers-prepare Contributors" />
</a>

## License

This app is open-sourced software licensed under the [MIT license](https://github.com/hywax/nuxt-layers-prepare/blob/main/LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-layers-prepare/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-layers-prepare
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-layers-prepare.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-layers-prepare
[license-src]: https://img.shields.io/npm/l/nuxt-layers-prepare.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-layers-prepare
