import * as d3 from 'd3'
import data from 'shared/server/cases.json'

import { $, wait, round, sum } from 'shared/js/util'

import dates from 'shared/server/dates.json'

import ScrollyTeller from 'shared/js/scrollyteller'

import moment from 'moment'


const isMobile = window.matchMedia('(max-width: 739px').matches

const draw = () => {

    const svgEl = $('.swarm-svg')

    const width = svgEl.getBoundingClientRect().width
    const height = 450

    const svg = d3.select(svgEl)
        .attr('width', width)
        .attr('height', height)

    const rawScale = d3.scaleLog()
        .domain([0.2, 2000])
        .range([ 5, width ])

    const xScale = v => {
        return v > 0.2 ? rawScale(v) : 0
    }


    const scaleG = svg
        .append('g')
        .attr('transform', `translate(0, ${height*3/4})`)

    scaleG
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('class', 'swarm-scale')

    const tickGs = scaleG
        .selectAll('blah')
        .data([ 0, 1, 10, 100, 1000 ])
        .enter()
        .append('g')
        .attr('transform', d => `translate(${xScale(d)}, 0)`)

    tickGs
        .append('text')
        .attr('y', 20)
        .text( d => d )
        .attr('class', 'swarm-scalelabel')

    // const rawScale = d3.scaleLinear()
    // .domain([ 0, 1200 ])
    // .range([ 0, width ])

    // const xScale = v => {

    //     if(v > 1200) {
    //         return width
    //     }

    //     return rawScale(v)

    // }

   
    const maxR = isMobile ? 6 : 10

    const rScale = d3.scaleSqrt()
        .domain([ 0, 10**6 ])
        .range([ 1, maxR ])

    const bubbles = svg
        .selectAll('blah')
        .data( data )
        .enter()
        .append('g')
        .attr('transform', d => ` translate(${d.x}, ${d.y})`)
        .attr('id', d => d.name)

    const labels = svg
    .selectAll('blah')
    .data( data )
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)
    .style('display', 'none')
        
    const circles = bubbles.append('circle')
        .attr('r', d => rScale(d.pop))
        .attr('class', 'swarm-dot')

    const highlight = arr => {

        //console.log(arr)

        circles.classed('swarm-dot--hl', d => {
            return arr.indexOf(d.name) >= 0
        })
    }

    const highlightAll = () => {

        //console.log("highlighting all ...")
        circles.classed('swarm-dot--hl', true)
    }

    // labels

    //     .filter( d => d[0] === 'Camden' )
    //     .append('circle')
    //     .attr('r', r)
    //     .attr('class', 'swarm-dot swarm-dot--highlight')

    // labels
    //     .filter( d => d[0] === 'Camden' )
    //     .append('text')
    //     .attr('class', 'swarm-label')
    //     .text( d => d[0] )
    //     .attr('y', -r - 6)


    const xStrength = 0.8

    var date = '2020-03-01'

    $('.swarm-date').innerHTML = moment(date, 'YYYY-MM-DD').format('D MMM YYYY')

    const sim = d3.forceSimulation()
        .nodes(data)
        .force( 'x', d3.forceX ( d => {

            return xScale(d.cases[date])

        } ).strength(xStrength) )
        .force( 'y', d3.forceY ( height / 2 ).strength(0.1) )
        .force( 'collide', d3.forceCollide().radius(d => {

            return rScale(d.pop) + 1

        }).strength(0.8) )

    .on('tick', () => {

        try {
            bubbles.attr('transform', d => `translate(${d.x}, ${d.y})`)

            //.attr('data-val', d => d[1].find( o => o.date === date ).rate)

            labels.attr('transform', d => `translate(${d.x}, ${d.y})`)
        } catch(err) {
            console.log(err)
        }
        

    })

    const restartAlpha = 0.2

    const scrolly = new ScrollyTeller({
        parent: document.querySelector("#scrolly-1"),
        triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
        triggerTopMobile: 0.75,
        transparentUntilActive: true
    })

    const updateDate = () => {
        $('.swarm-date').innerHTML = moment(date, 'YYYY-MM-DD').format('D MMM YYYY')
        sim.alpha(restartAlpha).restart()
        sim.force('x').initialize(data)
    }

    const progressBar = $('.overall-progress')

    scrolly.overall( p => {

        //console.log(p)

        progressBar.style.width = p*100 + '%'
        progressBar.style.opacity = p > 1 ? 0 : 1

    } )

    scrolly.gradual( (p, i) => {

        console.log(p, i)

        const toHighlight = dates[i]['LA-highlight'].split(/,/g)
        highlight(toHighlight)

        if(i < dates.length - 1) {

            const a = moment(dates[i].Date, 'YYYY-MM-DD') 
            const b = moment(dates[i + 1].Date, 'YYYY-MM-DD')

            const toCover = b.diff(a, 'days')

            const n = round((p-0.5)*2*toCover)

            if( p > 0.5 ) {
                date = moment(dates[i].Date, 'YYYY-MM-DD').add(n, 'days').format('YYYY-MM-DD')
                updateDate()
            }

        }
        
        // if(i === 0) {

        //     const n = round(p*100)
        //     date = moment('2020-03-01', 'YYYY-MM-DD').add(n, 'days').format('YYYY-MM-DD')

        //     updateDate()

        //     //highlightAll()


        // }

        // if(i === 2) {

        //     const n = round(p*100)
        //     date = moment('2020-03-01', 'YYYY-MM-DD').add(100 + n, 'days').format('YYYY-MM-DD')

        //     $('.swarm-date').innerHTML = moment(date, 'YYYY-MM-DD').format('D MMM YYYY')

        //     sim.alpha(restartAlpha).restart()
    
        //     sim.force('x').initialize(data)

        //     //console.log('eyyyy')
        //     //highlightAll()

        // }
    
    })

    // scrolly.addTrigger({ num : 2, do : () => {

    //     date = moment('2020-03-01', 'YYYY-MM-DD').add(100, 'days').format('YYYY-MM-DD')

    //     //highlight([ 'Camden', 'Liverpool', 'Isle of Wight' ])

    //     $('.swarm-date').innerHTML = moment(date, 'YYYY-MM-DD').format('D MMM YYYY')

    //     sim.alpha(restartAlpha).restart()

    //     sim.force('x').initialize(data)

    // } })

    dates.forEach( (o, i) => {

        scrolly.addTrigger({ num : i + 1, do : () => {

                date = o.Date
                $('.swarm-date').innerHTML = moment(date, 'YYYY-MM-DD').format('D MMM YYYY')
                sim.alpha(restartAlpha).restart()
                sim.force('x').initialize(data)

        } })

    } )

    wait(400).then( () => scrolly.watchScroll() )

}

draw()