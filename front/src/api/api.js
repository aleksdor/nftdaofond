import Web3 from 'web3';
import Web3Modal from 'web3modal';
import MewConnect from '@myetherwallet/mewconnect-web-client';
import ethProvider from 'eth-provider';
import Authereum from 'authereum';
import logoETH from '../assets/img/eth.png';
import logoBSC from '../assets/img/binance.png';
import axios from 'axios'
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
		this.rarinonDAOContractRpc = '';
		this.rarinonNFTContractRpc = '';
		this.rarinonAuctionContractRpc = '';
		this.rarinonDAOContract = '';
		this.rarinonNFTContract = '';
		this.rarinonAuctionContract = '';
		this.chainId = '';
		this.chainLogo = '';
		this.networkName = '';
		this.appChainId = '';
		this.canChangeNetwork = false;
		this.CurrentID = 0;
	}

	async connectRpc(cb) {
		this.web3Infura = new Web3(networkParameters.rpc)
		const { rarinonNFTContract, rarinonAuctionContract, rarinonDAOContract } = await this.getNFTContracts(this.web3Infura)
		this.rarinonDAOContractRpc = rarinonDAOContract
		this.rarinonNFTContractRpc = rarinonNFTContract
		this.rarinonAuctionContractRpc = rarinonAuctionContract
		console.log({ rarinonNFTContract, rarinonAuctionContract, rarinonDAOContract })
		this.connectedRpc = true;
		cb()
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

	async createContracts(web3) {
		const rarinonNFTContract = await new web3.eth.Contract(rarinonNFTAbi)
		const res1 = await rarinonNFTContract.deploy({ data: rarinonNFTBytecode, arguments: ['yyy', 'yyy'] }).send({ from: this.accountAddress })
		const rarinonDAOContract = await new web3.eth.Contract(rarinonDAOAbi)
		const res2 = await rarinonDAOContract.deploy({ data: rarinonDAOBytecode, arguments: [res1._address, 172800, 100] }).send({ from: this.accountAddress })
		const rarinonAuctionContract = await new web3.eth.Contract(rarinonAuctionAbi)
		const res3 = await rarinonAuctionContract.deploy({ data: rarinonAuctionBytecode, arguments: [res1._address, res2._address, 172800] }).send({ from: this.accountAddress })
		return { rarinonNFTContract: res1, rarinonAuctionContract: res3, rarinonDAOContract: res2 }
	}

	async getNFTContracts(web3) {
		if (rarinonNFTAddress && rarinonDAOAddress && rarinonAuctionAddress) {
			const rarinonNFTContract = await new web3.eth.Contract(rarinonNFTAbi, rarinonNFTAddress)
			const rarinonDAOContract = await new web3.eth.Contract(rarinonDAOAbi, rarinonDAOAddress)
			const rarinonAuctionContract = await new web3.eth.Contract(rarinonAuctionAbi, rarinonAuctionAddress)
			return { rarinonNFTContract, rarinonAuctionContract, rarinonDAOContract }
		} else {
			return {};
		}
	}

	async getCurrentTokenInfo() {
		const CurrentID = await this.rarinonNFTContractRpc.methods.CurrentID().call()
		// const historyCount = await this.rarinonAuctionContractRpc.methods.historyCount().call()
		// console.log(historyCount)
		// const history = await this.rarinonAuctionContractRpc.methods.history(Number(historyCount) - 1).call()
		// console.log(history)
		const tokenUri = await this.rarinonNFTContractRpc.methods.tokenURI(CurrentID).call()
		const { data: { image } } = await axios.get(tokenUri)
		return { tokenImage: image, currentId: CurrentID }
	}

	async getBalance() {
		const balance = await this.web3Infura.eth.getBalance(rarinonDAOAddress)
		console.log(balance / 1000000000000000000)
		return balance / 1000000000000000000
	}

	async closeRound() {
		const canClose = await this.rarinonAuctionContract.methods.canClose().call()
		console.log(canClose)
		if (canClose) {
			const res = await this.rarinonAuctionContract.methods.close().send({ from: this.accountAddress })
			console.log(res)
		}
	}

	async getHistory() {
		// const allHistory = await this.rarinonAuctionContract.methods.historyCount().call()
		// console.log(allHistory)
		const history = await this.rarinonAuctionContractRpc.methods.history(this.CurrentID).call()
		return { history }
	}

	async createBid(bid) {
		if (!this.connected) {
			this.connect(async () => {
				const res = await this.rarinonAuctionContract.methods.createBid().send({ from: this.accountAddress, value: bid })
				console.log(res)
			})
		} else {
			const res = await this.rarinonAuctionContract.methods.createBid().send({ from: this.accountAddress, value: bid })
			console.log(res)
		}
	}

	async createRound() {
		const CurrentID = await this.rarinonNFTContract.methods.CurrentID().call()
		this.CurrentID = CurrentID
		const res = await this.rarinonAuctionContract.methods.createRound(CurrentID).send({ from: this.accountAddress })
		console.log(res)
	}

	async mint() {
		const res = await this.rarinonNFTContract.methods.mint(rarinonAuctionAddress, 'https://ipfs.infura.io:5001/api/v0/cat?arg=QmZJBhp3dDmn7cP8jRa4extAKh16RLr13irSdk46hqqAvg').send({ from: this.accountAddress })
		console.log(res)
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
							const { rarinonNFTContract, rarinonAuctionContract, rarinonDAOContract } = await this.getNFTContracts(this.web3)
							this.rarinonNFTContract = rarinonNFTContract
							this.rarinonAuctionContract = rarinonAuctionContract
							this.rarinonDAOContract = rarinonDAOContract
							console.log({ rarinonNFTContract, rarinonAuctionContract, rarinonDAOContract })
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
