const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const generateToken = (user) => {
	return jwt.sign({ id: user.id, username: user.username }, secret, {
		expiresIn: "1h",
	});
};

const verifyToken = (token) => jwt.verify(token, secret);

module.exports = { generateToken, verifyToken };
