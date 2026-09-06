// Rebuilds index.json from the official ISO 639-2 list published by the
// Library of Congress. Two input formats are accepted:
//
//   1. ISO-639-2_utf-8.txt (preferred, machine readable)
//      https://www.loc.gov/standards/iso639-2/ISO-639-2_utf-8.txt
//      Pipe separated: alpha3-B|alpha3-T|alpha2|English name|French name
//
//   2. A saved copy of the English list page
//      https://www.loc.gov/standards/iso639-2/php/English_list.php
//      (open it in a browser, wait for the last row - "Zuni" - and save)
//
// Both URLs sit behind a bot challenge, so they cannot be fetched from a
// script - download the file in a browser and run:
//
//   node parser.js path/to/ISO-639-2_utf-8.txt
//
// Every alias of a language becomes its own key - "Chichewa; Chewa; Nyanja"
// produces the keys Chichewa, Chewa and Nyanja sharing the same codes - and
// languages with distinct ISO 639-2/B and /T codes keep the historical
// slash form ("alb/sqi"). After writing index.json the TypeScript
// declarations and the ESM entry point are regenerated so the three
// artifacts can never disagree.

const fs = require('fs')
const path = require('path')

const input = process.argv[2] || path.join(__dirname, 'ISO-639-2_utf-8.txt')

if (!fs.existsSync(input)) {
  console.error(`Input not found: ${input}`)
  console.error('Download https://www.loc.gov/standards/iso639-2/ISO-639-2_utf-8.txt first.')
  process.exit(1)
}

// rows: [aliases ("a; b; c"), iso639-2 ("alb/sqi"), iso639-1 (or '')]
let rows

const parseText = (text) => text
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/)
  .filter(line => line.includes('|'))
  .map(line => {
    const [b, t, alpha2, english] = line.split('|')
    return [english, t && t !== b ? `${b}/${t}` : b, alpha2]
  })

const parseHtml = (html) => {
  const decodeEntities = (value) => value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")

  const cleanCell = (cell) => decodeEntities(cell.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

  // Columns: English name | English name (aliases) | French name | 639-2 | 639-1
  return (html.match(/<tr valign="top">[\s\S]*?<\/tr>/gi) || [])
    .map(row => (row.match(/<td[^>]*>[\s\S]*?(?=<td|<\/tr)/gi) || []).map(cell => cleanCell(cell)))
    .filter(cells => cells.length >= 5 && cells[3] !== '')
    .map(cells => [cells[1], cells[3], cells[4]])
}

if (/\.txt$/i.test(input)) {
  rows = parseText(fs.readFileSync(input, 'utf8'))
} else {
  // The saved page is served as windows-1252
  rows = parseHtml(fs.readFileSync(input, 'latin1'))
}

if (rows.length === 0) {
  console.error('No data rows found - is this the LoC ISO 639-2 list?')
  process.exit(1)
}

const data = {}
let languages = 0

for (const [aliases, iso6392, iso6391] of rows) {
  const names = aliases.split(';').map(name => name.trim()).filter(Boolean)

  languages++
  for (const name of names) {
    data[name] = {
      name,
      names,
      'iso639-2': iso6392,
      'iso639-1': iso6391 ? iso6391.trim() || null : null
    }
  }
}

// Serialized in the same layout the file always had: tab indented objects
// with the names array kept inline.
const serializeEntry = ([key, value]) => [
  `\t${JSON.stringify(key)}: {`,
  `\t\t"name": ${JSON.stringify(value.name)},`,
  `\t\t"names": [${value.names.map(name => JSON.stringify(name)).join(', ')}],`,
  `\t\t"iso639-2": ${JSON.stringify(value['iso639-2'])},`,
  `\t\t"iso639-1": ${JSON.stringify(value['iso639-1'])}`,
  '\t}'
].join('\n')

// The file has always been sorted by English name
const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b, 'en'))
const json = `{\n${entries.map(entry => serializeEntry(entry)).join(',\n')}\n}\n`

const outputFile = path.join(__dirname, 'index.json')
fs.writeFileSync(outputFile, json)
console.log(`Parsed ${languages} languages (${Object.keys(data).length} keys) into index.json`)

// Keep the generated artifacts in sync with the new data
const { execFileSync } = require('child_process')
execFileSync(process.execPath, [path.join(__dirname, 'scripts', 'build-types.js')], { stdio: 'inherit' })
execFileSync(process.execPath, [path.join(__dirname, 'scripts', 'build-esm.js')], { stdio: 'inherit' })
