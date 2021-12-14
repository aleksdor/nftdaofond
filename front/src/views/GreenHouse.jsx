import { useEffect, useRef, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import styled from 'styled-components'
import mergeImages from 'merge-images'


const GreenhouseHeaderRow = styled.div`
	font-family: "Rajdhani";
	font-weight: 400;
	margin: 2rem 0;
	span {
		color: #8c8d92;
		font-size: 24px;
		font-family: "Fuzzy Bubbles";
		font-weight: 700;
	}
	h1 {
		font-family: "Fuzzy Bubbles";
		font-weight: 700;
		color: #14161b;cy
		font-size: 56px;
	}
`
const LinkLink = styled.a`
	color: #d63c5e;
	&:hover {
		color: #d63c5e;
	}
`
const GreenhouseGenerateBtn = styled(Button)`
	width: 100%;
    height: 4rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    border-radius: 12px;
    background-color: #d63c5e;
    border: #d63c5e;
	color: #fff;
	&:hover {
		background-color: #d63c5e;
		box-shadow: 0 0 0 0.2rem rgba(214, 60, 94, .75);
		cursor: pointer;
	}
	&:active {
		box-shadow: 0 0 0 0.2rem rgba(214, 60, 94, .75);
		background-color: #d63c5e;
	}
	&:focus {
		box-shadow: 0 0 0 0.2rem rgba(214, 60, 94, .75);
		background-color: #d63c5e;
	}
`
const GreenhouseTraitForm = styled.form`
	height: 4rem;
`
const GreenhouseFloatingLabel = styled.div`
	font-size: 15px;
	color: #8c8d92;
`
const GreenhouseTraitFormBtn = styled.select`
	height: 100%!important;
	width: 100%;
	margin: 0.5rem 0;
	border-radius: 12px;
	background-color: #fff!important;
	border-color: #e2e3e8!important;
	font-size: 18px;
	font-weight: 700;
	color: #14161b;
	&:hover {
		box-shadow: none;
		border-color: #e2e3e8!important;
		background-color: #f4f4f8!important;
	}
	&:active {
		box-shadow: none;
		border-color: #e2e3e8!important;
		background-color: #f4f4f8!important;
	}
	&:focus {
		box-shadow: none;
		border-color: #e2e3e8!important;
		background-color: #f4f4f8!important;
	}
`
const GreenhouseNounYearsFooter = styled.p`
	font-style: italic;
	padding-top: 1rem;
`
const NounImgWrapper = styled.div`
	margin-bottom: 1rem;
	position: relative;
	padding-top: 100%;
	width: 100%;
	height: 0;
`
const NounImg = styled.img`
	border-radius: 16px;
	image-rendering: pixelated;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: auto;
	vertical-align: middle;
	&:hover {
		cursor: pointer;
    	transform: scale(1.01);
	}
`
const NounModal = styled(Modal)`
	position: fixed;
	top: 15vh;
	padding: 2rem;
	text-align: center;
	border-radius: 15px;
	left: calc(50% - 12.5rem);
	width: 25rem;
	.modal-content {
		background-color: inherit;
		border: none;
	}
`
const NounModalNounWrapper = styled.div`
	margin-bottom: 1rem;
	position: relative;
    padding-top: 100%;
    width: 100%;
    height: 0;
`
const NounModalNounImg = styled.img`
	border-radius: 16px;
	image-rendering: pixelated;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    vertical-align: middle;
`
const NounModalDisplayNounFooter = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	span {
		color: #fff;
		font-weight: 700;
		margin-bottom: 1rem;
	}
	button {
		width: 50%;
		background: hsla(0,0%,100%,.3);
		border: none;
		&:hover {
			background: hsla(0,0%,100%,.4)!important;
    		box-shadow: none!important;
		}
		&:active {
			background: hsla(0,0%,100%,.4)!important;
    		box-shadow: none!important;
		}
		&:focus {
			background: hsla(0,0%,100%,.4)!important;
    		box-shadow: none!important;
		}
	}
`

function importAll(r) {
	let data = []
	r.keys().forEach(item => {
		const folderSrcArray = item.split('/')
		const folderName = folderSrcArray[1]
		const fileName = folderSrcArray[2].split('.')[0]
		let newFolderObj = data.find(image => image.folderName === folderName)
		if (!newFolderObj) {
			newFolderObj = { folderName, data: [] }
			data.push(newFolderObj)
		}
		newFolderObj.data.push({ fileName, link: r(item).default })
	});
	return data
}

const GreenHouse = () => {
	const [showModal, setShowModal] = useState(false)
	const [modalImage, setModalImage] = useState('')
	const [imagesData, setImagesData] = useState([])
	const [background, setBackground] = useState('')
	const [nouns, setNouns] = useState([])
	const [mergeData, setMergeData] = useState([])
	const showModalWindow = (image) => {
		setModalImage(image)
		setShowModal(true)
	}
	const hideModalWindow = () => {
		setShowModal(false)
	}

	const merge = () => {
		let newNouns = nouns
		const images = mergeData.map(({ link, random, data }) => random ? data[Math.floor(Math.random() * data.length)].link : link)
		mergeImages(images).then(b64 => {
			newNouns.unshift(b64)
			setNouns([...newNouns])
		});
	}

	const pushMergeData = ({ folderName, link, data }) => {
		let result = mergeData
		result = result.map((item) => {
			if (item.folderName === folderName) {
				return {
					folderName,
					link: link === 'random' ? data[Math.floor(Math.random() * data.length)].link : link,
					random: link === 'random' ? true : false,
					data
				}
			}
			else {
				return item
			}
		})
		setMergeData(result)
	}

	const setRandomMergeData = (imagesData) => {
		let defaultMergeData = mergeData
		imagesData.map(({ folderName, data }) =>
			defaultMergeData.push({
				folderName,
				link: data[Math.floor(Math.random() * data.length)].link,
				random: true,
				data
			})
		)
		setMergeData([...defaultMergeData])
	}

	useEffect(() => {
		const imagesData = importAll(require.context('../assets/img/randomise'));
		setRandomMergeData(imagesData)
		setImagesData(imagesData)
		for (let i = 0; i < 8; i++) {
			merge()
		}
	}, [])

	return (
		<>
			<NounModal show={showModal} onHide={hideModalWindow}>
				<NounModalNounWrapper>
					<NounModalNounImg src={modalImage} alt="noun" className="img-fluid" />
				</NounModalNounWrapper>
				<NounModalDisplayNounFooter>
					<span>Use this Noun as your profile picture!</span>
					<button type="button" className="btn btn-primary">Download</button>
				</NounModalDisplayNounFooter>
			</NounModal>
			<div className="content-wrapper">
				<div className="container-lg">
					<div className="row">
						<GreenhouseHeaderRow className="col-lg-10">
							<span>Explore</span>
							<h1>Greenhouse</h1>
						</GreenhouseHeaderRow>
					</div>
					<div className="row">
						<div className="col-lg-3">
							<GreenhouseGenerateBtn type="button" onClick={() => merge()}>Generate Floros</GreenhouseGenerateBtn>
							{
								imagesData.map(({ folderName, data }) => (
									<GreenhouseTraitForm>
										<GreenhouseFloatingLabel className="form-floating">
											<GreenhouseTraitFormBtn
												aria-label="Floating label select example"
												className="form-select"
												id="floatingSelect"
												onChange={(e) => pushMergeData({ folderName, link: e.currentTarget.value, data })}
											>
												<option value='random'>Random</option>
												{
													data.map(({ fileName, link }) => (
														<option value={link}>{fileName}</option>
													))
												}
											</GreenhouseTraitFormBtn>
											<label for="floatingSelect">{folderName}</label>
										</GreenhouseFloatingLabel>
									</GreenhouseTraitForm>
								))
							}
						</div>
						<div className="col-lg-9">
							<div className="row">
								{nouns.map((noun) => (
									<div className="col-lg-3 col-4">
										<div>
											<NounImgWrapper>
												<NounImg src={noun} alt="noun" className="img-fluid" onClick={() => showModalWindow(noun)} />
											</NounImgWrapper>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default GreenHouse