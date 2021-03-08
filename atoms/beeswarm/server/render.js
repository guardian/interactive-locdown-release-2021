import mainHTML from "./atoms/beeswarm/server/templates/main.html!text"
import fs from 'fs'


const rawData = fs.readFileSync('shared/server/10CwYxzt1b_-MPf62nifbk3mpYJPrpoONTw1r5FDMnXM.json');
const data = JSON.parse(rawData);

const LAsRaw = data.sheets['LA-breakdown-cases'].map(d => d.areaName)
const LAsPopRaw = data.sheets['LA-breakdown-cases'].map(d => d.Population)

const LAs = Array.from(new Set(LAsRaw));
const LAsPopulation = Array.from(new Set(LAsPopRaw));

let cases = [];

LAs.map((d,i) => {

	let eachOne = data.sheets['LA-breakdown-cases'].filter(f => f.areaName === d);
	//let obj = eachOne.map(d => {return {date:new Date(d.date.split('/')[2], +d.date.split('/')[1] -1, d.date.split('/')[0]),value:+d.newCasesBySpecimenDateRollingRate + 1}})
	let obj = eachOne.map(d => {return {date:d.date,value:+d.newCasesBySpecimenDateRollingRate + 1}})
	cases.push([{la:d, pop:LAsPopulation[i]}, obj])



})

fs.writeFileSync('assets/cases.json', JSON.stringify(cases));

export async function render() {
    return mainHTML;
} 