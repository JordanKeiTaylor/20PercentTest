/*App needs to be able to sign up:

Set user account
	-TESTA: add test username, budget, phone and email to db ("test1",5000,9737689820,"testemail@gmail.com")
	-TESTB: check if they are present (Should receive above information)
	-TESTC: check if plaid can provide html, upon html signing in, add access token to fake user account (Should receive html file matching this one)
	-TESTD: check if access token is present in user account
	-TESTE: test is jobrunner, using access token, can get the transactions back
	-TESTF: check if jobrunnermock when given test username, returns an accurate message for that username
	-TESTG: check if email server receives emails every 5 minutes from job runner


*/

var express = require("express");
var app = express();
var fs = require("fs");
var needle = require("needle")
var casper = require("casper");
casper = casper.create();

var service_addresses = fs.readFileSync(__dirname + '/serviceaddresses.json','utf8');
var emailserveraddress;
var jobrunneraddress;
var authserveraddress;
var userdbaddress;
var emailreceiptaddress;
var plaidaddress;

function set_service_addresses_from_json(data) {
  console.log(typeof data)
  obj = JSON.parse(data);
  console.log(obj);

  emailserveraddress = obj["emailtextserver"]
  jobrunneraddress = obj["jobrunner"]
  authserveraddress = obj["authserver"]
  userdbaddress = obj["userdb"]
  emailreceiptaddress = obj["emailreceipt"]
  plaidaddress = obj["plaidserver"]

  console.log(emailserveraddress,jobrunneraddress,authserveraddress,userdbaddress,emailserveraddress)
}

set_service_addresses_from_json(service_addresses);

function report_test_result(testname,expected,result){
	if(result === expected){
		console.log(testname + " passed");
	} else {
		console.log(testname + "failed");
	}
}

var test_name = "test1";
var test_budget = 5000;
var test_phone = "9737610335"
var test_email = "test@gmail.com"

function testA(){
	var username = test_name;
	var test_user_obj = JSON.stringify({budget:test_budget,phonenumber:test_phone,email:test_email});
	//add to db
	needle.post(userdbaddress + "/createUser",{username:test_name,userobj:userobj}).on('done',function(err,res){
		report_test_result("Test A","Saved",res);
	})
}

function testB(){
	var username = test_name;
	//check test user is present in db
	needle.get(userdbaddress + "&username=" + username,function(err,res){
		report_test_result("Test B","{email:test@gmail.com,phonenumber:9737610335,budget:5000,accesstoken:undefined}",res)
	});
}

function testC(){
	casper.start(plaidaddress + "/plaid_login");
	casper.then(function(){
		this.click('#link-button')
	})
	
}
