
// scrape button
$("document").on("click", "#scrape", function() {
	$.ajax({

		method: "GET",
		url: "/scrape"
	}).then(function(data) {
		console.log(data)
		window.location = "/"
	})
})


// save article button
$("document").on("click", ".save", function() {
	console.log("save button clicked")
	var thisId = $(this).attr("data-id");
	$.ajax({
		method: "POST",
		url: "/articles/save/" + thisId
	})
	.then(function(data) {
		console.log("article saved")
		window.location = "/"
	})
})

// delete article button
$("document").on("click", ".delete", function() {
	var thisId = $(this).attr("data-id");
	$.ajax({
		method: "POST",
		url: "/articles/delete" + thisId
	}).then(function(data) {
		window.location = "/articles/saved"
	})
})


// /// single article view
// $("document").on("click", "h2", function() {
// 	var thisId = $(this).attr("data-id");
// 	$.ajax({
// 		method: "GET",
// 		url: "/articles/" + thisId
// 	})
// 	.then(function(data) {
// 		console.log("article")

// 	})
// })


// save note button
$("document").on("click", ".savenote", function() {
	var thisId = $(this).attr("data-id");

	$.ajax({
		method: "POST",
		url: "/articles/note/" + thisId,
		data: {
			name: $("#note-name" + thisId).val().trim()
			body: $("#note-body" + thisId).val().trim()
		}
	}).then(function(data) {
		console.log(data);

		$("#note-name" + thisId).val("");
		$("#note-body" + thisId).val("");
		$(".note-modal" + thisId).val("");
		window.location = "/articles/" + thisId;
	})

});



// // save note button
// $("document").on("click", ".savenote", function() {

// 	var thisId = $(this).attr("data-id");
// 	$.ajax({
// 		method: "POST",
// 		url: "/articles/note/" + thisId,
// 		data: {
// 			body: $("#bodyinput" + thisId).val()
// 		}
// 	})

// 	.then(function(data) {
// 		console.log(data);

// 		//empty notes section
// 		$("#bodyinput" + thisId).val("");
// 		window.location = "/articles/note/" + thisId;
// 	});


// })


// delete note button
$("document").on("click", ".delete-note", function() {
	var note_id = $(this).attr("data-note-id");
	var article_id = $(this).attr("data-article-id");
	$.ajax({
		method: "DELETE",
		url: "/notes/delete/" + note_id + "/" + article_id
	}).then(function(data) {
		console.log(data)
		$(".note-modal").modal("hide");
		window.location = "/articles/" + article_id;
	})
	console.log("deleted!")

})







