import axios from 'axios'
import axiosRetry from 'axios-retry'
import idbKeyval from 'idb-keyval'

axios.defaults.baseURL = process.env.CONFIG.api.baseUrl

axiosRetry(axios, { retries: Infinity })

/**
 * Expose IndexedDB for debug.
 * This code will be eliminated from production bundle.
 */
if (process.env.NODE_ENV === 'development') {
	window.sc = window.sc || {}
	window.sc.idbKeyval = idbKeyval
}

/**
 * Gets transactions from the local cache.
 *
 * @param {string} key
 */
const getFromCache = async key => idbKeyval.get(key)

/**
 * Get transactions from the API server and store its endTime and responseTime.
 *
 * @param
 */
const getFromApi = async ({ to, from }) => {
	const { data: { TransactionData: transactions } } = await axios.get(
		'api/transaction/time',
		{ params: { domain_id: 7000, start_time: from, end_time: to } },
	)

	const coords = []

	for (let i = 0; i < transactions.length; i += 1) {
		coords.push([Number(transactions[i].endTime), transactions[i].responseTime])
	}

	// Store only if the request is for a full minute.
	if (to === from + 60000) {
		await idbKeyval.set(to, coords)
	}

	return coords
}

/**
 * Get transactions from the local cache or from API if not exists.
 *
 * @param  {Object}  range
 * @param  {number}  range.from - Start time. (in unix timestamp)
 * @param  {number}  range.to   - End time. (in unix timestamp)
 * @return {Promise} Promise represents endTimes and responseTimes.
 */
const get = async ({ from, to }) => await getFromCache(to) || getFromApi({ from, to })

export default { get }
