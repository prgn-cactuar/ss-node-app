const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt.util");
const { readFile, writeFile } = require("../utils/file.util");
const redisClient  = require("../utils/redis.util");
const { authenticateJWT } = require("../middlewares/auth");
const { v4: UUID } = require("uuid");
const { verifyGoogleToken } = require("../utils/google-auth.util");

module.exports = async (router) => {
	const cache = await redisClient;
	// register
	router.post("/register", async (req, res) => {
		const { username, password, firstName, lastName } = req.body;
		try {
			const users = await readFile("users.json");
			if (users.find((user) => user.username === username)) {
				return res.status(400).send("Username already exists");
			}
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = {
				id: UUID(),
				username,
				password: hashedPassword,
				firstName,
				lastName,
				via: 'APP'
			};
			users.push(newUser);
			await writeFile("users.json", users);
			res.status(201).send("User registered");
		} catch (err) {
			res.status(500).send("Error registering user");
			console.error(err);
		}
	});

	// login
	router.post("/login", async (req, res) => {
		const { username, password } = req.body;
		try {
			const users = await readFile("users.json");
			const user = users.find((user) => user.username === username);
			if (user && (await bcrypt.compare(password, user.password))) {
				const token = generateToken(user);

				const hasUserSession = await cache.get(user.id);
				console.log(user.id)
				console.log(hasUserSession)
				if (!hasUserSession) {
					// save session on redis
					await cache.set(user.id, token, (err) => {
						if (err) {
							return res.status(500).send("Error saving token");
						}
					});
					console.log("*** Session saved ***");
				}

				res.json({ token });
			} else {
				res.status(400).send("Invalid credentials");
			}
		} catch (err) {
			res.status(500).send("Error logging in");
			console.error(err);
		}
	});
	router.post("/google-login", async (req, res) => {
		const { token } = req.body;
		try {
			const decodedToken = await verifyGoogleToken(token);
			if (decodedToken) {
				const users = await readFile("users.json");
				let user = users.find((user) => user.username === decodedToken.email);
				if (!user) {
					const newUser = {
						id: UUID(),
						username: decodedToken.email,
						password: null,
						firstName: decodedToken.given_name,
						lastName: decodedToken.family_name,
						via: 'GOOGLE'
					};
					users.push(newUser);
					await writeFile("users.json", users);

					user = newUser;
				}

				const token = generateToken(user);
	
				const hasUserSession = await cache.get(user.id);
				if (!hasUserSession) {
					// save session on redis
					await cache.set(user.id, token, (err) => {
						if (err) {
							return res.status(500).send("Error saving token");
						}
						console.log("*** Session saved ***");
					});
				}

				res.json({ token });
			} else {
				res.status(401).send("Unauthorized.");
			}
		} catch (err) {
			res.status(500).send("Error logging in");
			console.error(err);
		}
	});

	// Logout route
	router.post("/logout", authenticateJWT, async (req, res) => {
		const { id: loggedInUser } = req.user;
		await cache.del(loggedInUser, (err) => {
			if (err) {
				return res.status(500).send("Error deleting token");
			}

			console.log("*** Session removed. ***");
		});

		res.status(200).send("OK");
	});
};
