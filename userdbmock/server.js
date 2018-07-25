"use strict";
/*

User DB (backed by Heroic postgres)
{username:{int budget, string plaid accesstoken, string phonenumber, string email, bool notificationsActive}}

	createUser
	getUser
	updateUser
	deleteUser
	getAllUsers



*/
var express = require("express");
var app = express();

class User{
	constructor(email,phonenumber,budget,accesstoken,itemid){
		this.email = email;
		this.phonenumber = phonenumber;
		this.budget = budget;
		this.accesstoken = accesstoken;
		this.itemid = itemid;
	}
}


class mockDB{
	constructor(){
		this.storage = {};
	}

	addUser(username,userobj){
		if(this.storage[username] !== undefined){
			return "User already exists; cant overwrite";
		} else {
			this.storage[username] = new User(userobj.email,userobj.phonenumber,userobj.budget,userobj.accesstoken);
			return "Saved";
		}
	}

	getUser(username){
		return this.storage[username];
	}

	updateUser(username,userobject){
		if(this.storage[username] === undefined){
			return "User doesnt exist";
		} else {
			var userObjInDb = this.storage[username];
			Object.keys(userObjInDb).forEach(function(key){
				if(userobject[key] !== undefined){
					userObjInDb[key] = userobject[key];
				}
			})
			return "Updated";
		}
	}

	deleteUser(){
		if(this.storage[username] === undefined){
			return "User doesnt exist";
		} else {
			delete this.storage[username];
			return "Deleted";
		}
	}

	getAllUsers(){
		return Object.keys(this.storage);
	}
}

var db = new mockDB();

app.get("/",function(req,res){
	res.send("DB Server running");
})


app.post("/createUser",function(req,res){
	var username = req.body.username;
	var userobj = JSON.parse(req.body.userobj);
	var response = mockDB.addUser(username,userobj);
	res.send(response);
})

app.get("/getUser",function(req,res){
	var username = req.params.username;
	var response = db.getUser(username);
	res.send(response);
})

app.post("/updateUser",function(req,res){
	var username = req.body.username;
	var userobj = JSON.parse(req.body.userobj);
	var response = mockDB.updateUser(username,userobj);
	res.send(response);
})

app.post("/deleteUser",function(req,res){
	var username = req.body.username;
	var response = mockDB.deleteUser(username,userobj);
	res.send(response);
})

app.get("/getAllUsers",function(req,res){
	var response = mockDB.getAllUsers();
	res.send(response);
})


console.log("Running userdb mock")
app.listen(7000)