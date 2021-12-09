const fs = require("fs");
const path = require("path");
const jimp = require("jimp");

module.exports = {
	/**
	 * Готовит папку под данные. Удаляет из нее все файлы. Создает если ее нет.
	 * @param {*} out_dir
	 */
	prepare_dir(out_dir) {
		if (fs.existsSync(out_dir)) fs.rmdirSync(out_dir, { recursive: true, force: true });
		if (!fs.existsSync(out_dir)) fs.mkdirSync(out_dir, { recursive: true, force: true });
	},

	async resize_image(file, w, h) {
		let result = await jimp.read(file);
		return result.resize(w, h).write(file);
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

	build_nft_json(trait_set, source, out_dir, index) {
		let tpl = JSON.parse(JSON.stringify(source));

		tpl.attributes = trait_set.map((x) => ({ trait_type: x.type, value: x.value }));

		tpl.image = `${index}.png`;
		tpl.properties.files = [
			{
				uri: `${index}.png`,
				type: "image/png",
			},
		];

		fs.writeFileSync(`${out_dir}/${index}.json`, JSON.stringify(tpl, "\t", 2));
	},

	/**
	 *
	 * @param { [ {img: String} ]} trait_set Слои которые надо собрать (в пордяке наложения от нижнего к верхнему)
	 * @param { String } sprites_dir Папка с подпапками спрайтов или null если заданы абсолютные пути к спрайтам.
	 * @param { String } filename Выходной файл.
	 */
	async build_nft_image(trait_set, sprites_dir, out_file) {
		let fn = (f) => (path.isAbsolute(f) ? f : path.resolve(sprites_dir, f));

		let result = await jimp.read(fn(trait_set[0].img));
		for (let k in trait_set) {
			let tr = trait_set[k];
			let img = await jimp.read(fn(tr.img));
			result.blit(img, 0, 0);
		}
		return result.write(out_file);
	},
};
