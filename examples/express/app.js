var express = require('express')
  , upload = require('../../lib')
  , fs = require('fs')
  , app = express();

app.configure(function() {
  app.use(express.logger());
});


// curl -F "file1=@Foo.dmg" http://127.0.0.1:3000/upload
// curl -F "file1=@Foo.dmg;type=application/x-apple-diskimage" http://127.0.0.1:3000/upload
// curl -F "foo=bar" -F "file1=@Foo.dmg;type=application/x-apple-diskimage" http://127.0.0.1:3000/upload
// curl -F "file1=@Foo.dmg" -F "file2=@Bar.dmg" http://127.0.0.1:3000/upload

// curl --data-binary @Foo.dmg http://127.0.0.1:3000/upload
// curl -H "Content-Type: application/octet-stream" --data-binary @Foo.dmg http://127.0.0.1:3000/upload
// curl -H "X-File-Name: Foo.dmg" -H "Content-Type: application/octet-stream" --data-binary @Foo.dmg http://127.0.0.1:3000/upload


app.post('/upload',
  debugReq,
  upload({ hashes: ["md5", "sha1"] }, function(file, key, i, body, cb) {
    console.log('HANDLE FILE ' + key + ' ' + i);
    console.log(file)
    console.log(body)
    
    var __end = function() {
      console.log('FILE END')
      console.log(file)
    }
    
    var __error = function() {
      console.log('FILE ERROR')
      console.log(file)
    }
    
    // TODO: Use unique name to avoid overwriting uploads.
    var ws = fs.createWriteStream('upload.dump');
    //var ws = fs.createWriteStream('x/upload.dump');
    ws.on('error', function(err) {
      console.log('WRITE ERROR');
      file.removeListener('end', __end);
      file.removeListener('error', __error);
      return cb(err);
    });
    
    file.on('end', __end);
    file.on('error', __error);
    file.pipe(ws);
  }),
  function(req, res, next) {
    console.log('FORM DONE');
    res.send('OK');
  },
  function(err, req, res, next) {
    console.log('FORM ERROR');
    res.send(err.status || 500, 'ERROR');
  }
);

app.listen(3000);


function debugReq(req, res, next) {
  console.log(req.method + ' ' + req.url + ' HTTP/' + req.httpVersion);
  Object.keys(req.headers).forEach(function(field) {
    console.log(field + ': ' + req.headers[field])
  });
  console.dir(req.body);
  
  next();
}
