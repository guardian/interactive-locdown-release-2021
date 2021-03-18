import fs from 'fs'
import sync from 'csv-parse/lib/sync'
import moment from 'moment'

const data = sync(fs.readFileSync('shared/server/national.csv'), { columns : true })

const cases = []

data
.filter( o => moment(o.date, 'DD/MM/YYYY').diff(moment('28-02-2020', 'DD-MM-YYYY'), 'days') >= 0)
.forEach( o => {

    console.log(o.date)

    cases.push({
        avg : Number(o.newCasesBySpecimenDateRollingRate),
        annot : o.Annotation
    })

    //cases[format(o.date)] = Number(o.newCasesBySpecimenDateRollingRate)
})

fs.writeFileSync('shared/server/national.json', JSON.stringify(cases))