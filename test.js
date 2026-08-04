const assert = require('assert')
const fs = require('fs')
const path = require('path')
const iso = require('.')

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8').replace(/\r\n/g, '\n')

// CommonJS
assert.strictEqual(iso.Portuguese.name, 'Portuguese')
assert.deepStrictEqual(iso.Portuguese.names, ['Portuguese'])
assert.strictEqual(iso.Portuguese['iso639-2'], 'por')
assert.strictEqual(iso.Portuguese['iso639-1'], 'pt')
assert.strictEqual(iso.Balinese['iso639-1'], null)
assert.deepStrictEqual(iso.Chichewa.names, ['Chichewa', 'Chewa', 'Nyanja'])

// The shape of every entry must stay stable, other packages rely on it
const keys = Object.keys(iso)
assert.ok(keys.length > 0, 'no language in index.json')
for (const key of keys) {
  const code = iso[key]
  assert.deepStrictEqual(Object.keys(code), ['name', 'names', 'iso639-2', 'iso639-1'])
  assert.strictEqual(code.name, key)
  assert.ok(Array.isArray(code.names) && code.names.length > 0)
  assert.strictEqual(typeof code['iso639-2'], 'string')
  assert.ok(code['iso639-1'] === null || typeof code['iso639-1'] === 'string')
}

// Self reference goes through the "exports" map, require() must keep working
const isoByName = require('iso639-codes')
assert.deepStrictEqual(isoByName, iso)

// The "exports" map must not hide the subpaths that resolved before it existed
assert.deepStrictEqual(require('iso639-codes/index.json'), iso)
assert.strictEqual(require('iso639-codes/package.json').name, 'iso639-codes')

const main = async () => {
  // ESM must deliver the very same data as CommonJS
  const esm = await import('./index.mjs')
  const isoEsm = esm.default

  assert.deepStrictEqual(Object.keys(isoEsm), keys)
  assert.deepStrictEqual(isoEsm, iso)
  assert.strictEqual(isoEsm.Portuguese['iso639-1'], 'pt')
  assert.strictEqual(isoEsm.Balinese['iso639-1'], null)

  // The generated files must be in sync with index.json
  const { buildEsm } = require('./scripts/build-esm')
  const { buildTypes } = require('./scripts/build-types')

  assert.strictEqual(
    read('index.mjs'),
    buildEsm(iso),
    'index.mjs is outdated, run npm run build:esm'
  )
  assert.strictEqual(
    read('index.d.ts'),
    buildTypes(iso),
    'index.d.ts is outdated, run npm run build:types'
  )

  console.log(`Done! ${keys.length} languages, CommonJS and ESM in sync`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
