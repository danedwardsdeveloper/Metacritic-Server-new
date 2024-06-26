const mongoose = require('mongoose');

const filmStatusSchema = new mongoose.Schema({
	film: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Film',
	},
	seen: { type: Boolean, default: false },
	note: { type: String, default: '' },
});

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		roles: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Role',
			},
		],
		films: [filmStatusSchema],
	},
	{ collection: 'users' }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
