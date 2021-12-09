import React from 'react';
import { NavLink } from 'react-router-dom'
import imgheader04 from '../../assets/img/icon-header/imgheader04.ico';

const Header = () => {
	return (
		<nav class="navbar navbar-expand-lg navbar-light navbar-bg">
			<div className="container-lg">
				<a className="navbarbrand navbar-brand" href="/">
					<img src={imgheader04} alt="" className="icon-header" />
				</a>
				<div className="justify-content-end navbar-collapse collapse">
					<div className="routes">
						<NavLink to={'/'} className="route ">TREASURY Ξ 14413</NavLink>
						<NavLink to={'/'} className="route ">MAIN</NavLink>
						<NavLink to={'/vote'} className="route ">VOTE</NavLink>
						<NavLink to={'/playground'} className="route ">PLAYGROUND</NavLink>
						<NavLink to={'/'} className="route ">CONNECT WALLET</NavLink>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default (Header)