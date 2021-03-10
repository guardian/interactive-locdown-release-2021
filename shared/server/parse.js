import fs from 'fs'
import sync from 'csv-parse/lib/sync'
import _ from 'lodash'

const data = sync(fs.readFileSync('shared/server/cases.csv'), { columns : true })

const format = str => {
    return str.slice(-4) + '-' + str.slice(3, 5) + '-' + str.slice(0, 2)
}

const out = _(data)
    .groupBy('areaName')
    .mapValues( arr => {

        const pop = Number(arr[0].Population)

        const cases = {}

        arr.forEach( o => {

            cases[format(o.date)] = Number(o.newCasesBySpecimenDateRollingRate)
        })

        return {
            pop,
            cases
            //: _.sortBy(arr.map( o => Object.assign({}, { date : format(o.date), rate : Number(o.newCasesBySpecimenDateRollingRate) }) ), 'date')
        }
    } )
    .toPairs()
    .map( t => {

        return Object.assign({}, t[1], { name : t[0] })

    } )
    .valueOf()

console.log(out)

fs.writeFileSync('shared/server/cases.json', JSON.stringify(out, null, 2))