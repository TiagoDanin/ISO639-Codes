const iso = require('./')

iso['Portuguese'].name //'Portuguese'
iso['Portuguese'].names //['Portuguese']
iso['Portuguese']['iso639-2'] // 'por'
iso['Portuguese']['iso639-1'] // 'pt'

iso['Balinese']['iso639-2'] // 'ban'
iso['Balinese']['iso639-1'] // null

iso['Chichewa'].name // 'Chichewa'
iso['Chichewa'].names // ['Chichewa', 'Chewa', 'Nyanja']
