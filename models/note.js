var mongoose = require("mongoose");
// var Articles = require("./article");

// save a reference to the schema constructor
var Schema = mongoose.Schema;

// using the Schema constructor, create a new NoteSchema object (similar to a Sequelize model)
var NoteSchema = new Schema({

	name: {
		type: String,
		// required: true
	},

	body: {
		type: String,
		// required: true
	},

	article: {
		type: Schema.Types.ObjectId,
		ref: "Articles"
	}
});

// create our model from above schema (using mongoose's model method)
var Notes = mongoose.model("Notes", NoteSchema);

// export note model
module.exports = Notes;