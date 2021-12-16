import React, { useState, useEffect } from 'react';
import api from '../api/api'

const Vote = (props) => {

	const [proposals, setProposals] = useState([])

	useEffect(() => {
		api.connectRpc(async () => {
			const proposals = await api.getProposals()
			console.log(proposals)
			setProposals(proposals)
		})
	}, [])

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
								<button type="button" className="proposals-btn btn btn-success" onClick={() => props.history.push('/create-proposal')}>Create Proposal</button>
							</div>
							{
								proposals.map(({ title, closed, approved, id, end_at }) => (
									<button
										key={id}
										type="button"
										className="proposals-link btn btn-dark"
										onClick={() => props.history.push({ pathname: `/vote/${id}`, state: { id, closed, approved, title, end_at } })}
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