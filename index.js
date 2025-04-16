const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");

require("dotenv").config();

const routes = require("./routes/index.route");

const allowedDomains = ["http://localhost:3000"];
const corsOptions = {
	origin: function (origin, callback) {
		if (allowedDomains.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// parse json body
app.use(express.json());

// init routes
routes(app);

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
