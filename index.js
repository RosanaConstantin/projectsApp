var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var databaseUri = process.env.DATABASE_URL;

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
    databaseURI: process.env.DATABASE_URL || 'postgres://postgres:pass@localhost:5432/parsedev',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || 'myAppId',
    masterKey: process.env.MASTER_KEY || '',
    serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse'
});

var app = express();

app.use('/public', express.static(path.join(__dirname, '/public')));

var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.get('/', function (req, res) {
    res.status(200).send('');
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
    console.log('parse-server running on port ' + port + '.');
});

ParseServer.createLiveQueryServer(httpServer);