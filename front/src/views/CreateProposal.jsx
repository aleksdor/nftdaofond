import React from 'react';
import ethereum_address from 'ethereum-address';
import { useState } from 'react';
import styled from 'styled-components'
import api from '../api/api'
import Spinner from '../components/UI/Spinner'

const ValidationLabel = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	color: red;
`

const AddProposalFrom = styled.form`
	&.loading {
		opacity: 0.65;
	}
`

const SpinnerWrapper = styled.div`
	z-index: 1;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`

const SubmitButton = styled.button`
	&.loading {
		&:hover {
			cursor: default !important;
			background:rgb(132, 230, 255) !important;
			opacity: 0.65 !important;
			transition: none !important;
		}
		background:rgb(132, 230, 255) !important;
		opacity: 0.65 !important;
		transition: none !important;
	}
`

const CreateProposal = ({ miningProposals, setMiningProposals, history }) => {

	const [accountAddress, setAccountAddress] = useState('')
	const [amount, setAmount] = useState(0)
	const [validatedAmountInput, setValidatedAmountInput] = useState('')
	const [title, setTitle] = useState('')
	const [url, setUrl] = useState('')
	const [isValidAddress, setIsValidAddress] = useState(true)
	const [isValidAmount, setIsValidAmount] = useState(true)
	const [isLoading, setIsLoading] = useState(false)
	const [isAdded, setIsAdded] = useState(false)

	// const unsetAllStates = () => {
	// 	setAccountAddress('')
	// 	setAmount(0)
	// 	setValidatedAmountInput('')
	// 	setTitle('')
	// 	setUrl('')
	// 	setIsValidAddress(true)
	// 	setIsValidAmount(true)
	// }

	const validateAddress = (value) => {
		if (ethereum_address.isAddress(value)) {
			setIsValidAddress(true)
			return true
		} else {
			setIsValidAddress(false)
			return false
		}
	}

	const validateAmount = (value, cb) => {
		api.connectRpc(async () => {
			const balance = await api.getBalance()
			if (value > balance) {
				setIsValidAmount(false)
				cb(false)
			} else {
				setIsValidAmount(true)
				cb(true)
			}
		})
	}

	const validateForm = (address, amount, cb) => {
		const isValidAddress = validateAddress(address)
		validateAmount(amount, (isValidAmount) => {
			cb(isValidAmount && isValidAddress)
		})
	}

	const validateAndSetAmount = (value) => {
		const validated = value.replace(/[^\d.,]/g, "").replace(',', '.')
		setAmount(Number(validated))
		setValidatedAmountInput(validated)
	}

	const addProposal = (e) => {
		e.preventDefault()
		validateForm(accountAddress, amount, (isValidForm) => {
			if (isValidForm) {
				api.connect(async () => {
					setIsLoading(true)
					setMiningProposals([...miningProposals, { amount, title, account: accountAddress }])
					console.log(miningProposals)
					await api.addProposal(accountAddress, amount, title, url)
					setIsLoading(false)
					setIsAdded(true)
					const removeIndex = miningProposals.findIndex((proposal) => proposal.title === title)
					miningProposals.splice(removeIndex, 1)
					setMiningProposals(miningProposals)
					console.log(removeIndex)
					console.log(miningProposals)
					// unsetAllStates()
				})
			}
		})
	}

	return (
		<div className="section-container">
			<div className="container-lg">
				<div className="align-items-center row">
					<div className="col-lg-8 offset-lg-2">
						<span className="all-title" onClick={() => history.push('/votes')}>
							← All Proposals
						</span>
					</div>
					<div className="create-proposal-form col-lg-8 offset-lg-2">
						<h3 className="create-proposal-heading">Create Proposal</h3>
						<div role="alert" className=" tip-title fade alert alert-secondary show mt-3">
							<b className="font-weight">Tip</b>
							: Add one or more transactions and describe your proposal for the community. The proposal cannot modified after submission, so please verify all information before submitting. The voting period will begin after 2 1/3 days and last for 3 days.
						</div>

						<div className="d-flex flex-column input-group">
							{
								isAdded ?
									<>
										<div>Your proposal is ready</div>
										<span className="all-title" onClick={() => history.push('/votes')}>
											← All Proposals
										</span>
									</>
									:
									<AddProposalFrom id="contact" method="post" onSubmit={addProposal} className={isLoading ? 'loading' : ''}>
										{
											isLoading ? <SpinnerWrapper><Spinner color={"secondary"}></Spinner></SpinnerWrapper> : ''
										}
										<fieldset className='position-relative'>
											<div className="form-title">Account address:</div>
											<input
												type="text"
												tabIndex="1"
												autoFocus
												value={accountAddress}
												onChange={(e) => setAccountAddress(e.currentTarget.value)}
												disabled={isLoading}
												required
											/>
											<ValidationLabel style={{ display: isValidAddress ? 'none' : 'block' }}>Invalid account address!</ValidationLabel>
										</fieldset>
										<fieldset className='position-relative'>
											<div className="form-title">Amount:</div>
											<input
												type="text"
												tabIndex="2"
												value={validatedAmountInput}
												onChange={(e) => validateAndSetAmount(e.currentTarget.value)}
												disabled={isLoading}
												required
											/>
											<ValidationLabel style={{ display: isValidAmount ? 'none' : 'block' }}>Amount is greater than contract balance!</ValidationLabel>
										</fieldset>
										<fieldset>
											<div className="form-title">Title:</div>
											<input
												type="text"
												tabIndex="3"
												value={title}
												onChange={(e) => setTitle(e.currentTarget.value)}
												disabled={isLoading}
												required
											/>
										</fieldset>
										<fieldset>
											<div className="form-title">Url:</div>
											<input
												type="url"
												tabIndex="4"
												value={url}
												onChange={(e) => setUrl(e.currentTarget.value)}
												disabled={isLoading}
												required
											/>
										</fieldset>
										<fieldset>
											<SubmitButton
												name="сreate"
												type="сreate"
												id="contact-submit"
												data-submit="...Sending"
												disabled={isLoading}
												className={isLoading ? 'loading' : ''}
											>
												Create
											</SubmitButton>
										</fieldset>
									</AddProposalFrom>
							}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CreateProposal