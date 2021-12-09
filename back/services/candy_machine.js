const fs = require('fs')
const jimp = require('jimp')
const Handlebars = require('handlebars')

module.exports = {
	/**
	 * Построить случайный набор черт исходя из их редкости.
	 * @param {*} conf 
	 * @returns 
	 */
	generate_trait_set(conf) {
		// conf = [
		//		{type: 'web', values: [
		//			{value: 'yes', rare: 100, img: ''},
		//			{value: 'no', rare: 100, img: ''}
		//		]},
		//		{type: 'face', values: [
		//			{value: 'yes', rare: 100, img: ''},
		//			{value: 'no', rare: 100, img: ''}
		//		]},
		//		{type: 'eyes', values: [
		//			{value: 'yes', rare: 100, img: ''},
		//			{value: 'no', rare: 100, img: ''}
		//		]},
		//		...
		// ]

		let traits = []
		for (let k in conf) {
			let trait = conf[k]

			let rate_sum = trait.values.reduce((s, c) => s + c.rate, 0)
			let rnd = Math.random() * rate_sum;

			let value
			let ind
			for (let kk in trait.values) {
				if (rnd <= trait.values[kk].rate) {
					value = trait.values[kk];
					ind = kk
					break
				}
				rnd -= trait.values[kk].rate
			}

			traits.push({ type: trait.type, ...value, ind: parseInt(ind) })
		}

		return traits
	},

	/**
	 * Строит хеш из набора характеристик.
	 * @param { [{ind: integer}] } ts 
	 * @returns {String} Хеш вида '0.1.4.1.2'
	 */
	ts2hash(ts) {
		return ts.map(x => x.ind).join('.')
	},

	/**
	 * 
	 * @param { String } hash Хеш вида '0.1.4.1.2'
	 * @param {[]} conf Конфиг со всеми зарактеристиками
	 * @returns {[]} Набор зарактеристик
	 */
	hash2ts(hash, conf) {
		let inds = hash.split('.').map(x => parseInt(x))
		return inds.map((x, i) => ({ type: conf[i].type, ind: x, ...conf[i].values[x] }))
	},

	/**
	 * Заполняет характеристики в виде полей (traits[0] = {type:'background', value: 'green'} => traits.background = 'green')
	 * @param { [{type, value}] } traits
	 */
	traits2props(traits) {
		let copy = Object.assign({}, traits)
		traits.forEach(t => copy[t.type] = t.value);
		return copy
	},

	/**
	 * Сгенерировать json описание по чертам.
	 * @param {string} template Шаблон для заполнения черт (Handlebars).
	 * @param {[{type:string, value:string}]} traits Наборт черт
	 * @param {string} img_url URL картинки.
	 * @returns {json} Файл шаблона для ipfs.
	 */
	build_nft_json(template, traits, img_url) {
		let render = Handlebars.compile(template)
		Handlebars.registerHelper('ifis', (k, v, t, f) => k == v ? t : f)
		let parsed = render({ traits: this.traits2props(traits) })
		let json = JSON.parse(parsed)
		json.image = img_url
		json.properties.files = [{ uri: json.image, type: "image/png" }]
		json.category = "image/png"
		json.attributes = traits.map(x => ({ trait_type: x.type, value: x.value }))

		return json






		let tpl = JSON.parse(JSON.stringify(template))

		tpl.attributes = trait_set.map(x => ({ "trait_type": x.type, "value": x.value }))

		tpl.image = `${index}.png`
		tpl.properties.files = [
			{
				uri: `${index}.png`,
				type: "image/png"
			}
		]
		return tpl

		// fs.writeFileSync(`${out_dir}/${index}.json`, JSON.stringify(tpl, '\t', 2))
	},

	/**
	 * Построить картику по характиристикам и слоям.
	 * @param { [ {img} ]} trait_set 
	 * @returns {jimp}
	 */
	async build_nft_image(trait_set) {
		let result = await jimp.read(`${trait_set[0].img}`)
		for (let k in trait_set) {
			let tr = trait_set[k]
			let img = await jimp.read(`${tr.img}`)
			result.blit(img, 0, 0)
		}

		return result //await result.write(out_file)
	}
}