// import _ from 'lodash'
import moment from 'moment'

import Chart from '~/scripts/lib/Chart'
import model from '~/scripts/model'

const target = 20000 // Total number of points.

const now = moment()

const canvasElement = document.getElementById('canvas')
const chart = new Chart(canvasElement, {
	target,
	xAxis: {
		min: 0,
		max: now.valueOf(),
		labelize: value => moment(value).format('HH:mm:ss.SSS'),
	},
	yAxis: {
		min: 0,
		max: 5000,
		step: 1000,
		labelize: value => `${value.toLocaleString()}ms`,
	},
})

if (process.env.NODE_ENV === 'development') {
	window.chart = chart
}

const init = async () => {
	const from = now.clone().startOf('minute')
	const to = now.clone()

	// Get from HH:mm:00.000 to HH:mm:ss.SSS.
	chart.addCoords(await model.get({ to: to.valueOf(), from: from.valueOf() }), true)

	from.subtract(1, 'minute')
	to.startOf('minute')

	while (chart.coords.length < target) {
		chart.addCoords(await model.get({ to: to.valueOf(), from: from.valueOf() }), true) // eslint-disable-line no-await-in-loop

		from.subtract(1, 'minute')
		to.subtract(1, 'minute')
	}
}

const setYMax = (event) => {
	switch (event.key) { // CAUTION: KeyboardEvent.key is nonstandard currently.
		case 'ArrowUp':
			chart.changeYMaxInSteps(1)
			break

		case 'ArrowDown':
			chart.changeYMaxInSteps(-1)
			break

		default:
	}
}

window.addEventListener('load', event => init())
window.addEventListener('keydown', setYMax)
