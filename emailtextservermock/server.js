
var fs = require('fs');
var request = require("request");
var service_addresses = fs.readFileSync(__dirname + '/../serviceaddresses.json','utf8');
var emailserveraddress;
var jobrunneraddress;
var authserveraddress;
var userdbaddress;
var emailreceiptaddress;

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

/*


Email/Text Server API (backed by Bandwidth Messaging API)
	-send email(emailaddress,message)
	-send SMS (phonenumber, message)

*/

var express = require('express');
var app = express();

function send_email(emailaddress, message){
	needle
  .post(emailreceiptaddress + "/receiveemail", {message:message}, { multipart: false})
}


function send_SMS(phone, message){
	needle
  .post(emailreceiptaddress + "/receiveSMS", {message:message}, { multipart: false})
}

app.get("/",function(res,res){
	res.send("Mock email server running");
})


app.post("/send_email",function(req,res){
	var email = req.body.email;
	var message = req.body.message;
	send_email(email,message);
	res.send("Email sent");
});

app.post("/send_sms",function(req,res){
	var phone = req.body.phone;
	var message = req.body.message;
	send_email(email,message);
	res.send("Message sent");
});


app.listen(4000);
