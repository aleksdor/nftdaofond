import React, { useState, useEffect } from 'react';
import api from '../api/api'

const Vote = ({ miningProposals, history }) => {

	const [proposals, setProposals] = useState([])

	useEffect(() => {
		api.connectRpc(() => {
			api.getProposals().then((proposals) => setProposals(proposals))
		})
	}, [miningProposals])

	return (
		<div className="section-container">
			<div className="container-fluid">
				<div className="align-items-center row">
					<div className="col-lg-8 offset-lg-2">
						<h1 className="vote-title">
							Floro DAO Governance
						</h1>
						<p className="vote-descr">
						</p>
						<div className="proposals">
							<div>
								<h3 className="proposals-title">
									Proposals
								</h3>
								<button type="button" className="proposals-btn btn btn-success" onClick={() => history.push('/create-proposal')}>Create Proposal</button>
							</div>
							{
								miningProposals.map(({ title, account, amount }, index) => (
									<button
										key={index}
										type="button"
										className="proposals-link btn btn-dark"
									>
										<span className='link-title'>
											<span>{title}</span>
										</span>
										<span className="badge bg-primary">still minning</span>
									</button>
								))
							}
							{
								proposals.map(({ title, closed, approved, id, end_at, nyes, nno, account, amount }) => (
									<button
										key={id}
										type="button"
										className="proposals-link btn btn-dark"
										onClick={() => history.push({ pathname: `/vote/${id}`, state: { id, closed, approved, title, end_at, nyes, nno, account, amount } })}
									>
										<span className='link-title'>
											<span>
												{id + 1}.
											</span>
											<span>{title}</span>
										</span>
										<span className="badge bg-primary">{!closed ? 'In progress' : approved ? 'Accepted' : 'Rejected'}</span>
									</button>
								))
							}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Vote