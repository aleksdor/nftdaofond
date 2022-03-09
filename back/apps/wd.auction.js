const runner_lib = require("../libs/runner");

module.exports = class {
	constructor(auction, tokenHelper, web3) {
		this.auction = auction;
		this.tokenHelper = tokenHelper;
		this.web3 = web3;
	}

	async start() {
		this.attach_events();

		let events = await this.auction.getPastEvents("allevents", { fromBlock: "earliest" });
		let ocevents = events.filter((x) => x.event == "Open" || x.event == "Close");

		// Auction clean or closed  start it.
		if (ocevents.length == 0 || ocevents.slice(-1)[0].event == "Close") this.create_round();
		// Auction opened check block time to know can we close it or not.
		//if (ocevents.slice(-1)[0].event == "Open") {
		else this.handle_opened_auction(ocevents.slice(-1)[0].returnValues.round);
	}

	attach_events() {
		this.auction.events.Open({fromBlock: "earliest"}, async (err, event) => {
			console.log("Auction.Open.event", event.returnValues);
			this.handle_opened_auction(event.returnValues.round);
		});

		this.auction.events.Close({fromBlock: "earliest"}, (err, event) => {
			console.log("Auction.Close.event", event.returnValues);
			this.create_round();
		});

		this.auction.events.Bid({fromBlock: "earliest"}, (err, event) => {
			console.log("Auction.Bid.event", event.returnValues);
		});
	}

	async handle_opened_auction(id) {
		let block = await this.web3.eth.getBlock("latest");
		let cur_time = block.timestamp;

		let auction = await this.auction.methods.history(id).call();
		let end_time = auction.end_at;

		console.log("cur_time>end_time", cur_time, end_time, cur_time > end_time);
		if (cur_time > end_time) {
			this.close_round(id);
		} else {
			console.log(`Close auction ${id} after ${end_time - cur_time}s`);
			setTimeout(() => this.close_round(id), (end_time - cur_time) * 1000);
		}
	}

	async create_round() {
		console.log("Creating new Auction round...");
		let token_url = await runner_lib.safe_run(() => this.tokenHelper.create_token(), 10);
		console.log("token_url", token_url);
		await runner_lib.safe_run(() =>
			this.auction.methods.createRound(token_url).send({ from: this.web3.defaultAccount })
		);
		console.log("Created");
	}

	async close_round(id) {
		try{
		console.log("Closing auction ...");

		let auction = await runner_lib.safe_run(() => this.auction.methods.history(id).call());
		console.log("auction.closed", auction.closed, auction);
		if (auction.closed) return;

		let can_close = await runner_lib.safe_run(() => this.auction.methods.canClose().call());
		console.log("can_close", can_close);

		if (can_close)
			try {
				return await this.auction.methods.close().send({ from: this.web3.defaultAccount });
			} catch (ex) {
				console.log(ex);
			}
		}
		catch(ex){
			console.error('close_round', ex)
		}
		setTimeout(() => this.handle_opened_auction(id), 10 * 1000);
	}
};
