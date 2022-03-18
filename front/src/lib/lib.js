import Compress from 'compress.js'

export const resizeImageBlob = async (file, maxWidth = 300, maxHeight = 300) => {
	const compress = new Compress()
	const resizedImage = await compress.compress([file], {
		size: 1,
		quality: 1,
		maxWidth,
		maxHeight,
		resize: true
	})
	const img = resizedImage[0];
	const base64str = img.data
	const imgExt = img.ext
	const resizedFiile = Compress.convertBase64ToFile(base64str, imgExt)
	return resizedFiile;
}