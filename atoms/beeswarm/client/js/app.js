import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as d3Polygon from 'd3-polygon'
import * as casesRaw from 'assets/cases.json'
import ScrollyTeller from 'shared/js/scrollyteller'
import moment from 'moment'
import { round }  from 'shared/js/util'


const annotations = [
{
	"Date": "05/01/2020",
	"Title": "",
	"Annotation": "",
	"LA-marker": [],
	"LA-annotation": ""
},
{
	"Date": "23/03/2020",
	"Title": "Lockdown imposed",
	"Annotation": "Boris Johnson announced that the whole UK would enter lockdown on 23 March and warns people to \"stay at home\".",
	"LA-marker": [],
	"LA-annotation": ""
},
{
	"Date": "01/06/2020",
	"Title": "Lockdown eased and mass testing introduced",
	"Annotation": "Lockdown measures are eased as children returned to the classroom. Meanwhile, mass testing in the community started from late May. This meant that more cases started to be officially counted in the government numbers.",
	"LA-marker": [],
	"LA-annotation": ""
},
{
	"Date": "29/06/2020",
	"Title": "Leicester lockdown",
	"Annotation": "The first local lockdown was announced in Leicester as non-essential shops, salons, gyms and restaurants had to remain closed.",
	"LA-marker": ["Leicester"],
	"LA-annotation": "Rate at which Leicester entered local lockdown"
},
{
	"Date": "04/07/2020",
	"Title": "Lockdown eased further",
	"Annotation": "Pubs were open and weddings were allowed as the government reached its final stage of lockdown easing",
	"LA-marker": [],
	"LA-annotation": ""
},
{
	"Date": "31/07/2020",
	"Title": "North-east lockdown",
	"Annotation": "Greater Manchester and parts of West Yorkshire placed into local lockdown as cases rose in the area.",
	"LA-marker": ["Bolton","Bury","Manchester","Oldham","Rochdale","Salford","Stockport","Tameside","Trafford","Wigan","Bradford","Calderdale","Kirklees"],
	"LA-annotation": "Rate at which North-east entered local lockdown"
},
{
	"Date": "05/11/2020",
	"Title": "Second lockdown imposed",
	"Annotation": "Boris Johnson imposed a new national lockdown in England to prevent a \"medical and moral disaster\".",
	"LA-marker": ["Oldham"],
	"LA-annotation": "Oldham had the highest rate in the country at this point"
},
{
	"Date": "02/12/2020",
	"Title": "Lockdown eased",
	"Annotation": "Once again, lockdown was eased at the start of December.",
	"LA-marker": ["Medway"],
	"LA-annotation": "A new variant rippled across the south-east, with Medway now having the highest rate."
},
{
	"Date": "19/12/2020",
	"Title": "Tier 4 in south-east",
	"Annotation": "Vast swathes of the south-east, east and all of London were placed under Tier 4, equivalent to a \"stay at home\" message.",
	"LA-marker": ["Ashford","Canterbury","Dartford","Dover","Folkestone and Hythe","Gravesham","Maidstone","Sevenoaks","Swale","Thanet","Tonbridge and Malling","Tunbridge Wells","Buckinghamshire","Berkshire","Elmbridge","Epsom and Ewell","Guildford","Mole Valley","Reigate and Banstead","Runnymede","Spelthorne","Surrey Heath","Tandridge","Waverley","Woking","Gosport","Havant","Portsmouth","Rother","Hastings","Bexley","Sutton","Ealing","Kingston upon Thames","Harrow","Merton","Brent","Barnet","Greenwich","Newham","Barking and Dagenham","Croydon","Lewisham","Tower Hamlets","Bromley","Hillingdon","Hounslow","Southwark","Richmond upon Thames","Hackney and City of London","Kensington and Chelsea","Redbridge","Havering","Enfield","Haringey","Wandsworth","Waltham Forest","Hammersmith and Fulham","Islington","Westminster","Lambeth","Camden","Bedford","Central Bedford","Milton Keynes","Luton","Peterborough","Broxbourne","Dacorum","East Hertfordshire","Hertsmere","North Hertfordshire","St Albans","Stevenage","Three Rivers","Watford","Welwyn Hatfield","Basildon","Braintree","Brentwood","Castle Point","Chelmsford","Epping Forest","Harlow","Maldon","Rochford"],
	"LA-annotation": ""
},
{
	"Date": "04/01/2021",
	"Title": "Third lockdown imposed",
	"Annotation": "Once again, lockdown was imposed after a surge in coronavirus cases during the Christmas period. A new variant had also been allowed to spread from the south-east, with huge case rates seen in London.",
	"LA-marker": ["Barking and Dagenham"],
	"LA-annotation": ""
},
{
	"Date": "29/03/2020",
	"Title": "Lockdown eased",
	"Annotation": "Lockdown is now being eased again, despite [x] local authorities having case rates that are higher than those that saw Leicester and Manchester enter local lockdown.",
	"LA-marker": [],
	"LA-annotation": ""
}
]


const annotationDates = annotations.map(d => d.Date)


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

const strength = 0.8;

const restartAlpha = 0.2;

let cont = 0;

const cases = casesRaw.default;

let datesRaw = []

let parseTime = d3.timeParse("%d/%m/%Y");

cases.map(d => d[1].map(e => datesRaw.push(e.date)));
let dates = Array.from(new Set(datesRaw));

dates.sort((a,b) => parseTime(a) - parseTime(b))

let last = cases.map(d => d[1].find( o => o.date === dates[dates.length-1] ))

let currentDate = dates[0];

const maxPop = d3.max(cases , d => +d[0].pop )

let radScale = d3.scaleSqrt()
.domain([0,maxPop])
.range([0,12])

const maxCases = d3.max(cases.map(d => d3.max(d[1], e => e.value)));

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

let annCircle = svg
.append('circle')
.attr('fill', 'none')
.attr('stroke', 'black')
.attr('stroke-width', 2)

let annText = svg
.append('text')
.attr('class', 'gv-annotation-text')


let ticks = [1, 10, 100, 1000];

let scaleX = svg.selectAll('text')
.data(ticks)
.enter()
.append('text')
.attr('class', 'gv-tick')
.attr('transform', d => `translate(${xScale(d)},${height/2})`)
.text(d => d)

const makeChart = () => {

	const simulation = d3.forceSimulation()
	.nodes(cases)
	.force( 'x', d3.forceX ( d => {

		let match = d[1].find( o => o.date === currentDate );

		if(match)
		{
			return xScale(match.value) + d.r
		}


	}).strength(.3) )
	.force("y", d3.forceY(d => height/2 - d.r).strength(0.05))
	.force( 'collide', d3.forceCollide().radius(d => {
		if(d.r)return d.r + 1
		else return 4
	}).strength(strength) )
	.on('tick', (d,i) => {

		context.clearRect(0, 0, width, height);

		simulation.nodes().forEach(d => {
			context.beginPath();
			context.fillStyle = "#c70000";
			context.strokeStyle = "#333";
			context.arc(d.x, d.y, d.r, 0, Math.PI * 2);
			context.fill();
			context.stroke();
		})

	})


	annotations.map((d,i) => {

		let date = d.Date;
		let text = d.Annotation;

		d3.select('.scroll-text')
		.append('div')
		.attr('class', 'scroll-text__inner')
		.attr('id', `blob-${i}`)
		.html(
		`<div class="scroll-text__div">
			<p>${date}</p>
	    	<p>${text}</p>
	    </div>`
	    )

	})


	let currentBlob = 0;

	const callback = (i) => {
		console.log('app' + i)
		currentBlob = i
		
	}



	const scrolly = new ScrollyTeller({
        parent: document.querySelector("#scrolly-1"),
        triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
        triggerTopMobile: 0.75,
        transparentUntilActive: true,
        callback:callback
	})

	scrolly.gradual( p => {

	        const n = round(p * currentBlob)

	        console.log(n)

	        currentDate = annotationDates[currentBlob];

	        d3.select('.gv-date').html(dates[n])

	        if(!currentDate)currentDate = dates[dates.length-1]

	        simulation.alpha(restartAlpha).restart()

	        simulation.force('x').initialize(cases)
		})

	

	//console.log(scrolly.triggerTop)

	

	scrolly.watchScroll()
}
makeChart()
