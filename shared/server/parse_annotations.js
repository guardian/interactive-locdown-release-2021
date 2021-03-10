import fs from 'fs'
import sync from 'csv-parse/lib/sync'

const format = str => {
    return str.slice(-4) + '-' + str.slice(3, 5) + '-' + str.slice(0, 2)
}

const data = sync(fs.readFileSync('shared/server/dates.csv'), { columns : true })
    .slice(1)
    .map( o => {

        const newDate = format(o.Date)

        return Object.assign({}, o, { Date : newDate })

    } )

fs.writeFileSync('shared/server/dates.json', JSON.stringify(data, null, 2))