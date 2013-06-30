var querystring = require('querystring');
var fs = require('fs');

var messageLog = [];

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.handleRequest = function(request, response) {

  if (request.method !== 'OPTIONS') {
    var requestedURL = require('url').parse(request.url);
    var parsedPath = requestedURL.path.split('/');

    //first element is empty string for root URL
    if (requestedURL.path === '/') {
      response.writeHead(200, "OK", {'Content-Type': 'text/html'});
      response.end();

    } else if (parsedPath.length === 3 && parsedPath[2] === 'messages') {
      if (request.method == 'POST') {
        request.on('data', function(chunk) {
          var msg = chunk.toString();
          writeTwittleToLog(msg);
          messageLog.push(msg);
          console.log(messageLog);
        });

        request.on('end', function() {
          response.writeHead(302, defaultCorsHeaders);
          response.end();
        });

      } else if (request.method == 'GET') {
          response.writeHead(202, defaultCorsHeaders);
          var myObj = {username: 'magee', text: 'something goes here'};
          console.log(JSON.stringify(messageLog));
          response.end(JSON.stringify(messageLog), 'utf8');
      } else {
        send404Response(response);
      }

    } else if (parsedPath[1] === 'classes' && parsedPath.length > 2) {
      // something -- a room -- was passed after classes in the URL
      if (request.method == 'POST') {
        // what is posting to rooms?
      } else if (request.method == 'GET') {
        // send messages for GET
      } else {
        send404Response(response);
      }

    } else {
      send404Response(response);
    }
  } else {
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = "text/plain";
    response.writeHead(statusCode, headers);
    response.end();
  }

  return response;
};

var writeTwittleToLog = function(data) {
  fs.open('./log', 'a', 666, function( e, id ) {
    fs.appendFile('./log', data, "utf8", function (err) {
      if (err) {
        throw err;
      } else {
        fs.close(id, function(){
          console.log('file closed');
        });
      }
    });
  });
}

var send404Response = function(response) {
    response.writeHead(404, "Not found", {'Content-Type': 'text/html'});
    response.end();
    return response;
}

var getFile = function(filepath) {
  var data = "";
  fs.exists(filepath, function(exists) {
    if (exists) {
      fs.stat(filepath, function(error,stats) {
        fs.open(filepath, "r", function(error, fd) {
          var buffer = new Buffer(stats.size);
          fs.read(filepath, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            data = buffer.toString("utf8", 0, buffer.length);
            return JSON.stringify(data);
            fs.close(filepath);
          });
        });
      });
    }
  });

  return JSON.stringify("<html><body>testing, testing, testing you MOTHERFUCKER!</br></br>Did you see my file: "+filepath+"?</body></html>");
}
