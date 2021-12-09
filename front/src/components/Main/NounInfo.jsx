import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import main01 from '../../assets/img/main01.png';
import MiniCard from '../MiniCard';





const NounInfo = () => {
	const [show, setShow] = useState(false);

	const handieClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<>
			<Modal show={show} onHide={handieClose} >
				<Modal.Header className="modal-header">
					<div className="header-wrapper">
						<a className="click-noun" href="#">
							<div className="img-wrapper">
								<img src={main01} alt="" className="img-wtf" />
							</div>
						</a>
					</div>
					<Modal.Title h4 className="auction">
						<h1 className="modal-descr">
							Flour
							113
							<br />
							Bid History
						</h1>
					</Modal.Title>
					<button type="button" class="btn-close close" aria-label="Close" onClick={handieClose}></button>
				</Modal.Header>
				<Modal.Body>
					<MiniCard />
				</Modal.Body>
			</Modal>
			<div className="bg">
				<div className="container-lg">
					<div className="row">
						<div className="auction-content col-lg-6">
							<div className="auction-wrapper">
								<div className="auction-img">
									<img src={main01} alt="" className="img-noun" />
								</div>
							</div>
						</div>
						<div className="auction-data col-lg-6">
							<div>
								<div className="auction-information">
									<div className="auction-activity row">
										<div className="col-lg-12">
											<h4 id="spanDate" className="data">Dec 06 2021</h4>
										</div>
										<div className="auction-title col-lg-12">
											<div className="auction-descr">
												<span className="name">Flour 113</span>
											</div>
											<div className="auction-navigation">
												<button type="button" class="auction-navigation-left">←</button>
												<button type="button" class="auction-navigation-right">→</button>
											</div>
										</div>
									</div>
									<div className="auction-activity row">
										<div className="auction-price col-lg-5">
											<div className="carrent-section">
												<h4 className="carrent-title">Current bid</h4>
												<h2 className="carrent-descr">
													Ξ
													75.00
												</h2>
											</div>
										</div>
										<div className="auction-timer col-lg-5">
											<h4 className='timer-title'>Ends in</h4>
											<h2 className="timer-descr">
												<div id="timer" className="section-timer">
													<span id="hours">
														14
														<span className="hours">h</span>
													</span>
												</div>
												<div className="section-timer">
													<span id="minutes">
														25
														<span className="minutes">m</span>
													</span>
												</div>
												<div className="section-timer">
													<span id="seconds">
														8
														<span className="seconds">s</span>
													</span>
												</div>
											</h2>
										</div>
									</div>
									<div className="auction-activity row">
										<div className="col-lg-12">
											<span className="mini-bid">Minimum bid: 61.2 ETH</span>
											<div className="input-group">
												<input class=" group form-control" type="text" aria-label="default input example"></input>
												<span className="group-title">ETH</span>
												<button type="button" class="button-main btn btn-primary">Bid</button>
											</div>
										</div>
									</div>
									<div className="auction-activity row">
										<div className="col=lg-12">
											<ul className="history-links">
												<li className="history-bid">
													<div className="history-item">
														<div className='bid-history-left'>
															<div className="history-bidder">
																<div>
																	<div className="history-address">
																		<div>
																			<div className='icon'>
																				<svg width="24px" height="24px">
																					<rect x="0" y="0" width="24" height="24" fill="#F3E200" transform="translate(-3.161882561253603 4.518394642582742) rotate(265.4 12 12)"></rect>
																					<rect x="0" y="0" width="24" height="24" fill="#FC9700" transform="translate(11.22026537036266 -4.1929834221118005) rotate(443.7 12 12)"></rect>
																					<rect x="0" y="0" width="24" height="24" fill="#F76001" transform="translate(-0.637331488665627 16.861902586552223) rotate(201.4 12 12)"></rect>
																				</svg>
																			</div>
																		</div>
																		0x2F...6445
																	</div>
																</div>
															</div>
														</div>
														<div className="bid-history-right">
															<div className="history-price">
																Ξ
																75.00
															</div>
															<div className="history-sale">
																<a href="/" target="_blank" rel="noreferrer">
																	<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" class="svg-inline--fa fa-external-link-alt fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
																		<path fill="currentColor" d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z">
																		</path>
																	</svg>
																</a>
															</div>
															<div className="history-link">
																<a href="https://etherscan.io/tx/0x9fbca796f87b09f7e26224393611afd27d2a11dab6858b50ba40fab2d34751ff" target="_blank" rel="noreferrer"></a>
															</div>
														</div>
													</div>
												</li>
											</ul>
											<ul className="history-links">
												<li className="history-bid">
													<div className="history-item">
														<div className='bid-history-left'>
															<div className="history-bidder">
																<div>
																	<div className="history-address">
																		<div>
																			<div className='icon'>
																				<svg width="24px" height="24px">
																					<rect x="0" y="0" width="24" height="24" fill="#1583F2" transform="translate(-4.4324274443461364 5.469350116742574) rotate(211.4 12 12)"></rect>
																					<rect x="0" y="0" width="24" height="24" fill="#FC8D00" transform="translate(-8.925320026703737 -4.391148020231861) rotate(287.7 12 12)"></rect>
																					<rect x="0" y="0" width="24" height="24" fill="#C7143B" transform="translate(-16.33475440664805 -6.174630902695456) rotate(326.9 12 12)"></rect>
																				</svg>
																			</div>
																		</div>
																		omakasemoney.eth
																	</div>
																</div>
															</div>
														</div>
														<div className="bid-history-right">
															<div className="history-price">
																Ξ
																47.00
															</div>
															<div className="history-sale">
																<a href="/" target="_blank" rel="noreferrer">
																	<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" class="svg-inline--fa fa-external-link-alt fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
																		<path fill="currentColor" d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z">
																		</path>
																	</svg>
																</a>
															</div>
															<div className="history-link">
																<a href="https://etherscan.io/tx/0x9fbca796f87b09f7e26224393611afd27d2a11dab6858b50ba40fab2d34751ff" target="_blank" rel="noreferrer"></a>
															</div>
														</div>
													</div>
												</li>
											</ul>
											<ul className="history-links">
												<li className="history-bid">
													<div className="history-item">
														<div className='bid-history-left'>
															<div className="history-bidder">
																<div>
																	<div className="history-address">
																		<div>
																			<div className='icon'>
																				<svg width="24px" height="24px">
																					<rect x="0" y="0" width="24" height="24" fill="#01808C" transform="translate(1.732000026293931 -1.1356332663103768) rotate(362.0 12 12)"></rect>
																					<rect x="0" y="0" width="24" height="24" fill="#034A5D" transform="translate(13.348006048518618 6.3454162277846615) rotate(30.6 12 12)"></rect>
																					<rect x="0" y="0" width="24" height="24" fill="#F74D01" transform="translate(-12.709997730151008 17.803735889989234) rotate(259.7 12 12)"></rect>
																				</svg>
																			</div>
																		</div>
																		0xfC...5410
																	</div>
																</div>
															</div>
														</div>
														<div className="bid-history-right">
															<div className="history-price">
																Ξ
																8.00
															</div>
															<div className="history-sale">
																<a href="/" target="_blank" rel="noreferrer">
																	<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" class="svg-inline--fa fa-external-link-alt fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
																		<path fill="currentColor" d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z">
																		</path>
																	</svg>
																</a>
															</div>
															<div className="history-link">
																<a href="https://etherscan.io/tx/0x9fbca796f87b09f7e26224393611afd27d2a11dab6858b50ba40fab2d34751ff" target="_blank" rel="noreferrer"></a>
															</div>
														</div>
													</div>
												</li>
											</ul>
											<div className="history-btn">
											</div>
										</div>
										<div className="history-btn">
											<div className="history-btn-bid" onClick={handleShow}>Bid History →</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default NounInfo