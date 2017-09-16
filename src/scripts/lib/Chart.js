import _ from 'lodash'

/**
 * Default options.
 *
 * @constant
 * @default
 * @type     {object}
 * @property {number} size - Dot size in pixel.
 */
const defaults = {
	size: 1,
}

const _options = new WeakMap()

/**
 * Scatter chart.
 *
 * @class
 */
class Chart {
	/**
	 * @param {element} canvas  - A canvas element.
	 * @param {object}  options - See the constant `defaults`.
	 */
	constructor(canvasElement, options) {
		this.canvas = canvasElement
		this.context = canvasElement.getContext('2d')

		// Normalize the options.
		const assigned = _.defaultsDeep(options, defaults)
		assigned.size = Math.round(assigned.size * window.devicePixelRatio)
		_options.set(this, assigned)
	}

	/**
	 * Resize and clear the canvas.
	 */
	resizeCanvas() {
		this.canvas.width = Math.round(window.innerWidth * window.devicePixelRatio)
		this.canvas.height = Math.round(window.innerHeight * window.devicePixelRatio)
	}

	/**
	 * Add a dot to the canvas.
	 *
	 * @param {object} coordinates
	 * @param {number} coordinates.x
	 * @param {number} coordinates.y
	 */
	addDot({ x, y }) {
		const { size } = _options.get(this)

		this.context.fillRect(
			Math.round(x),
			Math.round(y),
			size,
			size,
		)
	}
}

export default Chart
