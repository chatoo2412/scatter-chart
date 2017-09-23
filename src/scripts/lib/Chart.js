import _ from 'lodash-es'

/**
 * Default options.
 */
const defaults = {
	target: 200000,
	canvas: {
		width: window.innerWidth,
		height: window.innerHeight,
	},
	plotArea: {
		top: 30,
		bottom: 30,
		left: 70,
		right: 40,
		lineWidth: 1,
		lineColor: [0, 0, 0, 255],
	},
	xAxis: {
		min: 0,
		max: 1,
		labelize: value => value,
	},
	yAxis: {
		min: 0,
		max: 1,
		step: 0.1,
		labelize: value => value,
	},
	label: {
		margin: 4,
		font: '12px sans-serif',
		color: [0, 0, 0, 255],
	},
	point: {
		color: [255, 0, 0, 255],
	},
}

const _private = new WeakMap() // eslint-disable-line no-underscore-dangle

/**
 * Scatter chart.
 *
 * @class
 */
class Chart {
	/**
	 * @param {Element} canvasElement   - A canvas element.
	 * @param {Object}  [customOptions] - See the constant `defaults`.
	 */
	constructor(canvasElement, customOptions = {}) {
		this.coords = []

		this.canvas = canvasElement
		this.context = canvasElement.getContext('2d')

		// Set options.
		const options = _.defaultsDeep(customOptions, defaults)
		options.xAxis.distance = options.xAxis.max - options.xAxis.min
		options.yAxis.distance = options.yAxis.max - options.yAxis.min

		// Create an off-screen canvas of the plot area.
		const plot = {}
		plot.canvas = document.createElement('canvas')
		plot.context = plot.canvas.getContext('2d')

		_private.set(this, { options, plot })

		// Initiate the canvas.
		this.resize({
			width: options.canvas.width,
			height: options.canvas.height,
		})
	}

	/**
	 * Resize, clear and redraw the canvas.
	 */
	resize({ width, height }) {
		const { options, plot } = _private.get(this)

		const pixelRatio = window.devicePixelRatio

		// Set canvas size.
		this.canvas.width = width * pixelRatio
		this.canvas.height = height * pixelRatio
		this.context.scale(pixelRatio, pixelRatio)
		this.context.imageSmoothingEnabled = false

		// Set plot area size.
		plot.canvas.width = width - options.plotArea.left - options.plotArea.right
		plot.canvas.height = height - options.plotArea.top - options.plotArea.bottom

		// Draw plot area border.
		this.context.lineWidth = options.plotArea.lineWidth
		this.context.strokeStyle = `rgba(${options.plotArea.lineColor.join(',')})`
		this.context.strokeRect(// Align the stroke to outside.
			options.plotArea.left - (options.plotArea.lineWidth / 2),
			options.plotArea.top - (options.plotArea.lineWidth / 2),
			plot.canvas.width + options.plotArea.lineWidth,
			plot.canvas.height + options.plotArea.lineWidth,
		)

		this.changeYMaxInSteps(0) // Draw y-axis' labels.
		this.updateCounter()
	}

	/**
	 * Change the maximum bound of y-axis.
	 *
	 * @param {number} steps - The amount of change.
	 */
	changeYMaxInSteps(steps) {
		const { options, plot } = _private.get(this)

		const newValue = options.yAxis.max + (options.yAxis.step * steps)

		if (newValue < options.yAxis.step) {
			return
		}

		// Store values.
		options.yAxis.max = newValue
		options.yAxis.distance = newValue - options.yAxis.min

		// Clear and redraw labels.
		this.context.clearRect(
			0,
			0,
			options.plotArea.left - options.plotArea.lineWidth,
			options.plotArea.top + plot.canvas.height + options.plotArea.lineWidth,
		)

		this.context.textAlign = 'right'
		this.context.textBaseline = 'middle'
		this.context.font = options.label.font
		this.context.fillStyle = `rgba(${options.label.color.join(',')})`

		this.context.fillText(
			options.yAxis.labelize(options.yAxis.max),
			options.plotArea.left - options.label.margin,
			options.plotArea.top,
		)

		this.context.textBaseline = 'bottom'

		this.context.fillText(
			options.yAxis.labelize(options.yAxis.min),
			options.plotArea.left - options.label.margin,
			options.plotArea.top + plot.canvas.height,
		)

		this.drawPoints()
	}

	/**
	 * Set the bounds of x-axis.
	 */
	setXBounds() {
		const { options, plot } = _private.get(this)

		// Clear and redraw labels.
		this.context.clearRect(
			0,
			options.plotArea.top + plot.canvas.height + options.plotArea.lineWidth,
			options.plotArea.left + plot.canvas.width + options.plotArea.right,
			options.plotArea.bottom,
		)

		this.context.textAlign = 'center'
		this.context.textBaseline = 'top'
		this.context.font = options.label.font
		this.context.fillStyle = `rgba(${options.label.color.join(',')})`

		this.context.fillText(
			options.xAxis.labelize(options.xAxis.min),
			options.plotArea.left,
			(options.plotArea.top + plot.canvas.height) + options.label.margin,
		)

		this.context.fillText(
			options.xAxis.labelize(options.xAxis.max),
			options.plotArea.left + plot.canvas.width,
			(options.plotArea.top + plot.canvas.height) + options.label.margin,
		)
	}

	/**
	 * Append or prepend new coordinates.
	 * `this.coords` should be sorted in ascending order by the x-coordinate.
	 *
	 * @param {coord[]} newCoords - An array of coordinates.
	 * @param {number}  coord[0]  - The x-coordinate.
	 * @param {number}  coord[1]  - The y-coordinate.
	 * @param {number}  maxX      - The Maximum value of x-axis.
	 */
	addCoords(newCoords, maxX) {
		const { options } = _private.get(this)

		const isNew = maxX > options.xAxis.max

		if (newCoords.length) {
			this.coords[isNew ? 'push' : 'unshift'](...newCoords) // CAUTION: Stack overflow may occur.

			const overflows = this.coords.length - options.target

			if (overflows > 0) {
				this.coords.splice(0, overflows)
			}

			options.xAxis.min = this.coords[0][0] // eslint-disable-line prefer-destructuring
		}

		if (isNew) { options.xAxis.max = maxX }
		options.xAxis.distance = options.xAxis.max - options.xAxis.min

		this.drawPoints()
		this.updateCounter()
	}

	/**
	 * Draw points of `this.coords`.
	 */
	drawPoints() {
		const { options, plot } = _private.get(this)

		const plotImageData = plot.context.createImageData(plot.canvas.width, plot.canvas.height)

		for (let i = 0; i < this.coords.length; i += 1) {
			// Normalize in interval [0, 1]
			const normalizedX = (this.coords[i][0] - options.xAxis.min) / options.xAxis.distance
			const normalizedY = Number(this.coords[i][1] >= options.yAxis.max)
				|| (this.coords[i][1] - options.yAxis.min) / options.yAxis.distance

			// Coordinates in pixel.
			const x = Math.round(normalizedX * (plot.canvas.width - 1))
			const y = Math.round((1 - normalizedY) * (plot.canvas.height - 1))

			const index = (x + (y * plot.canvas.width)) * 4

			plotImageData.data.set(options.point.color, index)
		}

		plot.context.putImageData(plotImageData, 0, 0)

		this.context.clearRect(
			options.plotArea.left,
			options.plotArea.top,
			plot.canvas.width,
			plot.canvas.height,
		)

		this.setXBounds()
		this.context.drawImage(plot.canvas, options.plotArea.left, options.plotArea.top)
	}

	/**
	 * Update the counter.
	 */
	updateCounter() {
		const { options, plot } = _private.get(this)

		this.context.clearRect(
			options.plotArea.left - options.plotArea.lineWidth,
			0,
			options.plotArea.lineWidth + plot.canvas.width + options.plotArea.lineWidth,
			options.plotArea.top - options.plotArea.lineWidth,
		)

		this.context.textAlign = 'right'
		this.context.textBaseline = 'bottom'
		this.context.font = options.label.font
		this.context.fillStyle = `rgba(${options.label.color.join(',')})`

		this.context.fillText(
			`count: ${this.coords.length.toLocaleString()}`,
			options.plotArea.left + plot.canvas.width,
			options.plotArea.top - options.label.margin,
		)
	}
}

export default Chart
