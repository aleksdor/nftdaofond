import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom'
import imgheader04 from '../../assets/img/icon-header/imgheader04.ico';
import api from '../../api/api'

const Header = () => {
	const [connected, setConnected] = useState(api.connected)
	const [address, setAddress] = useState(api.accountAddress)
	const [balance, setBalance] = useState(0)
	const [link, setLink] = useState('')

	const connect = () => {
		api.connect(({ address, success }) => {
			setAddress(address)
			setConnected(success)
		})
	}

	useEffect(() => {
		api.connectRpc(async () => {
			const balance = await api.getBalance()
			setLink(api.getLink())
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
						<span className="logo-weezi">powered by </span>
						<svg className="weezi-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 14" fill="none"><link xmlns="" type="text/css" rel="stylesheet" id="dark-mode-custom-link" /><link xmlns="" type="text/css" rel="stylesheet" id="dark-mode-general-link" />
							<g clipPath="url(#clip0_54:39)">
								<path d="M0 9.5118L7.76712 14L15.5342 9.5118V0L12.8493 1.55289V7.9589L9.10959 10.1271V4.0274H6.42466V10.1271L2.68493 7.9589V1.55289L0 0V9.5118Z" fill="black" />
								<path className="w2 anim-word" d="M21.9002 0.19165L18.0273 6.90398L21.9002 13.6163H31.4519L29.899 10.9314H23.4557L21.9002 8.24644H27.5977V5.56151H21.9002L23.4557 2.87658H29.899L31.4519 0.19165H21.9002Z" fill="black" />
								<path className="w3 anim-word" d="M35.9002 0.19165L32.0273 6.90398L35.9002 13.6163H45.4519L43.899 10.9314H37.4557L35.9002 8.24644H41.5977V5.56151H35.9002L37.4557 2.87658H43.899L45.4519 0.19165H35.9002Z" fill="black" />
								<path className="w4 anim-word" d="M47.5618 13.6163H58.4933V10.9314H51.2429L58.4933 2.87658V0.19165H47.7535V2.87658H54.8122L47.5618 10.9314V13.6163Z" fill="black" />
								<path className="w5 anim-word" d="M64.4384 0.19165H61.7534V13.6163H64.4384V0.19165Z" fill="black" />
							</g>
							<defs>
								<clipPath id="clip0_54:39">
									<rect width="64.4384" height="14" fill="white" />
								</clipPath>
							</defs>
						</svg>
						<span className="route " onClick={() => window.open(link, '_blank')}>TREASURY Ξ {balance}</span>
						<NavLink to={'/'} className="route ">MAIN</NavLink>
						<NavLink to={'/votes'} className="route ">VOTE</NavLink>
						<NavLink to={'/greenhouse'} className="route ">GREENHOUSE</NavLink>
						<span className="route " onClick={connect}>{connected ? api.spliceAddress(address) : 'CONNECT WALLET'}</span>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default (Header)
