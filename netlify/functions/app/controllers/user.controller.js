const User = require('../models/user.model');
const Film = require('../models/film.model');

exports.userBoard = async (req, res) => {
	try {
		const userId = req.userId;
		const user = await User.findById(userId).populate('films.film');

		if (!user) {
			return res.status(404).send({ message: 'User not found.' });
		}

		// Get all films
		const allFilms = await Film.find().sort({ rank: 1 });

		// Create a map of seen films for quick lookup
		const seenFilmsMap = new Map(
			user.films.map((f) => [f.film._id.toString(), f.seen])
		);

		// Prepare the response with the seen status
		const filmsWithSeenStatus = allFilms.map((film) => ({
			_id: film._id,
			title: film.title,
			year: film.year,
			description: film.description,
			metascore: film.metascore,
			rank: film.rank,
			seen: seenFilmsMap.get(film._id.toString()) || false,
		}));

		res.status(200).json({
			username: user.username,
			films: filmsWithSeenStatus,
		});
	} catch (err) {
		res.status(500).send({ message: err.message });
	}
};

exports.adminBoard = (req, res) => {
	res.status(200).send('Admin Content.');
};

exports.moderatorBoard = (req, res) => {
	res.status(200).send('Moderator Content.');
};

exports.allAccess = async (req, res) => {
	try {
		const films = await Film.find().sort({ rank: 1 });
		res.status(200).json(films);
	} catch (err) {
		res.status(500).send({ message: err.message });
	}
};
