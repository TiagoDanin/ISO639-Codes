//RUN: https://www.loc.gov/standards/iso639-2/php/English_list.php

const data = {}
const tbody = document.getElementsByTagName('tbody')[0]
const list = tbody.getElementsByTagName('tr')

for (let i = 2; i < list.length - 1; i++) {
	const item = list[i].getElementsByTagName('td')
	const name = item[0].innerText.trim()
	const names = item[1].innerText.split(';').map(e => e.trim())
	const i02 = item[3].innerText.trim()
	const i01 = item[4].innerText.trim()

	data[name] = {
		name,
		names,
		['iso639-2']: i02,
		['iso639-1']: i01 == '' ? null : i01
	}
}

console.log(JSON.stringify(data))
