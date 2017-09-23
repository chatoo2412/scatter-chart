import _ from 'lodash'
import moment from 'moment'

import Chart from '~/scripts/lib/Chart'
import model from '~/scripts/model'

const options = {
	target: 200000, // Total number of points.
	updateInterval: 1000, // Update interval in milliseconds.
	resizeDelay: 0, // Debounce delay in milliseconds when resizing the window. Set 0 to disable.
}

const now = moment().valueOf()

const canvasElement = document.getElementById('canvas')
const chart = new Chart(canvasElement, {
	target: options.target,
	xAxis: {
		min: 0,
		max: now,
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
	let from = moment(now).startOf('minute').valueOf()
	let to = now

	// Get from HH:mm:00.000 to HH:mm:ss.SSS.
	const newCoordsThisMinute = await model.get({ from, to })
	chart.addCoords(newCoordsThisMinute, to)

	while (chart.coords.length < options.target) {
		to = from
		from -= 60000

		const newCoords = await model.get({ from, to }) // eslint-disable-line no-await-in-loop
		chart.addCoords(newCoords, to)
	}
}

const update = async () => {
	let from = now
	let to = moment().valueOf()

	setInterval(async () => {
		from = to
		to = moment().valueOf()

		const newCoords = await model.get({ from, to })
		chart.addCoords(newCoords, to)
	}, options.updateInterval)
}

const resizeChart = () => {
	chart.resize({
		width: window.innerWidth,
		height: window.innerHeight,
	})
}

let optimizedResize

if (options.resizeDelay) {
	optimizedResize = _.debounce(resizeChart, options.resizeDelay)
} else {
	let isBusy = false

	optimizedResize = () => {
		if (isBusy) { return }

		isBusy = true

		requestAnimationFrame(() => {
			resizeChart()

			isBusy = false
		})
	}
}

const setYMax = (event) => {
	switch (event.key) { // CAUTION: `KeyboardEvent.key` is non-standard at this moment.
		case 'ArrowUp':
			chart.changeYMaxInSteps(1)
			break

		case 'ArrowDown':
			chart.changeYMaxInSteps(-1)
			break

		default:
	}
}

window.addEventListener('load', init)
window.addEventListener('load', update)
window.addEventListener('resize', optimizedResize)
window.addEventListener('keydown', setYMax)
