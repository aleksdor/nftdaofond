import React, { useState, useEffect } from 'react';
import { Modal, Placeholder } from 'react-bootstrap';
import MiniCard from '../MiniCard';
import api from '../../api/api'

const NounInfo = () => {
	const [show, setShow] = useState(false);
	const [bid, setBid] = useState(0);
	const [currentTokenImage, setCurrentTokenImage] = useState('')
	const [currentTokenId, setCurrentId] = useState(0)
	const [bids, setBids] = useState([])
	const [bidders, setBidders] = useState([])
	const [hours, setHours] = useState('')
	const [minutes, setMinutes] = useState('')
	const [seconds, setSeconds] = useState('')
	const [minimalBid, setMinimalBid] = useState(0)
	const [validatedBidInput, setValidatedBidInput] = useState('')
	const [currentHistoryId, setCurrentHistoryId] = useState(0)
	const [bidDisabled, setBidDisabled] = useState(false)
	const [imageLoaded, setImageLoaded] = useState(false)
	const handieClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const [calc, setCalc] = useState('')
	// const [initialBiddersInterval, setinItialBiddersInterval] = useState(setInterval(() => { }, 60000))
	// const [lookForNewRoundInterval, setLookForNewRoundInterval] = useState(setInterval(() => { }, 60000))

	const getBlockchainTimestampDifference = () => {
		return new Promise((resolve, reject) => {
			try {
				api.connectRpc(() => {
					const web3 = api.web3Infura
					web3.eth.getBlockNumber().then(async (blockNumber) => {
						const { timestamp } = await web3.eth.getBlock(blockNumber)
						const currentTime = new Date().getTime()
						const difference = currentTime - timestamp * 1000
						resolve(difference)
					})
				})
			} catch (e) {
				reject(e)
			}
		})
	}

	const startTimer = async (endTimestamp) => {
		const difference = await getBlockchainTimestampDifference()
		setCalc(setInterval(timer, 1000))
		async function timer() {
			const endAt = new Date(endTimestamp * 1000).getTime()
			const currentTime = (new Date().getTime()) - difference
			// console.log(endAt)
			// console.log(currentTime)
			// console.log(endAt - currentTime)
			if (endAt - currentTime <= 0) {
				setHours('0')
				setMinutes('0')
				setSeconds('0')
				setBidDisabled(true)
				clearInterval(calc)
				// const { currentHistoryId } = await api.getCurrentHistoryId()
				// clearInterval(lookForNewRoundInterval)
				// const lookForNewRound = setInterval(async () => {
				// 	const history = await api.getCurrentHistoryId()
				// 	const newHistoryId = history.currentHistoryId
				// 	if (newHistoryId > currentHistoryId) {
				// 		const { history: { end_at } } = await api.getHistory(newHistoryId)
				// 		const difference = await getBlockchainTimestampDifference()
				// 		const endAt = new Date(Number(end_at) * 1000).getTime()
				// 		const currentTime = (new Date().getTime()) - difference
				// 		if (endAt - currentTime > 0) {
				// 			clearInterval(lookForNewRound)
				// 			changeHistoryPage(newHistoryId)
				// 		}
				// 	}
				// }, 10000)
				// setLookForNewRoundInterval(lookForNewRound)
			} else {
				let delta = Math.abs(endAt - currentTime) / 1000;
				const days = Math.floor(delta / 86400);
				delta -= days * 86400;
				const hours = Math.floor(delta / 3600) % 24;
				delta -= hours * 3600;
				const minutes = Math.floor(delta / 60) % 60;
				delta -= minutes * 60;
				const seconds = Math.floor(delta % 60);
				setHours(hours.toString())
				setMinutes(minutes.toString())
				setSeconds(seconds.toString())
			}
		}
	}

	const getBids = async (currentHistoryId) => {
		const { history: { bids, bidders } } = await api.getHistory(currentHistoryId)
		const numberBidsArr = bids.length ? bids.map((bid) => Number(bid) / 1000000000000000000) : [0]
		const minimalBidded = Math.max.apply(Math, numberBidsArr)
		const minimalBid = minimalBidded ? minimalBidded / 100 * 50 + minimalBidded : 0.01
		setMinimalBid(minimalBid)
		setBids(bids)
		setBidders(bidders)
	}

	useEffect(() => {
		api.connectRpc(async () => {
			const promiseArr = [
				api.getCurrentTokenInfo().then(async ({ tokenImage, currentTokenId }) => {
					const { currentRoundId } = await api.getCurrentRoundId()
					setCurrentId(currentRoundId)
					setCurrentTokenImage(tokenImage)
				}),
				api.getCurrentHistoryId().then(({ currentHistoryId }) => {
					getBids(currentHistoryId)
					api.getHistory(currentHistoryId).then(({ history: { end_at } }) => {
						startTimer(Number(end_at))
					})
				})
			]

			Promise.all(promiseArr).then(() => clearInterval(calc))

			// const { tokenImage, currentTokenId } = await api.getCurrentTokenInfo()
			// const { currentHistoryId } = await api.getCurrentHistoryId()
			// const { history: { end_at } } = await api.getHistory(currentHistoryId)
			// const difference = await getBlockchainTimestampDifference()
			// const endAt = new Date(Number(end_at) * 1000).getTime()
			// const currentTime = (new Date().getTime()) - difference
			// endAt - currentTime > 0 ? setCurrentHistoryId(currentHistoryId) : setCurrentHistoryId(currentHistoryId > 0 ? currentHistoryId - 1 : currentHistoryId)
			// // clearInterval(initialBiddersInterval)
			// // const getBidsInterval = setInterval(() => getBids(currentHistoryId), 10000)
			// // setinItialBiddersInterval(getBidsInterval)
			// setCurrentId(currentTokenId)
			// setCurrentTokenImage(tokenImage)
			// getBids(currentHistoryId)

			// clearInterval(calc)
			// startTimer(Number(end_at))
		})
		return () => {
			// clearInterval(initialBiddersInterval)
			clearInterval(calc)
			// clearInterval(lookForNewRoundInterval)
		}
		// eslint-disable-next-line
	}, [])

	const createBid = async (bid) => {
		api.createBid(bid).then(() => getBids(currentHistoryId))
	}

	const changeHistoryPage = async (historyId) => {
		const { historyCount } = await api.getHistoryCount()
		if (historyId < 0) historyId = historyCount - 1
		if (historyId >= historyCount) historyId = 0
		setCurrentHistoryId(historyId)
		const { tokenImage } = await api.getTokenInfo(historyId)
		const { history: { end_at } } = await api.getHistory(historyId)
		getBids(historyId)
		// clearInterval(initialBiddersInterval)
		// const getBidsInterval = setInterval(() => getBids(historyId), 10000)
		// setinItialBiddersInterval(getBidsInterval)
		if (historyId !== historyCount - 1) {
			setBidDisabled(true)
			clearInterval(calc)
			setHours(0)
			setMinutes(0)
			setSeconds(0)
		} else {
			clearInterval(calc)
			startTimer(Number(end_at))
			setBidDisabled(false)
		}
		setCurrentId(historyId + 1)
		setCurrentTokenImage(tokenImage)
	}

	const validateAndSetBid = (value) => {
		const validated = value.replace(/[^\d.,]/g, "").replace(',', '.')
		setBid(Number(validated) * 1000000000000000000)
		setValidatedBidInput(validated)
	}

	return (
		<>
			<Modal show={show} onHide={handieClose} >
				<Modal.Header className="modal-header">
					<div className="header-wrapper">
						<a className="click-noun" href="/">
							<div className="img-wrapper">
								<img src={currentTokenImage} alt="" className="img-wtf" />
							</div>
						</a>
					</div>
					<Modal.Title h4="true" className="auction">
						<h1 className="modal-descr">
							Floro
							{currentTokenId}
							<br />
							Bid History
						</h1>
					</Modal.Title>
					<button type="button" className="btn-close close" aria-label="Close" onClick={handieClose}></button>
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
									{!imageLoaded && <Placeholder className="img-noun h-70" animation="glow"><Placeholder className="h-100 w-100" /></Placeholder>}
									{<img onLoad={() => setImageLoaded(true)} src={currentTokenImage} alt="" className={`img-noun${imageLoaded ? '' : ' d-none'}`} />}
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
												<span className="name">Floro {currentTokenId}</span>
											</div>
											<div className="auction-navigation">
												<button type="button" className="auction-navigation-left" onClick={() => changeHistoryPage(currentHistoryId - 1)}>←</button>
												<button type="button" className="auction-navigation-right" onClick={() => changeHistoryPage(currentHistoryId + 1)}>→</button>
											</div>
										</div>
									</div>
									<div className="auction-activity row">
										<div className="auction-price col-lg-5">
											<div className="carrent-section">
												<h4 className="carrent-title">Current bid</h4>
												<h2 className="carrent-descr">
													Ξ
													{bids.length ? Number(bids[bids.length - 1]) / 1000000000000000000 : 0}
												</h2>
											</div>
										</div>
										<div className="auction-timer col-lg-5">
											<h4 className='timer-title'>Ends in</h4>
											<h2 className="timer-descr">
												<div id="timer" className="section-timer">
													<span id="hours">
														{hours ? hours : '0'}
														<span className="hours">h</span>
													</span>
												</div>
												<div className="section-timer">
													<span id="minutes">
														{minutes ? minutes : '0'}
														<span className="minutes">m</span>
													</span>
												</div>
												<div className="section-timer">
													<span id="seconds">
														{seconds ? seconds : '0'}
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
												<input
													onChange={(e) => validateAndSetBid(e.target.value)}
													className="group form-control"
													type="text"
													aria-label="default input example"
													value={validatedBidInput}
													disabled={bidDisabled}
												/>
												<span className="group-title">ETH</span>
												<button
													onClick={() => createBid(bid)}
													disabled={bid >= minimalBid * 1000000000000000000 && !bidDisabled ? false : true}
													type="button"
													className="button-main btn btn-primary"
												>
													Bid</button>
											</div>
										</div>
									</div>
									<div className="auction-activity row">
										<div className="col=lg-12">
											{bidders.map((bidder, index) => (
												<ul className="history-links" key={`bidder-${index}`}>
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
																{/* <div className="history-sale">
																	<a href="/" target="_blank" rel="noreferrer">
																		<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" className="svg-inline--fa fa-external-link-alt fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
																			<path fill="currentColor" d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z">
																			</path>
																		</svg>
																	</a>
																</div> */}
																{/* <div className="history-link">
																	<a href="https://etherscan.io/tx/0x9fbca796f87b09f7e26224393611afd27d2a11dab6858b50ba40fab2d34751ff" target="_blank" rel="noreferrer"></a>
																</div> */}
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
