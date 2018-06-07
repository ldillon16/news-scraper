// dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var methodOverride = require("method-override");

// scraping tools
var request = require("request");
var cheerio = require("cheerio");

// requiring all models
var Notes = require("./models/note.js");
var Articles = require("./models/article.js")

// port
var PORT = process.env.PORT || 8080;

// initialize express
var app = express();

app.use(methodOverride("_method"));

// config middleware

// use morgan logger for loggin results
app.use(logger("dev"));
// use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// use express.static to serve the public folder as a static directory
app.use(express.static("public"));



// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongo-scraper-db");




// mongoose.connect("");
// //mongoose.connect("mongodb://localhost/mongo-scraper");
// var db = mongoose.connection;

// // Show any mongoose errors
// db.on("error", function(err) {
//   console.log("Mongoose Error: ", err);
// });

// // Once logged in to the db through mongoose, log a success message
// db.once("open", function() {
//   console.log("The Mongoose connection is successful!");
// });

// set handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes

// homepage route
app.get("/", function(req, res) {
	Articles.find({ "saved": false }, function(err, data) {
	 	var hbsObject = {
	 		Articles: data
	 	};
	 // console.log(hbsObject);
	res.render("homepage", hbsObject);
    })	
});


// GET route for scraping echoJS website
app.get("/scrape", function(req, res) {
	// use request to grab body of html
	request("https://www.nytimes.com/", function(error, response, html) {
		// load html into cheerio with $ as a shorthand selector
		var $ = cheerio.load(html);

		// grab every h2 within an article tag
		$("article h2").each(function(i, element) {
			// save an empty result object
			var result = {};

			// add the text, summary, and href of every link & save them as properties of result object
			result.title = $(this)
				.children("a")
				.text();
			result.summary = $(this)
				.children(".summary")
				.text();
			result.link = $(this)
				.children("a")
				.attr("href");

			// create new article using "result" object built from scraping 
			// Article.create(result)
			// 	.then(function(dbArticle) {
			// 		// display added result in console
			// 		console.log(dbArticle);
			// 	})
			// 	.catch(function(err) {
			// 		// if an error occurs, send it to the client
			// 		return res.json(err);
			// 	});

			var entry = new Articles(result);

			entry.save(function(err, doc) {
				if (err) {
					console.log(err);
				}
				else {
					console.log(doc);
				}
			})
		});

		// if we are able to successfully scrape & save an Article, send a msg to the client
		res.redirect("/")
		console.log("scrape complete!")
	});
});

// GET route for getting article by id
app.get("/articles/:_id", function(req, res) {
	// grab article by id
	Articles.findOne({ "_id": req.params.id })
	// populate notes associated with the article
	.populate("note")
	.then(function(dbArticle) {
		// if we're able to successfully update article, send back to client
			// handlebars 
			var hbsObject = {
			 	Articles: dbArticle
			 };
			// console.log(hbsObject);
			 res.render("article", hbsObject);
	})

	.catch(function(err) {
		// if an error occurred, send to client
		res.json(err);
	});
})

// GET route for getting saved articles
app.get("/articles/saved", function(req, res) {
	// grab every article in the saved Articles collection
	console.log("SAVED");
	Articles.find({ "saved": true })
		.populate("notes")
		.then(function(err, dbArticle) {

			// handlebars 

			var hbsObject = {
			 	Articles: dbArticle
			 };
			// console.log(hbsObject);
			 res.render("saved", hbsObject);
		})

		.catch(function(err) {
			// if an error occurred, send to client
			res.json(err);
		});
});

// POSt route for saving article
app.post("/articles/save/:id", function(req, res) {
	// use article id to find & update its boolean
	Articles.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
		.then(function(err, doc) {
			// send doc to browser
			res.send(doc)
		})
		.catch(function(err) {
			// if an error occurred, send to client
			res.json(err);
		})
});


// DELETE route for deleting article
app.post("/articles/delete/:id", function() {
	// use article _id to find & update saved boolean
	Articles.findOneAndUpdate({ "_id": req.params.id}, { "saved": false }, { "notes": [] })
		.then(function(dbArticle) {
			// if we're able to successfully update article, send back to client
			res.json(dbArticle);
		})

		.catch(function(err) {
			// if an error occurred, send to client
			res.json(err);
		})
});

// POST route for creating new note
app.post("/articles/note/:note_id", function(req, res) {
	// create a new note and pass the req.body to the entry
	var newNote = new Notes({
		name: req.body.name,
		body: req.body.body,
		article: req.params.id
	});
	console.log("newNote")
	// save new note to db
	newNote.save(function(err, note) {
		// check for errors and log them
		if (err) {
			console.log(err)
		}
		else {

		Articles.findOneAndUpdate({ _id: req.params.article_id }, { $push: { "notes": note } }, { new: true })
		
		.then(function(err) {
			if (err) {
				console.log(err);
				// if an error occurred, send it to the client
				res.send(err);
			}
		
			else {

				res.send(note);
			}
		});
		}
	});
});

// DELETE route for deleting note
app.get("/notes/delete/:note_id/:article_id", function(req, res) {
	console.log("deleted!")
	Notes.remove (
		{
			_id: mongojs.ObjectId(req.params.id)
		},
		function(err, removed) {
			// log errors from mongojs
			if (err) {
				console.log(err);
				res.send(err);
			}
			else {
				console.log(removed);
				res.send(removed);
			}
		}
	)
})








// start server
app.listen(PORT, function() {
	console.log("app running on port " + PORT + "!")
});

