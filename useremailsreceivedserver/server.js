var express = require("express");
var app = express();

app.post("/receiveemail",function(req,res){
	var message = req.body.message;
	console.log(message);
})

app.post("/receivesms",function(req,res){
	var message = req.body.message;
	console.log(message);
})


app.listen(8000)