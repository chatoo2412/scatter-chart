import axios from 'axios'
import axiosRetry from 'axios-retry'

axios.defaults.baseURL = process.env.CONFIG.api.baseUrl

axiosRetry(axios, { retries: Infinity })

/**
 * Get transactions from API server and store its endTime and responseTime.
 *
 * @param   {number}  to      - End time in unix timestamp.
 * @param   {number}  [from]  - Start time in unix timestamp.
 * @returns {Promise} Promise object represents endTimes and responseTimes.
 */
const get = async ({ to, from = (to - 60000) }) => {
	const { data: { TransactionData: transactions } } = await axios.get(
		'api/transaction/time',
		{ params: { domain_id: 7000, start_time: from, end_time: to } },
	)

	const coords = []

	for (let i = 0; i < transactions.length; i += 1) {
		coords.push([Number(transactions[i].endTime), transactions[i].responseTime])
	}

	return coords
}

export default { get }
