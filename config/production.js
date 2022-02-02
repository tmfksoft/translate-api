module.exports = {
	google: {
		projectId: process.env["PROJECT_ID"],
		apiKey: process.env["API_KEY"],
	},
	httpd: {
		port: process.env["PORT"]
	},
	allowedKeys: process.env["ALLOWED_KEYS"].split(":"),
	sentry: {
		dsn: process.env["SENTRY_DSN"]
	}
};