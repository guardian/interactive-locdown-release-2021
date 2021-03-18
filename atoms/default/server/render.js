import mainHTML from "./atoms/default/server/templates/main.html!text"

import fs from 'fs'
import moment from 'moment'

export async function render() {

    const dates = JSON.parse(fs.readFileSync('shared/server/dates.json'))

    const boxes = dates.concat({}).map( (o, i) => {

        let days = 10
        
        if(i < dates.length - 1) {

            const a = moment(dates[i].Date, 'YYYY-MM-DD') 
            const b = moment(dates[i + 1].Date, 'YYYY-MM-DD')

            days = b.diff(a, 'days')

        }

        const height = days === 0 ? '100vh' : `${10 + days/30*120}vh`

        return `
            <div class="scroll-text__inner" data-days=${days} style='height: ${height};'>
                <div class="scroll-text__div">
                    <p>${o.Annotation}</p>
                </div>
            </div>`

    } ).join('')

    return `

    <div id="scrolly-1">
        <div class="scroll-wrapper">
            <div class="scroll-inner">
                <div class='swarm-wrapper'>
                    <svg class='swarm-svg'></svg>
                    <h2 class='swarm-date'>
                    <span class='day'></span>
                    <span class='month'></span>
                    <span class='year'></span>
                    </h2>
                </div>
            </div>
            <div class="scroll-text">
                ${boxes}
            </div>
        </div>
    </div>
    <div class='overall-progress'></div>


    `
} 