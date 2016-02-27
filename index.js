'use strict'

var fs = require('fs')
var es = require('event-stream')
var Docker = require('dockerode')
var url = require('url')
var _ = require('lodash')
var spawn = require('child_process').spawn
var docker = new Docker({socketPath: '/var/run/docker.sock'})
var debug = require('debug')
var info = debug('scepter:info')
var mail = require('./lib/mail')
var fmt = require('./lib/fmt')

var logfiles = {}
var streams = []

// if a conatiner is created or dies
// Object.observe(logfiles, onFileChange)

// function onFileChange(changes) {
//   console.log('STATE CHANGE')
// }

function tail(path) {
  let s = spawn('tail',['-n', '10', '-f', path]);
  s.stderr.on('data', (chunk) => console.log(chunk.toString()))
  return s.stdout
}

function isStdout(obj) {
  return obj.stream === "stderr"
}

function notify(event) {
  info(event.name, event.log)
  mail({
    from: 'Exception Tracker <ops@scepter.com>',
    to: process.env.MAIL_TO,
    subject: 'Exception',
    text: fmt(event)
  })
}

function handleLogFile(id, name, logpath) {
  info('streaming stderr for', name)
  let stream = tail(logpath)
    .pipe(es.split())
    .pipe(es.parse())
    .pipe(es.map((x, cb) => {
      x.name = name
      x.id = id
      cb(null, x)
    }))
    .pipe(es.map((data, cb) => {
      if (data.stream == 'stderr') {
        cb(null, data)
      }
      else cb()
    }))
    streams.push(stream)
    stream.on('data', notify)
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
function streamLogs() {
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

function cleanup() {
  info('cleaning streams....')
  streams.map(x => x.destroy())
  info('streams all closed')
  streams = []
  info('resetting stream targets')
  streamLogs()
}

function handleNewContainer(id) {
  info('new container detected', id)
  cleanup()
}

function handleContainerDie(id) {
  info('container die event detected', id)
  cleanup()
}

function watchDockerEvents() {
  docker.getEvents(function(err, stream) {
    stream.on('data', function(chunk) {
      let event = JSON.parse(chunk.toString())
      let type = event.Type
      let status = event.status
      let id = event.Actor.ID
      if (!id) return console.log('no id in event')
      switch (status) {
        case 'die':
          handleContainerDie(id)
          break;
        case 'start':
          handleNewContainer(id)
          break;
      }
    })
  })
}

function ensureVars() {
  // make this loop over an array
  // ensure these
  if (!process.env.MAILGUN_API_KEY ||
      !process.env.MAILGUN_DOMAIN ||
      !process.env.MAIL_TO) {
    console.log('yoooo')
    throw new Error('must supply env vars: MAILGUN_API_KEY, MAILGUN_DOMAIN, MAIL_TO)
  }
}

function init() {
  info('Hi! getting started')
  ensureVars()
  streamLogs()
  watchDockerEvents()
}
init()


