const runner_lib = require("../libs/runner");

module.exports = class {
	constructor(dao, web3) {
		this.dao = dao;
		this.web3 = web3;

		this.votes = {};
	}

	async start() {
		this.attach_events();

		let events = await this.dao.getPastEvents("allevents", { fromBlock: "earliest" });
		let oEvents = events.filter((x) => x.event == "Open");
		let cEvents = events.filter((x) => x.event == "Close");

		let o_hash = oEvents.reduce((s, c) => ({ ...s, [c.returnValues.vote_id]: true }), {});
		o_hash = cEvents.reduce((s, c) => ({ ...s, [c.returnValues.vote_id]: false }), o_hash);
		let opened = Object.keys(o_hash).filter((x) => o_hash[x]);
		console.log(opened);

		for (let k in opened) {
			console.log(k);
			this.handle_opened_vote(k);
		}

		// opened.map(x => await this.dao.methods.history(ocEvents[0].returnValues.vote_id).call())

		// console.log(proposal, ocEvents)
		// console.log(proposal)

		// // Auction clean or closed  start it.
		// if (ocevents.length == 0 || ocevents.slice(-1)[0].event == "Close")
		// 	this.create_round();
		// // Auction opened check block time to know can we close it or not.
		// else //if (ocevents.slice(-1)[0].event == "Open") {
		//     this.handle_open_event(ocevents.slice(-1)[0])
	}

	attach_events() {
		this.dao.events.Open({}, async (err, event) => {
			console.log("Dao.Open.event", event.returnValues);
			this.handle_opened_vote(event.returnValues.vote_id);
		});

		this.dao.events.Close({}, (err, event) => {
			console.log("Dao.Close.event", event.returnValues);
			this.votes[event.returnValues.vote_id] = null;
		});

		this.dao.events.Vote({}, (err, event) => {
			console.log("Dao.Vote.event", event.returnValues);
		});
	}

	async handle_opened_vote(vote_id) {
		let block = await this.web3.eth.getBlock("latest");
		let cur_time = block.timestamp;

		let voting = await this.dao.methods.history(vote_id).call();
		let end_time = voting.end_at;

		// let end_time = event.returnValues.end_at;
		console.log("cur_time>end_time", cur_time, end_time, cur_time > end_time);
		if (cur_time > end_time) {
			this.close_votind(vote_id);
		} else {
			console.log(`Close voting ${vote_id} after ${end_time - cur_time}s`);
			setTimeout(() => this.close_votind(vote_id), (end_time - cur_time) * 1000);
		}
	}

	async create_round(token_url) {
		console.log("Creating new Auction round...", token_url);
		token_url = token_url && await runner_lib.safe_run(() => this.tokenHelper.create_token(), 10);
		console.log("token_url", token_url);
		try {
			await this.auction.methods.createRound(token_url).send({ from: this.web3.defaultAccount })
		} catch(ex) {
			if (ex.message != 'Auction in progress'){
				setTimeout(() => this.create_round(token_url), 10 * 1000)
			}
			console.log(ex)
		}
		console.log("Created");
	}

	async close_votind(vote_id) {
		console.log(`Closing voting ${vote_id}...`);

		let voting = await runner_lib.safe_run(() => this.dao.methods.history(vote_id).call());
		console.log("voting.closed", voting.closed);
		if (voting.closed) return;

		let can_close = await runner_lib.safe_run(() => this.dao.methods.canClose(vote_id).call());

		console.log(`can_close ${vote_id}`, can_close);

		if (can_close)
			try {
				return await this.dao.methods.close(vote_id).send({ from: this.web3.defaultAccount });
			} catch (ex) {
				console.log(ex);
			}
		setTimeout(() => this.handle_opened_vote(vote_id), 10 * 1000);
	}
};
