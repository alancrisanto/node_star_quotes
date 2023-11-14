const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const PORT = process.env.PORT ?? 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(process.env.DATABASE).then((client) => {
	console.log("Connected to Mongodb");
	const db = client.db("StartQuotes");
	const quotesCollection = db.collection("quotes");

	app.get("/", (req, res) => {
		// res.sendFile(__dirname + "/index.html");

		// Get the quotes collection
		quotesCollection
			.find()
			.toArray()
			.then((quote) => {
				res.render("index.ejs", { quotes: quote });
			})
			.catch((err) => console.error(err));
	});

	app.post("/quotes", (req, res) => {
		quotesCollection
			.insertOne(req.body)
			.then((result) => {
				res.redirect("/");
			})
			.catch((err) => console.error(err));
	});

	app.put("/quotes", (req, res) => {
		console.log(req.body);
		quotesCollection
			.findOneAndUpdate(
				{ name: "Yoda" },
				{
					$set: {
						name: req.body.name,
						quote: req.body.quote,
					},
				},

				{ upsert: true }, //means: Insert a document if no documents can be updated.
			)
			.then((result) => {
				res.json("success");
			})
			.catch((err) => {
				console.log(err);
			});
	});

	app.delete("/quotes", (req, res) => {
		quotesCollection
			.deleteOne({ name: req.body.name })
			.then((result) => {
				if (result.deletedCount === 0) {
					return res.json("No quote to delete");
				}
				res.json(`Deleted Darth Vader's quote`);
			})
			.catch((error) => console.error(error));
	});
});

app.listen(PORT, () => {
	console.log("listening on port " + PORT);
});
