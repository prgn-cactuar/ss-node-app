const { OAuth2Client } = require("google-auth-library");
const googleClientId = process.env.GOOGLE_LOGIN_CLIENT_ID;
const client = new OAuth2Client(googleClientId);

const verifyGoogleToken = async (idToken) => {
	const ticket = await client.verifyIdToken({
		idToken: idToken,
		audience: googleClientId, // Specify the CLIENT_ID of the app that accesses the backend
	});

	return ticket.getPayload();
};

module.exports = { verifyGoogleToken };
