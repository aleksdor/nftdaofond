import React from 'react';
import { NavLink } from 'react-router-dom'

const Router = () => {
	return (
		<div className="routes">
			<NavLink to={'/'} className="route">Main</NavLink>
			<NavLink to={'/votes'} className="route">Vote</NavLink>
			<NavLink to={'/greenhouse'} className="route">Greenhouse</NavLink>
		</div>
	)
}

export default (Router)