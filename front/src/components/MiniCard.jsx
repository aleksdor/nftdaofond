
const MiniCard = ({ bidders, bids }) => {
    return (
        <div className="auction-activity row">
            <div className="col=lg-12">
                {
                    bidders.map((bidder, index) => (
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
                                    {/* <div className="history-data">Nov 22 at 05:44 am</div> */}
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
                                        </div>
                                        <div className="history-link">
                                            <a href="https://etherscan.io/tx/0x9fbca796f87b09f7e26224393611afd27d2a11dab6858b50ba40fab2d34751ff" target="_blank" rel="noreferrer">

                                            </a>
                                        </div> */}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    ))
                }
                <div className="history-btn">

                </div>
            </div>
        </div>
    )
}

export default MiniCard;
