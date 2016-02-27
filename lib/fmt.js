'use strict'

 var dateFormat = require('dateformat')


module.exports = function fmtMsg(event) {
  let date = new Date(event.time)
  let dateString = dateFormat(date, 'dddd mm/dd h:MM:ss TT')
  return `
    cid:      ${event.id.substr(0, 8)}
    name:     ${event.name}
    when:     ${dateString}
    ---
    log       ${event.log}
    `
}
