
import * as d3se from 'd3-selection'
import * as d3sc from 'd3-scale'
import * as d3f from 'd3-force'

const d3 = Object.assign({}, d3se, d3sc, d3f)

import rawData from 'shared/server/cases.json'
import rawNational from 'shared/server/national.json'

import { $, wait, round, sum, numberWithCommas } from 'shared/js/util'

import dates from 'shared/server/dates.json'

import ScrollyTeller from 'shared/js/scrollyteller'

import moment from 'moment'

const days = rawData[0].cases.map((_, i) => {
    return moment('2020-02-28', 'YYYY-MM-DD').add(i, 'days')
    .format('YYYY-MM-DD')
})

const data = rawData.map( o => {
    const cases = {};
    
    o.cases.forEach( (v, i) => {
        cases[days[i]] = v
    } )

    return Object.assign({}, o, { cases })

} )

const national = {}
rawNational.forEach((o, i) => {
    national[days[i]] = o
})

const isMobile = window.matchMedia('(max-width: 739px)').matches

const draw = () => {

    const svgEl = $('.swarm-svg')

    const width = svgEl.getBoundingClientRect().width
    const height = isMobile ? window.innerHeight*0.75 : 500

    const linWidth = isMobile ? 50 : 75

    const svg = d3.select(svgEl)
        .attr('width', width)
        .attr('height', height)

    const smallScale = d3.scaleLinear()
        .domain([0, 1])
        .range([ 0, linWidth ])

    const logScale = isMobile ? d3.scaleLog()
        .domain([ 1, 2000 ])
        .range([ linWidth, height ])

    : d3.scaleLog()
        .domain([ 1, 2000 ])
        .range([ linWidth, width ])

    const caseScale = isMobile ? v => {
        
        return v > 1 ? height - logScale(v) : height - smallScale(v)
    } : v => {
        
        return v > 1 ? logScale(v) : smallScale(v)
    }

    svg.append('defs')
    .append('marker')
    .attr('id', 'arrow-tri')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .attr('refX', 3)
    .attr('refY', 3)
    .append('path')
    .attr('d', 'M 0,0 L 6,3 L 0,6')
    .style('fill', '#bdbdbd')
    
    if(isMobile) { 

        const scaleG = svg
            .append('g')
            .attr('transform', `translate(${width/2}, 0)`)

        scaleG
            .append('line')
            .attr('y1', 0)
            .attr('y2', height)
            .attr('class', 'swarm-scale')

        const tickGs = scaleG
            .selectAll('blah')
            .data([ 0, 1, 10, 100, 1000 ])
            .enter()
            .append('g')
            .attr('transform', d => `translate(${width/2 - 50}, ${caseScale(d)})`)

        const tickLabels = tickGs
            .append('text')
            .attr('y', 4)
            .text( d => numberWithCommas(d) )
            .attr('class', 'swarm-scalelabel')

        tickLabels
            .filter(d => d === 1000)
            .append('tspan')
            .text('cases / 100k')
            .attr('dy', 18)
            .attr('x', 0)

    } else {

        const scaleG = svg
            .append('g')
            .attr('transform', `translate(0, ${height*0.7})`)

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
            .attr('transform', d => `translate(${caseScale(d)}, 0)`)

        const tickLabels = tickGs
            .append('text')
            .attr('y', 20)
            .text( d => numberWithCommas(d) )
            .attr('class', 'swarm-scalelabel')

        tickLabels
            .filter(d => d === 1000)
            .append('tspan')
            .text('cases / 100k')
            .attr('dy', 18)
            .attr('x', 0)

    }
   
    const maxR = isMobile ? 6 : 10

    const rScale = d3.scaleSqrt()
        .domain([ 0, 10**6 ])
        .range([ 1, maxR ])

    const bubbles = svg
        .selectAll('blah')
        .data( data )
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .attr('id', d => d.name)

    const labels = svg
    .selectAll('blah')
    .data( data )
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)
    .attr('class', 'swarm-label')

    labels
        .append('text')
        .text( d => d.name )
        .attr('y', d => -rScale(d.pop) - 3)
        .attr('class', 'swarm-labeltext swarm-labeltext--white')

    labels
        .append('text')
        .text( d => d.name )
        .attr('y', d => -rScale(d.pop) - 3)
        .attr('class', 'swarm-labeltext')
        
    const circles = bubbles.append('circle')
        .attr('r', d => rScale(d.pop))
        .attr('class', 'swarm-dot')

    // ARROWS

    const arrowLeftG = svg
        .append('g')
        .attr('transform', `translate(${width/2 - 150}, ${height - 20})`)
        .attr('class', 'swarm-arrowg')

    const arrowLeftInnerG = arrowLeftG.append('g')
    .attr('class', 'swarm-arrow-innerg')

    arrowLeftInnerG.append('line')
        .attr('x1', 0)
        .attr('x2', -30)
        .attr('y1', -5)
        .attr('y2', -5)
        .attr('class', 'swarm-arrow')
        .attr('marker-end', 'url("#arrow-tri")')

    arrowLeftInnerG
        .append('text')
        .attr('x', 5)
        .text('lockdown effect')
        .attr('class', 'swarm-effect-label')

    const arrowRightG = svg
        .append('g')
        .attr('transform', `translate(${width/2 + 150}, ${height - 20})`)
        .attr('class', 'swarm-arrowg')

    const arrowRightInnerG = arrowRightG.append('g')
    .attr('class', 'swarm-arrow-innerg swarm-arrow-innerg--right')

    arrowRightInnerG.append('line')
        .attr('x1', 0)
        .attr('x2', 30)
        .attr('y1', -5)
        .attr('y2', -5)
        .attr('class', 'swarm-arrow')
        .attr('marker-end', 'url("#arrow-tri")')

    arrowRightInnerG
        .append('text')
        .attr('x', -5)
        .text('cases rebound')
        .attr('class', 'swarm-effect-label swarm-effect-label--right')


    const highlight = (arr, arrToLabel, arr2) => {

        // circles.attr('class', d => {

        //     if(arr.indexOf(d.name) >= 0) {
        //         return 'swarm-dot swarm-dot--hl'
        //     }
        //     if(arr2.indexOf(d.name) >= 0) {
        //         return 'swarm-dot swarm-dot--semihl'
        //     }

        //     return 'swarm-dot'
        // })

        circles.classed('swarm-dot--hl', d => arr.indexOf(d.name) >= 0)

        labels.classed('swarm-label--shown', d => arrToLabel.indexOf(d.name) >= 0)
    }

    const highlightAll = () => {
        circles.classed('swarm-dot--hl', true)
    }

    const xStrength = 0.8

    var date = '2020-02-28'

    //$('.swarm-date').innerHTML = moment(date, 'YYYY-MM-DD').format('D MMM YYYY')
    $('.day').innerHTML = moment(date, 'YYYY-MM-DD').format('D')
    $('.month').innerHTML = moment(date, 'YYYY-MM-DD').format('MMM YYYY')
    // $('.year').innerHTML = moment(date, 'YYYY-MM-DD').format('YYYY')
    

    const tick = () => {

        try {
            bubbles.attr('transform', d => `translate(${d.x}, ${d.y})`)
            labels.attr('transform', d => `translate(${d.x}, ${d.y})`)
        } catch(err) {
            console.log(err)
        }
        

    }
    
    const sim = isMobile ? d3.forceSimulation()

    .nodes(data)
    .force( 'y', d3.forceY ( d => {

        return caseScale(d.cases[date])

    } ).strength(xStrength) )
    .force( 'x', d3.forceX ( width / 2 ).strength(0.1) )
    .force( 'collide', d3.forceCollide().radius(d => {

        return rScale(d.pop) + 1

    }).strength(0.8) )

    .on('tick', tick)
    
    : d3.forceSimulation()
        .nodes(data)
        .force( 'x', d3.forceX ( d => {

            return caseScale(d.cases[date])

        } ).strength(xStrength) )
        .force( 'y', d3.forceY ( height*0.4 ).strength(0.1) )
        .force( 'collide', d3.forceCollide().radius(d => {

            return rScale(d.pop) + 1

        }).strength(0.8) )

    .on('tick', tick)
    

    const restartAlpha = 0.2

    const scrolly = new ScrollyTeller({
        parent: document.querySelector("#scrolly-1"),
        triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
        triggerTopMobile: 0.75,
        transparentUntilActive: true
    })

    const updateDate = () => {

        $('.day').innerHTML = moment(date, 'YYYY-MM-DD').format('D')
        $('.month').innerHTML = moment(date, 'YYYY-MM-DD').format('MMM YYYY')

        sim.alpha(restartAlpha).restart()
        sim.force(isMobile ? 'y' : 'x').initialize(data)

        arrowLeftG.classed('swarm-arrowg--shown', national[date].annot === 'Lockdown effect')
        arrowRightG.classed('swarm-arrowg--shown', national[date].annot === 'Cases rebound')
    }

    const progressBar = $('.overall-progress')

    scrolly.overall( p => {

        progressBar.style.width = p*100 + '%'
        progressBar.style.opacity = p > 1 ? 0 : 1

    } )

    scrolly.gradual( (p, i, abs, total) => {

        try {

            const toHighlight = dates[i]['LA-highlight']

            const toLabel = dates[i]['LA-label']
            highlight(toHighlight, toLabel)

            if(i < dates.length - 1) {

                const a = moment(dates[i].Date, 'YYYY-MM-DD') 
                const b = moment(dates[i + 1].Date, 'YYYY-MM-DD')

                if(dates[i].Date === dates[i + 1].Date) {
                    //console.log('gradual a === b')
                    return null
                }

                const toCover = b.diff(a, 'days')

                if(abs > 500) {

                    const p = (abs - 500)/(total - 500)
                    const n = round(p*toCover)

                    date = moment(dates[i].Date, 'YYYY-MM-DD').add(n, 'days').format('YYYY-MM-DD')
                    
                    //console.log(`advancing ${n} days (DATE: ${date})`)

                    if(data[0].cases[date] !== undefined) {
                        updateDate()
                    }

                }

            }
        }
        catch (err) {
            console.log(err)
        }
    
    })

    dates.slice(0, -1).forEach( (o, i) => {

        scrolly.addTrigger({ num : i + 1, do : () => {

            if(data[0].cases[o.Date]) {

            if(i > 0 && o.Date === dates[i-1].Date) {
                return null // DO NOTHING
            }

            date = o.Date
            
            $('.day').innerHTML = moment(date, 'YYYY-MM-DD').format('D')
            $('.month').innerHTML = moment(date, 'YYYY-MM-DD').format('MMM YYYY')
            
            sim.alpha(restartAlpha).restart()
            sim.force(isMobile ? 'y' : 'x').initialize(data)

            } else {
                console.log('no data')
            }

        } })

    } )

    $('.scroll-wrapper').addEventListener('click', () => {
        scrolly.toggle()
    })

    wait(400).then( () => scrolly.watchScroll() )

}

draw()