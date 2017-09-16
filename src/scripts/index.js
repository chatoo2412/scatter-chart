import _ from 'lodash'

import Chart from '~/scripts/lib/Chart'
import { dummyData } from '~/scripts/model'

const canvasElement = document.querySelector('#canvas')
const chart = new Chart(canvasElement)

const draw = () => {
	const then = performance.now()

	chart.resizeCanvas()

	for (let i = 0; i < dummyData.length; i += 1) {
		chart.addDot({
			x: dummyData[i][0] * canvasElement.width,
			y: dummyData[i][1] * canvasElement.height,
		})
	}

	console.log(`${Math.round(performance.now() - then)}ms`)
}

window.addEventListener('load', draw)
window.addEventListener('resize', _.debounce(draw, 100)) // `debounce` is better than `throttle` or `rAF` in this case.
