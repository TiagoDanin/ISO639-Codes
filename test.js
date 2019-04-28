const iso = require('.')
const assert = require('assert')


assert.equal(iso['Portuguese'].name, 'Portuguese')
assert.equal(iso['Portuguese']['iso639-2'], 'por')
assert.equal(iso['Portuguese']['iso639-1'], 'pt')

console.log('Done!')
