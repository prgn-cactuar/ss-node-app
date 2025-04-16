const express = require("express");
const { authenticateJWT } = require("../middlewares/auth");
const { readFile, writeFile } = require("../utils/file.util");
const { v4: uuid } = require("uuid");

module.exports = (router) => {
	// Get all users
	router.get("/users", authenticateJWT, async (req, res) => {
		try {
			const users = await readFile("users.json");

			const mappedUsers = users.map(({ id, username, firstName, lastName }) => {
				return {
					id,
					username,
					firstName,
					lastName,
				};
			});

			res.json(mappedUsers);
		} catch (err) {
			res.status(500).send("Error getting users");
			console.error(err);
		}
	});

	// Create user
	router.post("/user", authenticateJWT, async (req, res) => {
		const { username, password, firstName, lastName } = req.body;
		try {
			const users = await readFile("users.json");
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = {
				id: uuid(),
				username,
				password: hashedPassword,
				firstName,
				lastName,
			};
			users.push(newUser);
			await writeFile("users.json", users);
			res.status(201).send("User created");
		} catch (err) {
			res.status(500).send("Error creating user");
			console.error(err);
		}
	});

	// Read user
	router.get("/user/:id", authenticateJWT, async (req, res) => {
		try {
			const users = await readFile("users.json");
			const user = users.find(
				(user) => user.id === req.params.id
			);
			if (user) {
				res.json({ firstName: user.firstName, lastName: user.lastName });
			} else {
				res.status(404).send("User not found");
			}
		} catch (err) {
			res.status(500).send("Error reading user");
			console.error(err);
		}
	});

	// Update user
	router.put("/user/:id", authenticateJWT, async (req, res) => {
		const { firstName, lastName } = req.body;
		try {
			const users = await readFile("users.json");
			const userIndex = users.findIndex(
				(user) => user.id === req.params.id
			);
			if (userIndex !== -1) {
				users[userIndex].firstName = firstName;
				users[userIndex].lastName = lastName;
				await writeFile("users.json", users);
				res.send("User updated");
			} else {
				res.status(404).send("User not found");
			}
		} catch (err) {
			res.status(500).send("Error updating user");
			console.error(err);
		}
	});

	// Delete user
	router.delete("/user/:id", authenticateJWT, async (req, res) => {
		try {
			const users = await readFile("users.json");
			const userIndex = users.findIndex(
				(user) => user.id === req.params.id
			);
			if (userIndex !== -1) {
				users.splice(userIndex, 1);
				await writeFile("users.json", users);
				res.send("User deleted");
			} else {
				res.status(404).send("User not found");
			}
		} catch (err) {
			res.status(500).send("Error deleting user");
			console.error(err);
		}
	});

	router.get("/me", authenticateJWT, async (req, res) => {
		const { id: loggedInUser } = req.user;
		try {
			const users = await readFile("users.json");
			const userIndex = users.findIndex(
				(user) => user.id === loggedInUser
			);

			if (userIndex !== -1) {
				const { id, firstName, lastName } = users[userIndex];
				res.json({ id, firstName, lastName });
			} else {
				res.status(404).send("Invalid auth");
			}
		} catch (err) {
			res.status(500).send("Error getting user profile");
			console.error(err);
		}
	});
};
