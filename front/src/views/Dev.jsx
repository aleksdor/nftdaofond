import { Container } from 'react-bootstrap'
import api from '../api/api'
import { Button } from '@material-ui/core';
import { useEffect, useState } from 'react';

const Dev = () => {
	const [connected, setConnected] = useState(api.connected)
	const [address, setAddress] = useState(api.accountAddress)
	const [balance, setBalance] = useState(0)

	const connect = () => {
		api.connect(({ address, success }) => {
			setAddress(address)
			setConnected(success)
		})
	}

	const mint = () => {
		api.mint()
	}

	const createRound = () => {
		api.createRound()
	}

	const createBid = () => {
		api.createBid(0.01 * 1000000000000000000)
	}

	const getHistory = () => {
		api.getHistory()
	}

	const closeRound = () => {
		api.closeRound()
	}

	const getBalance = () => {
		api.getBalance()
	}

	useEffect(() => {
		api.connectRpc(async () => {
			const balance = await api.getBalance()
			setBalance(balance)
		})
	}, [])

	return (
		<Container className="content">
			<span>{balance}</span>
			<Button
				onClick={connect}
			>
				{connected ? api.spliceAddress(address) : 'Connect'}
			</Button>
			<Button
				onClick={mint}
			>
				Mint
			</Button>
			<Button
				onClick={createRound}
			>
				Create round
			</Button>
			<Button
				onClick={createBid}
			>
				Create bid
			</Button>
			<Button
				onClick={getHistory}
			>
				Get history
			</Button>
			<Button
				onClick={closeRound}
			>
				Close Round
			</Button>
			<Button
				onClick={getBalance}
			>
				Get Balance
			</Button>
		</Container>
	)
}

export default Dev
