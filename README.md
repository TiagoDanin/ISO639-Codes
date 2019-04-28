# ISO639 Codes

[![Node](https://img.shields.io/node/v/iso639-codes.svg?style=flat-square)](https://npmjs.org/package/iso639-codes) [![Version](https://img.shields.io/npm/v/iso639-codes.svg?style=flat-square)](https://npmjs.org/package/iso639-codes) [![Downloads](https://img.shields.io/npm/dt/iso639-codes.svg?style=flat-square)](https://npmjs.org/package/iso639-codes) [![Travis](https://img.shields.io/travis/TiagoDanin/ISO639-Codes.svg?branch=master&style=flat-square)](https://travis-ci.org/TiagoDanin/ISO639-Codes) 

ISO639 Codes for JavaScript

## Installation

Module available through the [npm registry](https://www.npmjs.com/). It can be installed using the  [`npm`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) or [`yarn`](https://yarnpkg.com/en/) command line tools.

```sh
# NPM
npm install iso639-codes --save
# Or Using Yarn
yarn add iso639-codes
```

## Example

```js
const iso = require('iso639-codes')

iso['Portuguese'].name //'Portuguese'
iso['Portuguese'].names //['Portuguese']
iso['Portuguese']['iso639-2'] // 'por'
iso['Portuguese']['iso639-1'] // 'pt'

iso['Balinese']['iso639-2'] // 'ban'
iso['Balinese']['iso639-1'] // null

iso['Chichewa'].name // 'Chichewa'
iso['Chichewa'].names // ['Chichewa', 'Chewa', 'Nyanja']
```

## Documentation

### `iso639`
List of Languages

### `iso639[language]`
Get ISO information

- name (String)
- names (Array)
- iso639-2 (String)
- iso639-1 (String || null)

### Source
**NOTE:** Source is [www.loc.gov/standards/iso639-2/php/English_list.php](https://www.loc.gov/standards/iso639-2/php/English_list.php)

## Tests

To run the test suite, first install the dependencies, then run `test`:

```sh
# NPM
npm test
# Or Using Yarn
yarn test
```

## Dependencies

None

## Contributors

Pull requests and stars are always welcome. For bugs and feature requests, please [create an issue](https://github.com/TiagoDanin/ISO639-Codes/issues). [List of all contributors](https://github.com/TiagoDanin/ISO639-Codes/graphs/contributors).

## License

[MIT](LICENSE) © [Tiago Danin](https://TiagoDanin.github.io)