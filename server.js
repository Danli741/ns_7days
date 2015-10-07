var fs = require('fs'),
    path = require('path'),
    http = require('http');

var MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript'
};

function combineFiles(pathnames, callback) {
    var output = [];

    // async - array trasvers
    (function next(i, len) {
      if (i < len) {
        // async - error handling
        fs.readFile(pathnames[i], function (err, data) {
          if (err) {
            callback(err);
          } else {
              output.push(data);
              next(i + 1, len);
          }
        }); // end file read
      } else {
        callback(null, Buffer.concat(output));
      }
    } (0, pathnames.length));
}

function main(argv) {
  var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
      root = config.host || '.';
      console.log(root);
      //port = config.port || 80;

  // create the server
  http.createServer(function (request, response) {
    console.log(request.method);
    console.log(request.headers);
    console.log(request.url);

      var urlInfo = parseURL(root, request.url);

      combineFiles(urlInfo.pathnames, function (err, data) {
        if (err) {
          response.writeHead(404);
          response.end(err.message);
        } else {
          response.writeHead(200, {
            'Content-Type': urlInfo.mime
          });
          response.end(data);
        }
      });
  }).listen(8888);
}

function parseURL(root, url) {
  var base, pathnames, parts;

  if (url.indexOf('??') === -1) {
    url = url.replace('/', '/??');
  }

  parts = url.split('??');
  base = parts[0];
  console.log("root: " + root);
  console.log("base: " + base);
  pathnames = parts[1].split(',').map(function (value) {
    var pathjoin = path.join(root, base, value);
    console.log(pathjoin);
    return pathjoin;
  });

  return {
    mime: MIME[path.extname(pathnames[0])] || 'text/plain',
    pathnames: pathnames
  };
}

main(process.argv.slice(2));
