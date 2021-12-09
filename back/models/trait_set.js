const fs = require('fs');
const path = require('path');

/**
 * Генератор токенов (json + png)
 */
class TraitSet {
	/**
	 * Параметры особенностей.
	 * @param { [{type: string, values: [{rate, value, img}]}] } traits Характеристики
	 * @param {string*} dir Папка с файлами
	 */
	constructor(traits, dir) {
		this.traits = traits
		this.dir = path.resolve(dir)
	}

	/**
	 * Удаляет из набора черт системную информацию. Чистые данные можно лить в ipfs.
	 * @param {*} traits 
	 */
	static clean_traits(traits) {
		return traits.map(x => ({ type: x.type, value: x.value }))
	}

	/**
	 * Получить текст шаблона для данной коллекции.
	 * @returns 
	 */
	template(){
		return fs.readFileSync(`${this.dir}/template.json`).toString()
	}

	/**
	 * Читате папку с файлами спрайтов и строит конфигурацию исходя их имен их файлов.
	 * @param { String } path Путь к папке со спрайтами.
	 * @returns { TraitSet }
	 */
	static fromDir(dir) {		
		dir = path.resolve(dir)
		if (!fs.existsSync(dir)) throw `Directory does not exists ${dir}`;

		if (!fs.existsSync(dir)) throw `${dir} not found`;
		// if (!path.isDirectory(dir)) throw `${dir} is not a directory`;

		let dirs = fs.readdirSync(dir, {
			withFileTypes: true
		}).filter(x => x.isDirectory())

		let traits = dirs.map(d => {
			let [z, name] = d.name.split('-')
			if (!name) [z, name] = d.name.split('_')
			if (!name) throw 'Sprites folder name must have name in format zindex-name or zindex_name'

			return {
				z: parseInt(z),
				type: name,
				values: fs.readdirSync(`${dir}/${d.name}`, {
					withFileTypes: true
				}).filter(x => !x.isDirectory()).map(x => (parseTraitImageFilename(x.name))).map(x => ({
					...x,
					img: path.resolve(`${dir}/${d.name}/${x.img}`)
				}))
			}
		})

		traits = traits.sort((a, b) => a.z - b.z)
		traits.forEach(x => delete x.z)

		return new module.exports(traits, dir)
	}

	/**
	 * Строит конфигурацию по файл traits.json и файлов в его папке.
	 * @param {String} filename Путь к файлу traits.json
	 */
	static fromTraitsFile(filename) {
		return new module.exports(require(filename), path.dirname(filename))
	}

	/**
	 * Проверить все ли файлы на месте.
	 * @param {string} dir Папка с файлами слоев. Если null, то проверяет папку откуда был создан через fromDir, fromTraitsFile.
	 * @returns 
	 */
	checkFiles(dir = null) {
		dir = dir || this.dir

		let res = {
			ok: [],
			error: []
		}

		for (let i = 0; i < this.traits.length; i++) {
			let tr = this.traits[i]
			for (let j = 0; j < tr.values.length; j++) {
				let filename = !path.isAbsolute(tr.values[j].img) ? path.resolve(`${dir}/${tr.values[j].img}`) : tr.values[j].img
				let v = {
					type: this.traits[i].type,
					value: tr.values[j].value,
					file: filename
				}
				if (fs.existsSync(filename)) {
					res.ok.push(v)
				} else
					res.error.push(v)
			}
		}

		return res
	}


	/**
	 * Сколько всего возможных комбинаций.
	 */
	total_traits() {
		return this.traits.reduce((s, c) => s * c.values.length, 1)
	}

	_set_of(index) {
		if (index < 0) index = 0;
		if (index >= this.total_traits()) index = this.total_traits() - 1;

		let set = []
		for (let i = 0; i < this.traits.length; i++) {
			let tag = index % this.traits[i].values.length
			set.push(tag)
			index = (index - tag) / this.traits[i].values.length;
		}
		return set;
	}

	/**
	 * Получить набор характеристик по индексу.
	 * @param { integer } index 
	 */
	index2trs(index) {
		let set = this._set_of(index)
		let traits = []
		for (let i = 0; i < this.traits.length; i++) {
			traits.push({
				type: this.traits[i].type,
				...this.traits[i].values[set[i]]
			})
		}
		return traits
	}

	/**
	 * Получить индекс набора характеристик.
	 * @param { Object } tr
	 */
	trs2index(tr) {
		let hash = this.trs2hash(tr)
		let inds = hash.split('.').map(x => parseInt(x))

		let mults = []
		let num = 1
		for (let i = 0; i < this.traits.length; i++) {
			mults.push(num)
			num *= this.traits[i].values.length
		}

		return inds.reduce((s, c, i) => s + c * mults[i])
	}

	_valueIndex(type, value) {
		return type.values.findIndex(x => x.value == value)
	}

	trs2hash(ts) {
		return ts.map((x, i) => this._valueIndex(this.traits[i], x.value)).join('.')
	}

	hash2trs(hash) {
		let inds = hash.split('.').map(x => parseInt(x))
		return inds.map((x, i) => ({
			type: this.traits[i].type,
			ind: x,
			...this.traits[i].values[x]
		}))
	}

	/**
	 * Получить случайный(с учетом Rate) набор характеристик.
	 * @returns { Object }
	 */
	get_random_trs() {
		let traits = []
		for (let k in this.traits) {
			let trait = this.traits[k]

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

			traits.push({
				type: trait.type,
				...value,
				ind: parseInt(ind)
			})
		}

		return traits
	}

	/**
	 * Получить случайный(с учетом Rate) хеш набора характеристик.
	 * @returns { Object }
	 */
	get_random_hash() {
		let traits = []
		for (let k in this.traits) {
			let trait = this.traits[k]

			let rate_sum = trait.values.reduce((s, c) => s + c.rate, 0)
			let rnd = Math.random() * rate_sum;

			let ind
			for (let kk in trait.values) {
				if (rnd <= trait.values[kk].rate) {
					ind = kk
					break
				}
				rnd -= trait.values[kk].rate
			}

			traits.push(parseInt(ind))
		}
		return traits.join('.')
	}

	/**
	 * Получить пакет случайных конфигов.
	 * @param {integer} number Сколько конфигов создать.
	 * @param { bool } unique Все конфиги уникальны
	 * @param { bool } use_rate Учитывать rate при генерации.
	 */
	get_random_pack(number, unique = true) {
		if (unique && (number < 0 || number > this.total_traits() * 0.95)) throw 'When unique needs 0 < Number < 95%!'

		let hashes = unique ? new Set() : []
		let add = unique ? x => hashes.add(x) : x => hashes.push(x)
		let size = unique ? () => hashes.size : () => hashes.length

		while (size() < number) {
			add(this.get_random_hash())
		}

		return Array.from(hashes).map(x => this.hash2trs(x))
	}

	/**
	 * Получить пути всех картинок в виде массива.
	 */
	get_plain_traits() {
		return this.traits.reduce((s, c) => [...s, ...c.values.map(x => { x.type = c.type; return x })], [])
	}
}


/**
 * 
 * @param {String} filename 
 * @returns 
 */
function parseTraitImageFilename(filename) {
	let [value, rate] = filename.slice(0, filename.length - 4).split('-')
	return {
		value,
		rate: rate ? parseInt(rate) : 100,
		img: filename
	}
}

module.exports = TraitSet