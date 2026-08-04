// Rebuilds index.json from the official ISO 639-2 list published by the
// Library of Congress:
//
//   https://www.loc.gov/standards/iso639-2/php/English_list.php
//
// The page sits behind a bot challenge, so it cannot be fetched from a
// script. Open it in a browser, wait for the full table to load (the last
// row is "Zuni"), save it as "English_list.html" next to this file and run:
//
//   node parser.js [path/to/English_list.html]
//
// Every alias of a language becomes its own key - "Chichewa; Chewa; Nyanja"
// produces the keys Chichewa, Chewa and Nyanja sharing the same codes - and
// ISO 639-2/B and /T codes arrive already joined by the page ("alb/sqi").
// After writing index.json the TypeScript declarations and the ESM entry
// point are regenerated so the three artifacts can never disagree.

const fs = require('fs')
const path = require('path')

const input = process.argv[2] || path.join(__dirname, 'English_list.html')

if (!fs.existsSync(input)) {
  console.error(`Input not found: ${input}`)
  console.error('Save https://www.loc.gov/standards/iso639-2/php/English_list.php as English_list.html first.')
  process.exit(1)
}

// The page is served as windows-1252
const html = fs.readFileSync(input, 'latin1')

const decodeEntities = (value) => value
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/&quot;/g, '"')
  .replace(/&#039;|&apos;/g, "'")

const cleanCell = (cell) => decodeEntities(cell.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

// Data rows: <tr valign="top"> with <td scope="row"> cells
// Columns: English name | English name (aliases) | French name | 639-2 | 639-1
const rows = (html.match(/<tr valign="top">[\s\S]*?<\/tr>/gi) || [])
  .map(row => (row.match(/<td[^>]*>[\s\S]*?(?=<td|<\/tr)/gi) || []).map(cell => cleanCell(cell)))
  .filter(cells => cells.length >= 5 && cells[3] !== '')

if (rows.length === 0) {
  console.error('No data rows found - is this a saved copy of English_list.php?')
  process.exit(1)
}

const data = {}
let languages = 0

for (const cells of rows) {
  const names = cells[1].split(';').map(name => name.trim()).filter(Boolean)
  const iso6392 = cells[3]
  const iso6391 = cells[4] === '' ? null : cells[4]

  languages++
  for (const name of names) {
    data[name] = {
      name,
      names,
      'iso639-2': iso6392,
      'iso639-1': iso6391
    }
  }
}

const outputFile = path.join(__dirname, 'index.json')
fs.writeFileSync(outputFile, JSON.stringify(data))
console.log(`Parsed ${languages} languages (${Object.keys(data).length} keys) into index.json`)

// Keep the generated artifacts in sync with the new data
require('./scripts/build-types.js')
require('./scripts/build-esm.js')
