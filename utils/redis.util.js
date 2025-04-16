const redis = require("redis");
const client = redis
	.createClient()
	.on("error", (err) => {
		console.error("Redis error:", err);
	})
	.connect();

module.exports = client;