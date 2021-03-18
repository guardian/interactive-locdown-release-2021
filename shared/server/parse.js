import fs from 'fs'
import sync from 'csv-parse/lib/sync'
import _ from 'lodash'

import moment from 'moment'

const data = sync(fs.readFileSync('shared/server/cases.csv'), { columns : true })

const dates = JSON.parse(fs.readFileSync('shared/server/dates.json'))

const format = str => {
    return str.slice(-4) + '-' + str.slice(3, 5) + '-' + str.slice(0, 2)
}

const cleanName = str => {
    if(str === 'Kingston upon Hull, City of') {
        return 'Hull'
    }

    return str
}

const out = _(data)
    .groupBy('areaName')
    .mapValues( arr => {

        const pop = Number(arr[0].Population)

        const cases = []

        arr
        .filter( o => moment(o.date, 'DD/MM/YYYY').diff(moment('28-02-2020', 'DD-MM-YYYY'), 'days') >= 0)
        .forEach( o => {

            console.log(o.date)

            cases.push(Number(o.newCasesBySpecimenDateRollingRate))   

            //cases[format(o.date)] = Number(o.newCasesBySpecimenDateRollingRate)
        })

        return {
            pop,
            cases
            //: _.sortBy(arr.map( o => Object.assign({}, { date : format(o.date), rate : Number(o.newCasesBySpecimenDateRollingRate) }) ), 'date')
        }
    } )
    .toPairs()
    .map( t => {

        return Object.assign({}, t[1], { name : cleanName(t[0]) })

    } )
    .orderBy( o => {

        return _.flattenDeep(dates.map( o => {
            return [
                o['LA-highlight'],
                o['LA-label']
            ]
        })).indexOf( o.name ) >= 0 ? 1 : -1

    } )
    .valueOf()

console.log(out)

fs.writeFileSync('shared/server/cases.json', JSON.stringify(out, null, 2))