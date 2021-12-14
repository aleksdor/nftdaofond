import imgmain from '../../assets/img/main/imgmain.png'

const NounInfo = () => {
	return (
		<div className="section-container">
			<div className="container-lg">
				<div className="align-items row">
					<div className="col-lg-6">
						<div className="banner">
							<h1>
								ONE FLORO,
								<br />
								EVERY DAY,
								<br />
								FOREVER.
							</h1>
						</div>
					</div>
					<div className="col-lg-6">
						<div className="img-wrapper">
							<div className="noun-img">
								<img src={imgmain} alt="" className="imgmain" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NounInfo