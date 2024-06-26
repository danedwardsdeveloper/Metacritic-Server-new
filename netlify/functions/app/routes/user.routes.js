const { authJwt } = require('../middlewares');
const controller = require('../controllers/user.controller');

module.exports = function (app) {
	app.use(function (req, res, next) {
		res.header(
			'Access-Control-Allow-Headers',
			'Origin, Content-Type, Accept'
		);
		next();
	});

	app.get('/api/all', controller.allAccess);

	app.get('/api/user', [authJwt.verifyToken], controller.userBoard);

	app.post(
		'/api/user/toggle-film',
		[authJwt.verifyToken],
		controller.toggleFilmStatus
	);

	app.post(
		'/api/user/note',
		[authJwt.verifyToken],
		controller.addOrUpdateNote
	);
};
