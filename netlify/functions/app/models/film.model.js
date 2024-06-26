const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		year: { type: Number, required: true },
		description: { type: String, required: true },
		metascore: { type: Number, required: true },
		seen: { type: Boolean, required: true },
		rank: { type: Number, required: true },
	},
	{ collection: 'top_films' }
);

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;
