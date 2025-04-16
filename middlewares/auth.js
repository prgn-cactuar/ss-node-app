const { verifyToken } = require("../utils/jwt.util");
const redisClient  = require("../utils/redis.util");

const authenticateJWT = async (req, res, next) => {
	const cache = await redisClient;
	if (!req.header("Authorization")) {
		res.status(403).send("Authorization is missing.");
	}
	const token = req?.header("Authorization").split(" ")[1];
	const decoded = verifyToken(token);
	const hasSession = await cache.get(decoded.id)
	if (decoded && hasSession) {
		req.user = decoded;
		next();
	} else {
		res.status(401).send("Unauthorized.");
	}
};

module.exports = { authenticateJWT };
