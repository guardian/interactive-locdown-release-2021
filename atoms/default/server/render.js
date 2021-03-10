import mainHTML from "./atoms/default/server/templates/main.html!text"

import fs from 'fs'

export async function render() {

    const dates = JSON.parse(fs.readFileSync('shared/server/dates.json'))

    const boxes = dates.concat({}).map( o => {

        return `
            <div class="scroll-text__inner">
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
                    <h2 class='swarm-date'></h2>
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