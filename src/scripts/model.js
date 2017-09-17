import axios from 'axios'

axios.defaults.baseURL = config.axios.baseUrl

/**
 * Get transactions from API server.
 *
 * @param {object} options
 * @param {number} options.from - Unix timestamp
 * @param {number} options.to   - Unix timestamp
 */
const getTransactions = async ({ from, to }) => axios.get(`api/transaction/time?domain_id=7000&start_time=${from}&end_time=${to}`).TransactionData

const total = 200000

const dummyData = []

for (let i = 0; i < total; i += 1) {
	dummyData.push([Math.random(), Math.random()])
}

export { getTransactions, dummyData }
