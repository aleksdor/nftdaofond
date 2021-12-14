import React from 'react';
import { NavLink } from 'react-router-dom'

const Router = () => {
	return (
		<div className="routes">
			<NavLink to={'/'} className="route">Main</NavLink>
			<NavLink to={'/vote'} className="route">Vote</NavLink>
			<NavLink to={'/playground'} className="route">Playground</NavLink>
		</div>
	)
}

export default (Router)