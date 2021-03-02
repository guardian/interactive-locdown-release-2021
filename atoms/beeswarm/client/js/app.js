import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as d3Polygon from 'd3-polygon'
import * as casesRaw from 'assets/cases.json'


let d3 = Object.assign({}, d3B, d3Select, d3Polygon);

const atomEl = d3.select('.interactive-wrapper').node()

let isMobile = window.matchMedia('(max-width: 700px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  isMobile ? window.innerHeight : width / 2 ;

let canvas = d3.select('.interactive-wrapper')
.append('canvas')
.attr('width', width)
.attr('height', height)

let context = canvas.node().getContext('2d')
context.clearRect(0, 0, width, height);

let svg = d3.select('.interactive-wrapper')
.append('svg')
.attr('class', 'gv-svg')
.attr('width', width)
.attr('height', height)

const posX = width / 7;

const radius = 4

const strength = 0.1

const restartAlpha = 0.1

let cont = 0;

const cases = casesRaw.default;

let datesRaw = []

cases.map(d => d[1].map(e => datesRaw.push(e.date)));
let dates = Array.from(new Set(datesRaw));

dates.sort()

let last = cases.map(d => d[1].find( o => o.date === dates[dates.length-1] ))

let currentDate = dates[0];

const maxPop = d3.max(cases , d => d[0].pop )

let radScale = d3.scaleSqrt()
.domain([0,maxPop])
.range([0,4])

const maxCases = d3.max(cases.map(d => d3.max(d[1], e => e.value)));

console.log(maxCases)

const xScale =  d3.scaleLog()
.domain([1, maxCases])
.range([ posX, width ])

cases.map(d => { d.r = radScale(+d[0].pop); d.x = posX; d.y = height/2 })

svg.append('line')
.attr('x1', posX + 'px')
.attr('y1', height/2 + 'px')
.attr('x2', xScale(maxCases) + 'px')
.attr('y2', height/2 + 'px')
.attr('stroke', 'black')


let ticks = [1, 10, 100, 1000];

let scaleX = svg.selectAll('text')
.data(ticks)
.enter()
.append('text')
.attr('transform', d => `translate(${xScale(d)},${height/2})`)
.text(d => d)

const makeChart = () => {

    const simulation = d3.forceSimulation()
    .nodes(cases)
    .force("charge", d3.forceManyBody().strength(strength))
    .force( 'x', d3.forceX ( d => {

    	let match = d[1].find( o => o.date === currentDate );

    	if(match)
    	{
    		return xScale(match.value)
    	}


    }).strength(strength) )
	.force("y", d3.forceY().y(height/2).strength(strength))
    .force( 'collide', d3.forceCollide().radius(d => d.r + 1).strength(0.8) )
    .on('tick', () => {

    	context.clearRect(0, 0, width, height);

        simulation.nodes().forEach(d => {
		    context.beginPath();
		    context.fillStyle = "#c70000";
		    context.arc(d.x, d.y + d.r, d.r, 0, Math.PI * 2);
		    context.fill();
		})

    })


    let interval = setInterval(d => {

    	if(!isPaused) {

	    	if(cont < dates.length){

	    		currentDate = dates[cont];

		    	d3.select('.gv-date').html(currentDate)

		        simulation.alpha(restartAlpha).restart()

		        simulation.force('x').initialize(cases)

		        cont ++
	    	}
	    	else
	    	{
	    		clearInterval(interval)

	    		simulation.stop()
	    	}
    	}
    	else{
    		simulation.stop()
    	}
	    
	}, 100)
}

let isPaused = false;

let button = d3.select('.interactive-wrapper')
.append('button')
.html('pause')
.on('click', d => isPaused = true)

let button2 = d3.select('.interactive-wrapper')
.append('button')
.html('start')
.on('click', d => isPaused = false)

makeChart()





