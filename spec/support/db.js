'use strict'
let exec = require('child_process').exec
let co = require('co')
let pg = require('pg-promise')()
let crypto = require('crypto')

function pexec (cmd, opts) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout) => {
      if (err) return reject(err)
      return resolve(stdout)
    })
  })
}

function randomName () {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(15, (err, buf) => {
      if (err) return reject(err)
      resolve(`chinook-test-${buf.toString('hex')}`)
    })
  })
}

module.exports.create = function (name) {
  return co(function * () {
    if (!name) name = yield randomName()
    yield pexec(`createdb '${name}'`)
    return name
  })
}

module.exports.drop = function (name) {
  return pexec(`dropdb '${name}'`)
}

module.exports.client = (name) => new DbClient(name)

class DbClient {
  constructor (name) {
    this._conn = pg('postgres://chinook@localhost/' + name)
  }

  query (q) {
    return this._conn.query(q)
  }

  migrationHasRun (migration) {
    return this._conn.query('SELECT * FROM chinook_migrations WHERE complete_migrations = $1', [migration])
    .then(results => {
      if (results.length !== 1) throw new Error('expected one row')
    })
  }

  close () {
    pg.end()
  }
}
