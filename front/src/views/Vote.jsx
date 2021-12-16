import React, { useState } from 'react';
import { useEffect } from 'react';
import api from '../api/api'
import { Button } from '@material-ui/core';
import styled from 'styled-components';

const VoteButtons = styled.div`
	display: flex;
	justify-content: space-around;
	button {
		width: 45%;
	}
`

const Test = ({ history: { location: { state } }, match: { params: { id } } }) => {

	const [proposal, setProposal] = useState({})
	const [date, setDate] = useState('')
	const [time, setTime] = useState('')
	const [votes, setVotes] = useState(0)

	useEffect(() => {
		if (state) {
			setProposal(state)
			setDate(new Date(Number(state.end_at) * 1000).toLocaleDateString(navigator.language))
			setTime(new Date(Number(state.end_at) * 1000).toLocaleTimeString(navigator.language))
		}
		else {
			api.connectRpc(async () => {
				const proposal = await api.getProposal(id)
				setProposal(proposal)
				setDate(new Date(Number(proposal.end_at) * 1000).toLocaleDateString(navigator.language))
				setTime(new Date(Number(proposal.end_at) * 1000).toLocaleTimeString(navigator.language))
			})
		}
		api.connect(async () => {
			const isNftOwner = await api.isNftOwner()
			console.log(isNftOwner)
		})
	}, [])

	const voteFor = () => {
		// api.connect(async () => {
		// 	const res = await api.voteYes(proposal.id)
		// 	console.log(res)
		// })
	}

	const voteAgainst = () => {

	}

	return (
		<div className="section-container">
			<div className="container-lg">
				<div className="align-items-center row">
					<div className="col-lg-8 offset-lg-2">
						<a className="all-title" href="/votes">
							← All Proposals
						</a>
					</div>
					<div className="create-proposal-form col-lg-8 offset-lg-2">
						<div className="d-flex justify-content-between align-items-center">
							<h3 className="create-proposal-heading">
								{proposal.title}
							</h3>
							<span className="badge bg-primary">{!proposal.closed ? 'In progress' : proposal.approved ? 'Accepted' : 'Rejected'}</span>
						</div>
						<div></div>
						<div className="data-title">
							{date} {time}
						</div>
						<div className="sentence-title">
							This proposal has reached quorum ({votes} votes)
						</div>
						<VoteButtons>
							<Button variant="outlined" onClick={voteFor}>Vote for</Button>
							<Button variant="outlined" onClick={voteAgainst}>Vote against</Button>
						</VoteButtons>
						<div className="vote-progress row">
							<div className="col-lg-4">
								<div className="vote-card card">
									<div className="p-2 body-card">
										<p className="py-2 m-0 card-text">
											<span className="vote-progress-descr">
												For
											</span>
											<span className="vote-progress-descr">
												0
											</span>
										</p>
										<div className="progress">
											<div role="progressbar" className="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
										</div>
									</div>
								</div>
							</div>
							<div className="col-lg-4">
								<div className="vote-card card">
									<div className="p-2 body-card">
										<p className="py-2 m-0 card-text">
											<span className="vote-progress-descr">
												Against
											</span>
											<span className="vote-progress-descr">
												0
											</span>
										</p>
										<div className="progress">
											<div role="progressbar" className="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="vote-strip col">
								<span className="proposed">
									Proposed Transactions
								</span>
								<p className="vote-link m-0">
									1: <a href="/" target="_blank" rel="noreferrer">0xEa2C787A2acd3aD60e44bf427Af568373cDe68f3</a>
									.transfer(
									<span>
										<span>
											15.0 ETH
										</span>
									</span>
									)
								</p>
							</div>
						</div>
						<div className="row">
							<div className="vote-strip col">
								<span className="proposed">
									Proposer
								</span>
								<p className="vote-link m-0">
									<a href="/" target="_blank" rel="noreferrer">0xB43A6203F66AD7e3726A9c0CcDF1b96faD504EE0</a> at <a href="/" target="_blank" rel="noreferrer">0xe9e89</a>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Test