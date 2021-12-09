import React from 'react'
import Header from '../components/Page/Header';
import PropTypes from 'prop-types';

const Layout = ({ children }) => {
	return (
		<div>
			<Header className="page-header" />
			{children}
		</div>
	)
}

Layout.propTypes = {
	children: PropTypes.object,
}

export default Layout