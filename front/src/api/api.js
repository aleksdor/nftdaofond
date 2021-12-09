import Web3 from 'web3';
import Web3Modal from 'web3modal';
import MewConnect from '@myetherwallet/mewconnect-web-client';
import ethProvider from 'eth-provider';
import Authereum from 'authereum';
import logoETH from '../assets/img/eth.png';
import logoBSC from '../assets/img/binance.png';
import {
	rarinonDAOAddress,
	rarinonNFTAddress,
	rarinonAuctionAddress,
	networkParameters,
} from '../config/default.json';
import { abi as rarinonNFTAbi, bytecode as rarinonNFTBytecode } from '../config/RarinonNFT.json';
import { abi as rarinonDAOAbi, bytecode as rarinonDAOBytecode } from '../config/RarinonDAO.json';
import { abi as rarinonAuctionAbi, bytecode as rarinonAuctionBytecode } from '../config/RarinonAuction.json';
class Bia {
	constructor() {
		this.connected = false;
		this.provider = '';
		this.web3 = '';
		this.accountAddress = '';
		this.web3Infura = '';
		this.rarinonNFTContractRpc = '';
		this.kickLotteryContractRpc = '';
		this.contract = '';
		this.rarinonNFTContract = '';
		this.kickLotteryContract = '';
		this.chainId = '';
		this.chainLogo = '';
		this.networkName = '';
		this.appChainId = '';
		this.canChangeNetwork = false;
		this.D_PERCENT = 10;
		this.B_PERCENT = 10;
	}

	async connectRpc() {
		this.web3Infura = new Web3(networkParameters.rpc)
		this.rarinonNFTContractRpc = await this.getRarinonNFTContract(this.web3Infura)
		// this.kickLotteryContractRpc = await this.getKickLotteryContract(
		// 	this.web3Infura
		// );
		this.connectedRpc = true;
	}

	getChainLogo(chainId) {
		switch (chainId) {
			case 4:
				return logoETH;
			case 97:
				return logoBSC;
			case 1:
				return logoETH;
			case 56:
				return logoBSC;
			default:
				return '';
		}
	}

	// async getKickLotteryContract(web3) {
	// 	if (kickLotteryAddress) {
	// 		const contract = await new web3.eth.Contract(
	// 			kickLotteryAbi,
	// 			kickLotteryAddress
	// 		);
	// 		return contract;
	// 	} else {
	// 		return undefined;
	// 	}
	// }

	async getRarinonNFTContract(web3) {
		if (rarinonNFTAddress) {
			const nft = await new web3.eth.Contract(rarinonNFTAbi, rarinonNFTAddress)
			const dao = await new web3.eth.Contract(rarinonDAOAbi, rarinonDAOAddress)
			const auction = await new web3.eth.Contract(rarinonAuctionAbi, rarinonAuctionAddress)
			console.log(nft.methods)
			console.log(dao.methods)
			console.log(auction.methods)
			return nft;
		} else {
			return undefined;
		}
	}

	// async approve(amount, callback = () => { }) {
	// 	if (this.connected) {
	// 		await this.rarinonNFTContract.methods
	// 			.approve(kickLotteryAddress, amount)
	// 			.send({ from: this.accountAddress }, (err, result) => {
	// 				callback(result);
	// 			});
	// 	} else {
	// 		this.connect(() => {
	// 			this.approve(amount);
	// 		});
	// 	}
	// }

	checkRoundAdmin() {
		return new Promise((resolve, reject) => {
			if (this.connected) {
				this.kickLotteryContract.methods.isRoundFinished().call((err, res) => {
					if (err) reject(err)
					if (res) {
						this.getRoundNumber().then(async (roundNumber) => {
							try {
								const history = await this.kickLotteryContract.methods.History(roundNumber).call()
								const blockNumber = history.EndBlock
								const block = await this.web3.eth.getBlock(blockNumber)
								const result = await this.kickLotteryContract.methods.checkRoundAdmin(block.hash).send({ from: this.accountAddress })
								resolve(result)
							} catch (e) {
								reject(e)
							}
						})
					} else {
						resolve(false)
					}
				})
			} else {
				this.connect(() => {
					this.checkRoundAdmin();
				});
			}
		})
	}
	isTooFar() {
		return new Promise((resolve, reject) => {
			this.getRoundNumber().then(async (roundNumber) => {
				try {
					const roundStatus = await this.kickLotteryContractRpc.methods.isRoundFinished().call()
					if (!roundStatus) {
						resolve(true)
					}
					const history = await this.kickLotteryContractRpc.methods.History(roundNumber).call()
					const currentBlockNumber = await this.web3Infura.eth.getBlockNumber()
					const roundBlockNumber = Number(history.EndBlock)
					const distance = Math.abs(roundBlockNumber - currentBlockNumber)
					if (distance <= 255) {
						resolve(true)
					} else {
						resolve(false)
					}
				} catch (e) {
					reject(e)
				}
			}).catch((e) => reject(e))
		})
	}
	checkRound() {
		return new Promise((resolve, reject) => {
			this.getRoundNumber().then(async (roundNumber) => {
				try {
					const history = await this.kickLotteryContract.methods.History(roundNumber).call()
					const currentBlockNumber = await this.web3.eth.getBlockNumber()
					const roundBlockNumber = Number(history.EndBlock)
					const roundStatus = await this.kickLotteryContract.methods.isRoundFinished().call()
					// const roundStatus = roundBlockNumber - currentBlockNumber <= 0 ? true : false
					const distance = Math.abs(roundBlockNumber - currentBlockNumber)
					console.log(roundBlockNumber)
					console.log(currentBlockNumber)
					if (roundStatus && distance <= 255) {
						const res = await this.kickLotteryContract.methods.checkRound().send({ from: this.accountAddress })
						console.log(res)
						resolve({ message: 'Check round complete!', status: 'success' })
					} else {
						console.log(distance)
						console.log(roundStatus)
						if (!roundStatus) resolve({ message: 'Round is not finished!', status: 'error' })
						if (distance > 255) resolve({ message: 'Too far from end block!', status: 'error' })
					}
				} catch (e) {
					reject(e)
				}
			}).catch((err) => reject(err))
		})
	}

	// play(amount) {
	// 	return new Promise((resolve, reject) => {
	// 		this.checkRound().then(async (res) => {
	// 			console.log(res ? 'Раунд сменился принудительно' : "Раунд не требует смены")
	// 			this.rarinonNFTContract.methods.transferAndCall(kickLotteryAddress, amount)
	// 				.send({ from: this.accountAddress }, (err, res) => {
	// 					if (err) reject(err)
	// 					resolve(res)
	// 				});
	// 		}).catch((err) => reject(err))
	// 	})
	// }

	// getAllowance() {
	// 	return new Promise((resolve, reject) => {
	// 		if (this.connected) {
	// 			this.rarinonNFTContractRpc.methods
	// 				.allowance(kickLotteryAddress, this.accountAddress)
	// 				.call((err, res) => {
	// 					if (err) {
	// 						reject(err)
	// 					}
	// 					resolve(Number(res))
	// 				})
	// 		} else {
	// 			resolve(0)
	// 		}
	// 	});
	// }

	getJackpot() {
		return new Promise((resolve, reject) => {
			if (this.connectedRpc) {
				this.kickLotteryContractRpc.methods.Jackpot().call((err, res) => {
					if (err) {
						reject(err);
					}
					resolve(Number(res));
				});
			} else {
				resolve(0);
			}
		});
	}

	getRoundNumber() {
		return new Promise((resolve, reject) => {
			if (this.connectedRpc) {
				this.kickLotteryContractRpc.methods.RoundNumber().call((err, res) => {
					if (err) {
						reject(err);
					}
					resolve(Number(res));
				});
			} else {
				resolve(0);
			}
		});
	}

	getDistribution(history, roundNumber, burnPercent, payPercent) {
		return new Promise((resolve, reject) => {
			try {
				this.kickLotteryContractRpc.methods.roundWinners(roundNumber === 0 ? 0 : roundNumber - 1).call((err, winners) => {
					const numwinners = winners ? (winners.filter((winner) => winner)).length : 0
					let burned = 0
					let given = 0
					let leftToNextRound = 0
					if (numwinners > 0) {
						burned = history.Jackpot * burnPercent / 100
						given = history.Jackpot * payPercent / 100
						leftToNextRound = history.Jackpot * (100 - payPercent - burnPercent) / 100
					} else {
						leftToNextRound = history.Jackpot
					}
					resolve({ burned, given, leftToNextRound, numwinners })
				})
			} catch (e) {
				reject(e)
			}
		})
	}

	getWinners(history, roundNumber, payPercent) {
		return new Promise((resolve, reject) => {
			this.kickLotteryContractRpc.methods.roundMembers(roundNumber).call(async (err, members) => {
				if (err) reject(err)
				try {
					// members = ['address']
					// participants = [true]
					const participants = await this.kickLotteryContractRpc.methods.roundWinners(roundNumber).call()
					const winners = participants.map((participant, index) => {
						if (participants) return index
					})
					const result = winners.map((winner) => ({ address: members[winner], amount: history.Jackpot * payPercent / winners.length / 100 }))
					resolve(result)
				} catch (e) {
					reject(e)
				}
			})
		})
	}

	fillParticipantsArray(members, bids, jackpot) {
		return new Promise((resolve, reject) => {
			try {
				const result = []
				for (let i = 0; i < members.length; i++) {
					const chance = bids[i] / jackpot
					result.push({ address: members[i], bid: bids[i], chance })
				}
				resolve(result)
			} catch (e) {
				reject(e)
			}
		})
	}

	getParticipants(history, roundNumber) {
		return new Promise((resolve, reject) => {
			try {
				roundNumber = roundNumber === 0 ? 0 : roundNumber - 1
				const jackpot = history.Jackpot
				this.kickLotteryContractRpc.methods.roundMembers(roundNumber).call((err, res) => {
					if (err) reject(err)
					const members = res ? res : []
					let result = []
					if (members.length) {
						this.kickLotteryContractRpc.methods.roundBalances(roundNumber).call(async (err, res) => {
							if (err) reject(err)
							const bids = res ? res : []
							if (bids.length) {
								result = await this.fillParticipantsArray(members, bids, jackpot)
								resolve(result)
							}
						})
					} else {
						resolve(result)
					}
				})
			} catch (e) {
				reject(e)
			}
		})
	}

	getCompletedRoundHistory(roundNumber) {
		return new Promise((resolve, reject) => {
			if (this.connectedRpc) {
				this.kickLotteryContractRpc.methods.History(roundNumber).call(async (err, history) => {
					if (err) reject(err)
					try {
						const burnPercent = await this.kickLotteryContractRpc.methods.burnPercent().call()
						const payPercent = await this.kickLotteryContractRpc.methods.payPercent().call()
						const endDate = history.EndDate
						const { burned, given, leftToNextRound, numwinners } = await this.getDistribution(history, roundNumber, burnPercent, payPercent)
						const winners = await this.getWinners(history, roundNumber, payPercent)
						const participants = await this.getParticipants(history, roundNumber)
						resolve({ endDate, roundNumber, burned, given, leftToNextRound, numwinners, winners, participants })
					} catch (e) {
						reject(e)
					}
				});
			} else {
				resolve({});
			}
		});
	}

	getClientBetHistory() {
		return new Promise((resolve, reject) => {
			if (this.connected) {
				this.kickLotteryContract.methods.RoundNumber().call((err, res) => {
					if (err) reject(err)
					const promises = []
					for (let roundNumber = 0; roundNumber < Number(res) || roundNumber === 0; roundNumber++) {
						promises.push(
							new Promise((resolve, reject) => {
								this.kickLotteryContract.methods.History(roundNumber).call(async (err, history) => {
									if (err) reject(err)
									try {
										const payPercent = await this.kickLotteryContract.methods.payPercent().call()
										const currentBlockNumber = await this.web3Infura.eth.getBlockNumber()
										const roundStatus = history.EndBlock < currentBlockNumber ? true : false
										const members = await this.kickLotteryContract.methods.roundMembers(roundNumber).call()
										const balances = await this.kickLotteryContract.methods.roundBalances(roundNumber).call()
										const winners = await this.kickLotteryContract.methods.roundWinners(roundNumber).call()
										const numwinners = winners.filter((winner) => winner)
										const me = members.indexOf(this.accountAddress)
										const bet = me >= 0 ? balances[me] : 0
										const iswin = me >= 0 ? winners[me] : false
										const prize = iswin ? history.Jackpot * payPercent / 100 / numwinners.length : 0
										resolve({ roundNumber, roundStatus, bet, iswin, prize })
									} catch (e) {
										reject(e)
									}
								})
							})
						)
					}
					Promise.all(promises).then((res, err) => {
						if (err) reject(err)
						resolve(res)
					})
				})
			} else {
				this.connect(() => {
					this.getClientBetHistory();
				});
			}
		})
	}

	getParticipantsArray() {
		return new Promise((resolve, reject) => {
			if (this.connectedRpc) {
				this.kickLotteryContractRpc.methods.RoundNumber().call((err, res) => {
					if (err) reject(err)
					const promises = []
					for (let roundNumber = 0; roundNumber < Number(res); roundNumber++) {
						promises.push(
							new Promise((resolve, reject) => {
								this.kickLotteryContractRpc.methods.History(roundNumber).call((err, res) => {
									if (err) {
										reject(err);
									}
									resolve(res)
								})
							})
						)
					}
					Promise.all(promises).then((res, err) => {
						if (err) reject(err)
						resolve(res)
					})
				})
			}
		});
	}

	getHistoryArray() {
		return new Promise((resolve, reject) => {
			if (this.connectedRpc) {
				this.kickLotteryContractRpc.methods.RoundNumber().call((err, res) => {
					if (err) reject(err)
					const promises = []
					for (let roundNumber = 0; roundNumber < Number(res) || roundNumber === 0; roundNumber++) {
						promises.push(
							new Promise((resolve, reject) => {
								this.kickLotteryContractRpc.methods.History(roundNumber).call((err, history) => {
									if (err) reject(err)
									this.kickLotteryContractRpc.methods.BurnedTotal().call((err, burnedTotal) => {
										if (err) reject(err)
										this.kickLotteryContractRpc.methods.roundWinners(roundNumber).call((err, res) => {
											if (err) reject(err)
											const winners = res.filter((winner) => winner)
											const numwinners = winners.length
											resolve({ roundNumber, endDate: history.EndDate, jackpot: history.Jackpot, burnedTotal, numwinners })
										})
									})
								})
							})
						)
					}
					Promise.all(promises).then((res, err) => {
						if (err) reject(err)
						resolve(res)
					})
				})
			}
		});
	}

	getWinnersArray() {
		return new Promise((resolve, reject) => {
			if (this.connectedRpc) {
				this.getHistoryArray().then((res) => {
					const winnersArray = res.filter((player) => player.IsWinner);
					resolve(winnersArray);
				}).catch((err) => reject(err));
			}
		});
	}

	getBestLottery() {
		return new Promise((resolve, reject) => {
			if (this.connectedRpc) {
				this
					.getHistoryArray()
					.then(async (res) => {
						let bestLottery = 0;
						let bestLotteryIndex = 0;
						for (let i = 0; i < res.length; i++) {
							if (Number(bestLottery) < Number(res[i].Jackpot)) {
								bestLottery = await res[i].Jackpot;
								bestLotteryIndex = i;
							}
						}
						resolve(res[bestLotteryIndex]);
					}).catch((err) => reject(err));
			}
		});
	}

	getCurrentRoundEndTimestamp() {
		return new Promise((resolve, reject) => {
			this.getRoundNumber().then(async (roundNumber) => {
				const history = await this.kickLotteryContractRpc.methods.History(roundNumber).call()
				const block = await this.web3Infura.eth.getBlock(history.EndBlock)
				resolve(block.timestamp)
			}).catch((e) => reject(e))
		})
	}

	getCurrentLottery() {
		return new Promise((resolve, reject) => {
			if (this.connectedRpc) {
				this.kickLotteryContractRpc.methods.Jackpot().call((err, jackpot) => {
					if (err) reject(err)
					this.kickLotteryContractRpc.methods.RoundNumber().call((err, roundNumber) => {
						if (err) reject(err)
						this.kickLotteryContractRpc.methods.History(roundNumber).call(async (err, history) => {
							if (err) reject(err)
							const roundBlockNumber = Number(history.EndBlock)
							const currentRoundBlock = await this.web3Infura.eth.getBlock(roundBlockNumber)
							const blockNumber = await this.web3Infura.eth.getBlockNumber()
							const currentBlock = await this.web3Infura.eth.getBlock(blockNumber)
							console.log(roundBlockNumber)
							console.log(currentRoundBlock)
							console.log(blockNumber)
							console.log(currentBlock)
							// const endBets = (currentBlock.timestamp - currentRoundBlock.timestamp) * -1
							const endBets = (blockNumber - roundBlockNumber) * -1
							const members = history.MembersCount
							resolve({ jackpot, endBets, members })
						})
					})
				})
			}
		});
	}

	async connect(callback = () => { }) {
		if (!this.connected) {
			const providerOptions = {
				mewconnect: {
					package: MewConnect,
					options: {
						infuraId: '1fa62a71dee94d9ebc1fc18e82207e55',
					},
				},
				frame: {
					package: ethProvider,
				},
				authereum: {
					package: Authereum,
				},
			};
			const web3Modal = new Web3Modal({
				cacheProvider: false,
				providerOptions,
				theme: 'dark',
			});
			web3Modal.clearCachedProvider();

			this.provider = await web3Modal.connect();
			this.web3 = new Web3(this.provider);
			this.web3.eth.net
				.isListening()
				.then(() => {
					this.web3.eth.getAccounts().then((e) => {
						this.accountAddress = e[0];
						this.web3.eth.getChainId().then(async (r) => {
							this.chainId = r;
							this.appChainId = r;
							this.connected = true;
							this.canChangeNetwork = true;
							this.chainLogo = this.getChainLogo(this.chainId);
							this.networkName = await this.web3.eth.net.getNetworkType();
							this.rarinonNFTContract = await this.getRarinonNFTContract(
								this.web3
							);
							// this.kickLotteryContract = await this.getKickLotteryContract(
							// 	this.web3
							// );
							callback({
								address: this.accountAddress,
								success: true,
							});
						});
					});
				})
				.catch(() => {
					callback({ address: null, success: false });
				});
		} else {
			this.networkName = await this.web3.eth.net.getNetworkType();
			callback({ address: this.accountAddress, success: true });
		}
	}

	spliceAddress(address) {
		return address.substr(0, 5) + '..' + address.substr(address.length - 4, 4);
	}
}
export default new Bia();
