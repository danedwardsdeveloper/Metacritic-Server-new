exports.allAccess = (req, res) => {
	res.status(200).send('Public Content.');
};

exports.userBoard = (req, res) => {
	res.status(200).send('User Content.');
};

exports.adminBoard = (req, res) => {
	res.status(200).send('Admin Content.');
};

exports.moderatorBoard = (req, res) => {
	res.status(200).send('Moderator Content.');
};

const Film = require('../models/film.model.js');

exports.allAccess = async (req, res) => {
	try {
		const films = await Film.find().sort({ rank: 1 });
		res.status(200).json(films);
	} catch (err) {
		res.status(500).send({ message: err.message });
	}
};
