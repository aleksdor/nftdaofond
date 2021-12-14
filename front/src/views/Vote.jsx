import React from 'react';

const Vote = () => {
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
								<button type="button" class="proposals-btn btn btn-success">Create Proposal</button>
							</div>
							<button type="button" class="proposals-link btn btn-dark">
								<span className='link-title'>
									<span>
										1.
									</span>
									<span></span>
								</span>
								<span class="badge bg-primary">Pending</span>
							</button>
							<button type="button" class="proposals-link btn btn-dark">
								<span className='link-title'>
									<span>
										2.
									</span>
									<span></span>
								</span>
								<span class="badge bg-primary">Active</span>
							</button>
							<button type="button" class="proposals-link btn btn-dark">
								<span className='link-title'>
									<span>
										3.
									</span>
									<span></span>
								</span>
								<span class="badge bg-success">Succeeded</span>
							</button>
							<button type="button" class="proposals-link btn btn-dark">
								<span className='link-title'>
									<span>
										4.
									</span>
									<span></span>
								</span>
								<span class="badge bg-danger">Defeated</span>
							</button>
							<button type="button" class="proposals-link btn btn-dark">
								<span className='link-title'>
									<span>
										5.
									</span>
									<span></span>
								</span>
								<span class="badge bg-secondary">Queued</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Vote