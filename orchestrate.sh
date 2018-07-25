#!/bin/bash

echo "Starting mocked servers"
osascript -e 'tell application "Terminal" to do script "cd Desktop/20percentproj/microservicemocks/jobrunnermock;node server.js"'
osascript -e 'tell application "Terminal" to do script "cd Desktop/20percentproj/microservicemocks/plaidservermock;node server.js"'
osascript -e 'tell application "Terminal" to do script "cd Desktop/20percentproj/microservicemocks/userdbmock;node server.js"'
osascript -e 'tell application "Terminal" to do script "cd Desktop/20percentproj/microservicemocks/useremailsreceivedserver;node server.js"'
osascript -e 'tell application "Terminal" to do script "cd Desktop/20percentproj/microservicemocks/emailtextservermock;node server.js"'