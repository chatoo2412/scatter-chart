/**
 * Stores objects using localStorage.
 */
const storage = {
	set: (key, object) => {
		try {
			return localStorage.setItem(key, JSON.stringify(object))
		} catch (error) {
			// alert(error)

			throw error
		}
	},
	get: key => JSON.parse(localStorage.getItem(key)),
}

export default storage
