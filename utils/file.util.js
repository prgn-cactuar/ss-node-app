const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "data");

const readFile = (filename) => {
	const filePath = path.join(dataPath, filename);
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(JSON.parse(data));
		});
	});
};

const writeFile = (filename, content) => {
	const filePath = path.join(dataPath, filename);
	return new Promise((resolve, reject) => {
		fs.writeFile(
			filePath,
			JSON.stringify(content, null, 2),
			"utf8",
			(err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			}
		);
	});
};

module.exports = { readFile, writeFile };
