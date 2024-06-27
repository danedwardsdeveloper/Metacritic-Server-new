const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const serverless = require('serverless-http');
const router = express.Router();

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cookieSession({
		name: 'dan-session',
		keys: [process.env.JWT_SECRET],
		httpOnly: true,
	})
);

const db = require('./app/models');

const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const cluster = process.env.DB_CLUSTER;
const dbName = process.env.DB_NAME;
const options = process.env.DB_OPTIONS;

const uri = `mongodb+srv://${user}:${password}@${cluster}/${dbName}?${options}`;

db.mongoose
	.connect(uri, {})
	.then(() => {
		console.log('Successfully connect to MongoDB.');
	})
	.catch((err) => {
		console.error('Connection error', err);
		process.exit();
	});

app.get('/', (req, res) => {
	res.json({ message: `Welcome to Dan's user authorisation application.` });
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

const nodeEnv = process.env.NODE_ENV;
console.log(`Environment: ${nodeEnv}`);

if (nodeEnv === 'development') {
	const PORT = 8080;
	app.use('/', router);
	app.listen(PORT, () => {
		console.log(`Server running locally on port ${PORT}`);
	});
} else if (nodeEnv === 'production') {
	app.use('/.netlify/functions/server', router);
	module.exports.handler = serverless(app);
} else {
	console.log(
		`Error: NODE_ENV must be set to either 'development' or 'production'.`
	);
}
