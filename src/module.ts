import type { NuxtConfigLayer, ResolvedNuxtTemplate } from 'nuxt/schema'
import { basename } from 'node:path'
import { Worker } from 'node:worker_threads'
import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { colorize } from 'consola/utils'

export interface ModuleOptions {

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'layers-prepare',
    configKey: 'layersPrepare',
  },
  defaults: {},
  async setup(_options, nuxt) {
    if (!nuxt.options.dev) {
      return
    }

    const logger = useLogger('layers-prepare')
    const workerPool = new Map<string, { layer: NuxtConfigLayer, worker: Worker }>()

    nuxt.hook('listen', () => {
      for (const layer of nuxt.options._layers.slice(1)) {
        const name = basename(layer.cwd)
        const worker = createWorkerWithNuxt(layer.cwd)

        workerPool.set(name, {
          layer,
          worker,
        })
      }

      logger.info(`Created worker type generator for ${colorize('cyan', workerPool.size)} layers`)

      for (const [name, { worker }] of workerPool) {
        worker.on('message', (data) => {
          const { type, full, error } = JSON.parse(data) || { type: 'unknown' }

          if (type === 'writeTypes') {
            logger.success(`Types generated for ${colorize('cyan', name)}${full ? colorize('dim', ' (full)') : ''}`)
          } else if (type === 'error') {
            logger.error(`Error generating types for ${colorize('cyan', name)}`, error)
          }
        })
      }
    })

    nuxt.hook('app:templatesGenerated', async (_, templates) => {
      if (templates.some((t) => isImportsTemplate(t))) {
        return
      }

      for (const [_, { worker }] of workerPool) {
        worker.postMessage(JSON.stringify({ type: 'writeTypes' }))
      }
    })

    nuxt.hook('builder:watch', async (_, relativePath) => {
      for (const [_, { worker, layer }] of workerPool) {
        if (!relativePath.includes(layer.cwd)) {
          continue
        }

        worker.postMessage(JSON.stringify({
          type: 'writeTypes',
          full: isAutoImportsPath(relativePath),
        }))
      }
    })

    nuxt.hook('close', async () => {
      for (const [name, { worker }] of workerPool) {
        await worker.terminate()
        logger.info(`Terminated worker type generator for ${colorize('cyan', name)}`)
      }
    })
  },
})

function isImportsTemplate(template: ResolvedNuxtTemplate) {
  return [
    '/types/imports.d.ts',
    '/imports.d.ts',
    '/imports.mjs',
  ].some((i) => template.filename.endsWith(i))
}

function isAutoImportsPath(path: string) {
  return [
    '/composables',
    '/components',
    '/utils',
  ].some((i) => path.includes(i))
}

function createWorkerWithNuxt(cwd: string): Worker {
  const code = `
    const { parentPort } = require('worker_threads')

    process.env.CONSOLA_LEVEL = '-1'

    async function main() {
      const { loadNuxt, buildNuxt, writeTypes } = await import('@nuxt/kit')

      let lockWriteTypes = false

      parentPort.on('message', async (message) => {
        const data = JSON.parse(message) || { type: 'unknown' }

        if (data.type === 'writeTypes' && !lockWriteTypes) {
          lockWriteTypes = true

          try {
            const nuxt = await loadNuxt({
              cwd: '${cwd}',
              overrides: {
                _prepare: true,
                logLevel: 'silent',
              }
            })

            if (data.full) {
              await buildNuxt(nuxt)
            }

            await writeTypes(nuxt)
            await nuxt.close()
            parentPort.postMessage(JSON.stringify({ type: 'writeTypes', full: data.full }))
          } catch (e) {
            parentPort.postMessage(JSON.stringify({ type: 'error', error: e.message }))
          } finally {
            lockWriteTypes = false
          }
        }
      })
    }

    main()
  `
  return new Worker(code, {
    eval: true,
  })
}
