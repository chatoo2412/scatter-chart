/**
 * Default options.
 *
 * @default
 */
export default {
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
