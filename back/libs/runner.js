module.exports = {
    /**
     * Run command till success but not more then times times.
     * @param {*} action Action
     * @param {*} times Times
     * @returns 
     */
	async safe_run(action, times = 10) {
		while (true){
			try {
				return await action();
			} catch (ex) {
                console.error('Error', ex.message, 'Try again', times)
				times--;
				if (times < 1) throw ex;
			}
		}
	},
};
