import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom'
import imgheader04 from '../../assets/img/icon-header/imgheader04.ico';
import api from '../../api/api'

const Header = () => {
	const [connected, setConnected] = useState(api.connected)
	const [address, setAddress] = useState(api.accountAddress)
	const [balance, setBalance] = useState(0)

	const connect = () => {
		api.connect(({ address, success }) => {
			setAddress(address)
			setConnected(success)
		})
	}

	useEffect(() => {
		api.connectRpc(async () => {
			const { history: { bids } } = await api.getHistory()
			const reducer = (previousValue, currentValue) => Number(previousValue) + Number(currentValue)
			const balance = bids.length ? bids.reduce(reducer) / 1000000000000000000 : 0
			setBalance(balance)
		})
	}, [])

	return (
		<nav className="navbar navbar-expand-lg navbar-light navbar-bg">
			<div className="container-lg">
				<a className="navbarbrand navbar-brand" href="/">
					<img src={imgheader04} alt="" className="icon-header" />
				</a>
				<div className="justify-content-end navbar-collapse collapse">
					<div className="routes">
						<span className="route ">TREASURY Ξ {balance}</span>
						<NavLink to={'/'} className="route ">MAIN</NavLink>
						<NavLink to={'/vote'} className="route ">VOTE</NavLink>
						<NavLink to={'/greenhouse'} className="route ">GREENHOUSE</NavLink>
						<span className="route " onClick={connect}>{connected ? api.spliceAddress(address) : 'CONNECT WALLET'}</span>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default (Header)
