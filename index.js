'use strict'

var fs = require('fs')
var es = require('event-stream')
var Docker = require('dockerode')
var url = require('url')
var _ = require('lodash')
var spawn = require('child_process').spawn
var docker = new Docker({socketPath: '/var/run/docker.sock'})

var logfiles = {}

// if a conatiner is created or dies
Object.observe(logfiles, onFileChange)

function onFileChange(changes) {
  console.log('STATE CHANGE')
  // console.log(changes)
}

function tail(path) {
  let s = spawn('tail',['-n', '10', '-f', path]);
  s.stderr.on('data', (chunk) => console.log(chunk.toString()))
  return s.stdout
}

function isStdout(obj) {
  return obj.stream === "stderr"
}

function notify(event) {
  console.log('I would notify!')
  console.log(event)
}

function handleLogFile(id, name, logpath) {
  console.log('handling', id)
  tail(logpath)
    .pipe(es.split())
    .pipe(es.parse())
    .pipe(es.map((x, cb) => {
      x.name = name
      cb(null, x)
    }))
    .pipe(es.map((data, cb) => {
      if (data.stream == 'stderr') {
        cb(null, data)
      }
      else cb()
    }))
    .on('data', notify)
}

// avoid an infinite logging loop
function filterContainers(containers) {
  return containers
    .filter(x => x.Image != 'bhurlow/scepter')
}

// on boot, 
// determine which log files to follow
// (this might change throughout container lifecycle)
//
// TODO: this must ignore logs from self!
function setInitialLogPaths() {
  docker.listContainers(function(err, res) {
    if (err) throw err;
    filterContainers(res).forEach((info) => {
      let container = docker.getContainer(info.Id)
      container.inspect(function(err, data) {
        if (err) throw err;
        let name = info.Names.join('')
        let logpath = data.LogPath
        let id = data.Id
        handleLogFile(id, name, logpath)
      })
    })
  })
}

function handleNewContainer(contianer) {
  console.log('NEW CONTAINER')
  console.log(contianer)
}

function handleContainerDie(contianer) {
  console.log('CONTIANER DIE')
  console.log(contianer)
}

function watchLog(container) {

}

setInitialLogPaths()


