const User = require('../models/user.model');
const Film = require('../models/film.model');

exports.userBoard = async (req, res) => {
	try {
		const userId = req.userId;
		const user = await User.findById(userId).populate('films.film');

		if (!user) {
			return res.status(404).send({ message: 'User not found.' });
		}

		const allFilms = await Film.find().sort({ rank: 1 });

		const seenFilmsMap = new Map(
			user.films.map((f) => [f.film._id.toString(), f.seen])
		);

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

exports.toggleFilmStatus = async (req, res) => {
	try {
		const userId = req.userId;
		const filmId = req.body.filmId;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).send({ message: 'User not found.' });
		}

		const film = await Film.findById(filmId);
		if (!film) {
			return res.status(404).send({ message: 'Film not found.' });
		}

		const filmStatus = user.films.find(
			(film) => film.film.toString() === filmId
		);

		if (filmStatus) {
			filmStatus.seen = !filmStatus.seen;
		} else {
			user.films.push({ film: filmId, seen: true });
		}

		await user.save();
		res.status(200).send({ message: 'Film seen status toggled.' });
	} catch (err) {
		if (err.name === 'CastError') {
			return res.status(400).send({ message: 'Invalid film ID provided.' });
		} else if (err.message.includes('filmId')) {
			return res.status(400).send({ message: 'filmId is required.' });
		} else {
			console.error(err);
			return res.status(500).send({ message: 'Internal server error.' });
		}
	}
};

exports.addOrUpdateNote = async (req, res) => {
	try {
		const userId = req.userId;
		const { filmId, note } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).send({ message: 'User not found.' });
		}

		const film = await Film.findById(filmId);
		if (!film) {
			return res.status(404).send({ message: 'Film not found.' });
		}

		const filmStatus = user.films.find(
			(film) => film.film.toString() === filmId
		);

		if (filmStatus) {
			filmStatus.note = note;
		} else {
			user.films.push({ film: filmId, seen: false, note });
		}

		await user.save();
		res.status(200).send({ message: 'Note added/updated successfully.' });
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
