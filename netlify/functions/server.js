const express = require('express');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const cookieSession = require('cookie-session');
const serverless = require('serverless-http');
const router = express.Router();

require('dotenv').config();

const app = express();

const privateKey = fs.readFileSync('ssl/privatekey.pem', 'utf8');
const certificate = fs.readFileSync('ssl/certificate.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

const productionURL = process.env.PRODUCTION_URL;

const corsOptions = {
	origin: function (origin, callback) {
		if (nodeEnv === 'development') {
			callback(null, true);
		} else {
			const allowedOrigin = productionURL;
			if (origin === allowedOrigin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		}
	},
	credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cookieSession({
		name: 'jwt',
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
	httpsServer.listen(PORT, () => {
		console.log(`HTTPS Server running locally on port ${PORT}`);
	});
} else if (nodeEnv === 'production') {
	app.use('/.netlify/functions/server', router);
	module.exports.handler = serverless(app);
} else {
	console.log(
		`Error: NODE_ENV must be set to either 'development' or 'production'.`
	);
}
