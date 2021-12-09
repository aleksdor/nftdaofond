import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import main01 from '../../assets/img/main01.png';
import MiniCard from '../MiniCard';
import api from '../../api/api'

const NounInfo = () => {
	const [show, setShow] = useState(false);
	const [bid, setBid] = useState(0);
	const [currentTokenImage, setCurrentTokenImage] = useState('')
	const [currentId, setCurrentId] = useState(0)
	const [bids, setBids] = useState([])
	const [endsAt, setEndsAt] = useState('')
	const [bidders, setBidders] = useState([])
	const [hours, setHours] = useState('')
	const [minutes, setMinutes] = useState('')
	const [seconds, setSeconds] = useState('')
	const [minimalBid, setMinimalBid] = useState(0)
	const handieClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const startTimer = (endTimestamp) => {
		const calc = setInterval(timer, 1000)
		function timer() {
			const endAt = new Date(endTimestamp);
			const currentTime = new Date();

			const totalSeconds = Math.floor((endAt - (currentTime)) / 1000)
			const totalMinutes = Math.floor(totalSeconds / 60)
			const totalHours = Math.floor(totalMinutes / 60)
			const totalDays = Math.floor(totalHours / 24)

			const hours = totalHours - (totalDays * 24);
			const minutes = totalMinutes - (totalDays * 24 * 60) - (hours * 60);
			const seconds = totalSeconds - (totalDays * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

			setHours(hours.toString())
			setMinutes(minutes.toString())
			setSeconds(seconds.toString())
		}
	}

	useEffect(() => {
		api.connectRpc(async () => {
			const { tokenImage, currentId } = await api.getCurrentTokenInfo()
			const { history: { bids, end_at, bidders } } = await api.getHistory()
			const numberBidsArr = bids.map((bid) => Number(bid) / 1000000000000000000)
			const minimalBidded = Math.max.apply(Math, numberBidsArr)
			const minimalBid = minimalBidded / 100 * 50 + minimalBidded
			setMinimalBid(minimalBid)
			startTimer(Number(end_at))
			setEndsAt(end_at)
			setBids(bids)
			setBidders(bidders)
			setCurrentId(currentId)
			setCurrentTokenImage(tokenImage)
		})
	}, [])

	const createBid = async (bid) => {
		await api.createBid(bid)
		const { history: { bids, bidders } } = await api.getHistory()
		const numberBidsArr = bids.map((bid) => Number(bid) / 1000000000000000000)
		const minimalBidded = Math.max.apply(Math, numberBidsArr)
		const minimalBid = minimalBidded / 100 * 50 + minimalBidded
		setMinimalBid(minimalBid)
		setBids(bids)
		setBidders(bidders)
	}

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
							{currentId}
							<br />
							Bid History
						</h1>
					</Modal.Title>
					<button type="button" class="btn-close close" aria-label="Close" onClick={handieClose}></button>
				</Modal.Header>
				<Modal.Body>
					<MiniCard bidders={bidders} bids={bids} />
				</Modal.Body>
			</Modal>
			<div className="bg">
				<div className="container-lg">
					<div className="row">
						<div className="auction-content col-lg-6">
							<div className="auction-wrapper">
								<div className="auction-img">
									<img src={currentTokenImage} alt="" className="img-noun" />
								</div>
							</div>
						</div>
						<div className="auction-data col-lg-6">
							<div>
								<div className="auction-information">
									<div className="auction-activity row">
										<div className="col-lg-12">
											<h4 id="spanDate" className="data">{new Date(Date.now()).toDateString().slice(4)}</h4>
										</div>
										<div className="auction-title col-lg-12">
											<div className="auction-descr">
												<span className="name">Flour {currentId}</span>
											</div>
											{/* <div className="auction-navigation">
												<button type="button" class="auction-navigation-left">←</button>
												<button type="button" class="auction-navigation-right">→</button>
											</div> */}
										</div>
									</div>
									<div className="auction-activity row">
										<div className="auction-price col-lg-5">
											<div className="carrent-section">
												<h4 className="carrent-title">Current bid</h4>
												<h2 className="carrent-descr">
													Ξ
													{Number(bids[bids.length - 1]) / 1000000000000000000}
												</h2>
											</div>
										</div>
										<div className="auction-timer col-lg-5">
											<h4 className='timer-title'>Ends in</h4>
											<h2 className="timer-descr">
												<div id="timer" className="section-timer">
													<span id="hours">
														{hours}
														<span className="hours">h</span>
													</span>
												</div>
												<div className="section-timer">
													<span id="minutes">
														{minutes}
														<span className="minutes">m</span>
													</span>
												</div>
												<div className="section-timer">
													<span id="seconds">
														{seconds}
														<span className="seconds">s</span>
													</span>
												</div>
											</h2>
										</div>
									</div>
									<div className="auction-activity row">
										<div className="col-lg-12">
											<span className="mini-bid">Minimum bid: {minimalBid} ETH</span>
											<div className="input-group">
												<input onChange={(e) => setBid(Number(e.target.value) * 1000000000000000000)} class=" group form-control" type="text" aria-label="default input example"></input>
												<span className="group-title">ETH</span>
												<button onClick={() => createBid(bid)} disabled={bid >= minimalBid * 1000000000000000000 ? false : true} type="button" class="button-main btn btn-primary">Bid</button>
											</div>
										</div>
									</div>
									<div className="auction-activity row">
										<div className="col=lg-12">
											{bidders.map((bidder, index) => (
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
																			{bidder}
																		</div>
																	</div>
																</div>
															</div>
															<div className="bid-history-right">
																<div className="history-price">
																	Ξ
																	{bids[index] / 1000000000000000000}
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
											))}
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
