/*
Job Runner/Message Sending Service (heroku)

Userdata class {string username, string budget, array transactions,string phone, string email, string message}

	-sumUserTransactions(transactionarray){
		return sum
	}
	-getUserMoneyRemaining(budget,transactionsum){
	return money remaining
	}

	-IsPlaidStillActive(username){
		-grab accesstoketnfromdb, hid plaid API to see if it still works
		-if its not there or it doesn’t work return false;
		-else true;
	}

	-IsUserPresentInDB(username){
		check-presence in DB
	}

	-SaveAllDataButAccessTokenInDB(username,budget,phone,email)

generateUserDataObjectIncludingTransactions(username,cb(userdataincludingtransactions)){
		Query db for user data, save access token, budget, email, phone
		-Get user transactions for the day from plaidAPI using token
		-Generate string message
		run cb on user-object containing transactions, message, everything

	}

	-generateUserMessage(userdata){
		-Sum transactions using Getmoneyspenttoday
		-Get money remaining using getUserMoneyRemaining
		return message as string
	}

	-setActiveNotificationsToFalse(){
	-hits db to set active notifications to false
}

	-SendMessage(username){
	generate user data object using username and then 
	use sendMessageAPI to send message with phone number and string message from userobject
}
	- (Do this 4 times a day) SendMessagesJob(){
		-getAllUsernames from db, store in an array
		-run sendMessage for each one
	}

	-getMessageForApp(username){
		-get user data object and return as stringified JSON
	}

*/

/*

Needle request library examples:

var needle = require('needle');
 
needle.get('http://www.google.com', function(error, response) {
  if (!error && response.statusCode == 200)
    console.log(response.body);
});


var data = {
  file: '/home/johnlennon/walrus.png',
  content_type: 'image/png'
};


needle
  .post('https://my.server.com/foo', data, { multipart: true })
  .on('readable', function() {  })
  .on('done', function(err, resp) {
    console.log('Ready-o!');
  })

*/

var express = require("express");
var app = express();
var fs = require("fs");

var service_addresses = fs.readFileSync(__dirname + '/../serviceaddresses.json','utf8');
var emailserveraddress;
var jobrunneraddress;
var authserveraddress;
var userdbaddress;
var emailreceiptaddress;

function getCurrentDate(){};

var current_date = '2017-07-24'

var needle = require("needle");

function set_service_addresses_from_json(data) {
  console.log(typeof data)
  obj = JSON.parse(data);
  console.log(obj);

  emailserveraddress = obj["emailtextserver"]
  jobrunneraddress = obj["jobrunner"]
  authserveraddress = obj["authserver"]
  userdbaddress = obj["userdb"]
  emailreceiptaddress = obj["emailreceipt"]

  console.log(emailserveraddress,jobrunneraddress,authserveraddress,userdbaddress,emailserveraddress)
}

set_service_addresses_from_json(service_addresses);


class UserData{
	constructor(username,budget,transactions,phone,email,message){
		this.username = username;
		this.budget = budget;
		this.transactions = transactions;
		this.phone = phone;
		this.email = email;
		this.message = message;
	}
}

var dbWrapper = {
	createUser:function(username,userobj,cb){
		needle.post(userdbaddress + "/createUser",{username:username,userobj:userobj}).on('done',function(err,res){
			cb(res);
		})
	},
	getUser:function(username,cb){
		needle.get(userdbaddress + "/getUser&username=" + username ,function(err,res){
			cb(res);
		})
	},
	updateUser:function(username,userobj,cb){
		needle.post(userdbaddress + "/updateUser",{username:username,userobj:userobj}).on('done',function(err,res){
			cb(res);
		})
	},
	deleteUser:function(username){
		needle.post(userdbaddress + "/deleteUser",{username:username}).on('done',function(err,res){
			cb(res);
		})
	},
	getAllUsers:function(cb){
		needle.get(userdbaddress + "/getAllUsers",function(err,res){
			cb(res);
		})
	}
	

}



function getPlaidTransactions(accesstoken,cb){
	var client_id = "test";
	var secret = "test";
	var access_token = accesstoken;
	var start_date = current_date;
	var end_date = current_date;
	var options = {count:250,offset:100};

	var data_obj = {
		client_id:client_id,
		secret:secret,
		access_token:access_token,
		start_date:start_date,
		end_date:end_date,
		options:options
	}


	needle.post('https://sandbox.plaid.com/transactions/get',data_obj).on('done',function(err,res){
		cb(res);
	})
}

var db = dbWrapper;

function sumUserTransactions(transactionarray){
	var sum = 0;
	transactionarray.forEach(function(transaction){
		sum+= transaction.amount;
	})
	return sum;
}

function getMoneyRemainining(budget,amountspent){
	return budget-amountspent;
}

function saveAllDatabutAccessToken(username,userobj,cb){
	db.createUser(username,userobj,cb)
}

function isPlaidStillActive(username,cb){
	//check if plaid is still active
}

function isUserPresentInDB(username,cb){
	db.getUser(username,function(res){
		cb(res);
	})
}

function saveAccessToken(username,token,cb){
	db.updateUser(username,{accesstoken:token},function(res){
		cb(res);
	})
}

function generateUserMessage(userdata){
	var transactions = userdata.transactions;
	var moneyspenttoday = sumUserTransactions(transactions);
	var budget = userdata.budget;
	var money_remaining = getMoneyRemainining(budget,moneyspenttoday);
	return "You have spent " + moneyspenttoday + " of your " + budget + " budget. You have " + money_remaining + " remaining";
}

function generateUserDataObjIncludingTransactions(username,cb){
	db.getUser(username,function(userdata){
		var accesstoken = userdata.accesstoken
		getPlaidTransactions(accesstoken,function(transactions){
			var transactions = JSON.parse(transactions);
			userdata[transactions] = transactions;
			var message = generateUserMessage(userdata);
			userdata[message] = message;
			cb(userdata);
		});
	})
}

function sendMessageViaMessageAPI(phone,email){
	needle.post('https://sandbox.plaid.com/transactions/get',data_obj).on('done',function(err,res){
		cb(res);
	})
}

function sendMessage(username){
	generateUserDataObjIncludingTransactions(username,function(userdata){
		var phone = userdata.phonenumber;
		var email = userdata.email;
		var message = userdata.message;
		var obj = {username:username,email:email,message:message,phone:phone};

		needle.post(emailserveraddress + "/send_email",obj).on('done',function(err,res){
			console.log(res);
		})
	})
}

function add_access_token(username,accesstoken,cb){
	db.updateUser(username,{accesstoken:accesstoken},function(dbres){
		cb(dbres);
	})
}

function getMessageForApp(username,cb){
	generateUserDataObjIncludingTransactions(username,function(userdata){
		var message = userdata.message;
		cb(message);
	})
}

function sendAllMessagesJob(){
	db.getAllUsers(function(user_names_array_json){
		var users = JSON.parse(user_names_array_json);
		users.forEach(function(username){
			sendMessage(username);
		})
	})
}

app.get("/",function(req,res){
	res.send("Job runner server running");
})

app.get("/is_plaid_active",function(req,res){
	var username = req.params.username;

	isPlaidStillActive(username, function(bool){
		res.send(bool);
	})
})

app.get("/is_user_present",function(req,res){
	var username = req.params.username;
	
	isUserPresentInDB(username, function(string){
		res.send(string);
	})
})

app.post("/create_user",function(req,res){
	var username = req.body.username;
	var budget = req.body.budget;
	var phone = req.body.phone;
	var email = req.body.email;
	var userobj = {username:username,budget:budget,phone:phone,email:email};
	saveAllDatabutAccessToken(username,userobj,function(dbres){
		res.send(dbres);
	})
})



app.get("/get_message",function(req,res){
	var username = req.username;
	getMessageForApp(username,function(message){
		res.send(message);
	})
})

app.post("/add_access_token",function(req,res){
	var username = req.body.username;
	var accesstoken = req.body.accesstoken;

	saveAccessToken(username,accesstoken,function(dbres){
		res.send(dbres);
	})
})

app.listen(5000);