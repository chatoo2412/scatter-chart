import _ from 'lodash-es'
import moment from 'moment'

import Chart from '~/scripts/lib/Chart'
import model from '~/scripts/model'

/**
 * Options.
 *
 * @type {number} target          - Total number of points.
 * @type {number} initGroupOf     - Group requests and draw at once when initiating.
 * 																	Enlarge for performance(optimize http requests),
 * 																	or reduce for immediacy.
 * @type {number} refreshInterval - Refresh interval of updates. (in milliseconds)
 * @type {number} resizeDelay     - Debounce delay when resizing the window. (in milliseconds)
 * 																	Set 0 to disable.
 */
const options = {
	target: 200000,
	initGroupOf: 6, // Maximum connections of Chrome.
	refreshInterval: 1000,
	resizeDelay: 0,
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

/**
 * Expose chart for debug.
 * This code will be eliminated from production bundle.
 */
if (process.env.NODE_ENV === 'development') {
	window.chart = chart
}

/**
 * Get and draw past transactions.
 */
const init = async () => {
	const from = moment(now).startOf('minute').valueOf()

	// Get from HH:mm:00.000 to HH:mm:ss.SSS(now).
	const coordsThisMinute = await model.get({ from, to: now })
	chart.addCoords(coordsThisMinute, now)

	let to = from

	// Get tranactions before HH:mm:00.000.
	while (chart.coords.length < options.target) {
		const promises = []
		const coords = []

		for (let i = 0; i < options.initGroupOf; i += 1) {
			promises.push(model.get({
				from: to - (60000 * (i + 1)),
				to: to - (60000 * i),
			}))
		}

		const responses = await Promise.all(promises) // eslint-disable-line no-await-in-loop

		for (let i = 0; i < responses.length; i += 1) {
			coords.unshift(...responses[i])
		}

		chart.addCoords(coords, to)

		to -= 60000 * options.initGroupOf
	}
}

/**
 * Get and draw transactions after last update.
 */
const update = async () => {
	let from = now
	let to = moment().valueOf()

	setInterval(async () => {
		const newCoords = await model.get({ from, to })
		chart.addCoords(newCoords, to)

		from = to
		to = moment().valueOf()
	}, options.refreshInterval)
}

/**
 * Synchronize the chart size on the window resize.
 */
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

/**
 * Change the maximum bound of y-axis.
 */
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
