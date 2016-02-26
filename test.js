'use strict'

var test = require('tape')
var Docker = require('dockerode')
var fs = require('fs')
var url = require('url')

const machinePath = process.env.DOCKER_CERT_PATH + '/'
const host = url.parse(process.env.DOCKER_HOST).hostname
const port = url.parse(process.env.DOCKER_HOST).port

var docker = new Docker({
  host: host,
  port: port,
  ca: fs.readFileSync(machinePath + 'ca.pem'),
  cert: fs.readFileSync(machinePath + 'cert.pem'),
  key: fs.readFileSync(machinePath + 'key.pem')
});

const cmd = '/bin/bash -c while true; do  echo \"YO\"; sleep 1; done'

docker.createContainer({Image: 'ubuntu', Cmd: ["echo", "POOP"], name: 'yolo'}, function (err, container) {
  if (err) throw err;

  container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    //dockerode may demultiplex attach streams for you :)
    // container.modem.demuxStream(stream, process.stdout, process.stderr);
    // console.log(stream)
    stream.on('data', function(chunk) {
      console.log(chunk.toString())
    })
  });


  // let container = docker.getContainer(res["id"])
  // console.log(container)
  // console.log(JSON.parse(res))
  // let c = docker.getContainer(container.id);
  // console.log(c)
  // container.start(function (err, data) {
  //   console.log(err)
  //     console.log(data)
  // });
});

// test('timing test', function (t) {
//     t.plan(2);
//     t.equal(typeof Date.now, 'function');
//     var start = Date.now();
//     setTimeout(function () {
//         t.equal(Date.now() - start, 100);
//     }, 100);
// });
