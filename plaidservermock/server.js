var express = require("express");
var app = express();
var needle = require("needle");
var plaid = require("plaid");
var bodyParser = require('body-parser');



var fs = require("fs");

var plaid_params = JSON.parse(fs.readFileSync(__dirname + "/plaidsecrets.json"));

console.log(plaid_params)

var client = new plaid.Client(
  plaid_params.client_id,
  plaid_params.secret,
  plaid_params.public_key,
  plaid.environments.sandbox
);


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var service_addresses = fs.readFileSync(__dirname + '/../serviceaddresses.json','utf8');
var emailserveraddress;
var jobrunneraddress;
var authserveraddress;
var userdbaddress;
var emailreceiptaddress;

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





app.get("/plaid_login",function(req,res){
	var html = fs.readFileSync(__dirname + "/plaid.html","utf-8");
	console.log(html);
	var username = req.params.username;
	html = html.replace("{{{username}}}",'"' + username + '"');
	res.send(html);
})

app.get("/",function(req,res){
	res.send("Plaid server running");
})

app.post("/save_access_token",function(req,response){
	var PUBLIC_TOKEN = req.body.public_token;
	console.log(req.body);
	console.log(PUBLIC_TOKEN);
	console.log("HERHE")
	var username = req.body.username;

	client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {
	    if (error != null) {
	      var msg = 'Could not exchange public_token!';
	      console.log(msg + '\n' + JSON.stringify(error));
	      return response.json({
	        error: msg
	      });
	    }
	    ACCESS_TOKEN = tokenResponse.access_token;
	    ITEM_ID = tokenResponse.item_id;
	    console.log('Access Token: ' + ACCESS_TOKEN);
	    dbWrapper.updateUser(username,{accesstoken:ACCESS_TOKEN,item_id:ITEM_ID},function(dbResp){
	    	console.log(dbResp);
	    })
	    console.log('Item ID: ' + ITEM_ID);
	    response.json({
	      'error': false
	    });
  	});

	
})

app.listen(9000)