'use strict'
let exec = require('child_process').exec
let path = require('path')

module.exports.run = function (options) {
  return new Promise((resolve, reject) => {
    let fixturePath = path.join(__dirname, '../fixtures', options.fixture)
    let dbUrl = `postgresql://chum@localhost/${options.dbName}`
    let childPath = path.join(__dirname, '../../index.js')
    let cmd = `${process.execPath} ${childPath} ${options.args}`
    exec(cmd, {
      cwd: fixturePath,
      env: {
        DATABASE_URL: dbUrl
      },
      timeout: 50000
    }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr))
      resolve(stdout)
    })
  })
}
