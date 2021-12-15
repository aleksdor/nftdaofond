import React from 'react';

const CreateProposal = () => {
	return (
		<div className="section-container">
			<div className="container-lg">
				<div className="align-items-center row">
					<div className="col-lg-8 offset-lg-2">
						<a className="all-title" href="/vote">
							← All Proposals
						</a>
					</div>
					<div className="create-proposal-form col-lg-8 offset-lg-2">
						<h3 className="create-proposal-heading">Create Proposal</h3>
						<div role="alert" className=" tip-title fade alert alert-secondary show mt-3">
							<b className="font-weight">Tip</b>
							: Add one or more transactions and describe your proposal for the community. The proposal cannot modified after submission, so please verify all information before submitting. The voting period will begin after 2 1/3 days and last for 3 days.
						</div>
						<div className="d-flex flex-column input-group">
							<form id="contact" action="" method="post">
								<fieldset>
									<div className="form-title">Target:</div>
									<input type="text" tabindex="1" autofocus></input>
								</fieldset>
								<fieldset>
									<div className="form-title">Recipient:</div>
									<input type="text" tabindex="2"></input>
								</fieldset>
								<fieldset>
									<div className="form-title">Amount:</div>
									<input type="text" tabindex="3"></input>
								</fieldset>
								<fieldset>
									<div className="form-title">More details(url):</div>
									<input type="url" tabindex="4"></input>
								</fieldset>
								<fieldset>
									<button name="сreate" type="сreate" id="contact-submit" data-submit="...Sending">Create</button>
								</fieldset>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CreateProposal