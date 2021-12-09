import { Container } from 'react-bootstrap'
import api from '../api/api'
import { Button } from '@material-ui/core';
import { useState } from 'react';

const Dev = () => {
	const [connected, setConnected] = useState(api.connected)
	const [address, setAddress] = useState(api.accountAddress)

	const connect = () => {
		api.connect(({ address, success }) => {
			setAddress(address)
			setConnected(success)
		})
	}

	return (
		<Container className="content">
			<Button
				onClick={connect}>
				{connected ? api.spliceAddress(address) : 'Connect'}
			</Button>
		</Container>
	)
}

export default Dev