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
      resolve(`chum-test-${buf.toString('hex')}`)
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
    this._conn = pg('postgres://chum@localhost/' + name)
  }

  query (q) {
    return this._conn.query(q)
  }

  failQuery (q) {
    return this.query(q)
      .then(() => { throw new Error(`Expected query ${q} to fail`) },
            () => null)
  }

  migrationHasRun (migration) {
    return this._conn.one('SELECT * FROM chum_migrations WHERE complete_migrations = $1', [migration])
  }

  migrationHasNotRun (migration) {
    return this.migrationHasRun(migration)
      .then(() => { throw new Error(`expected migration ${migration} not to run`) },
            () => null)
  }

  initMigrationTable () {
    return this._conn.query(`CREATE TABLE IF NOT EXISTS chum_migrations (
      complete_migrations TEXT PRIMARY KEY
    )`)
  }

  fakeMigrationComplete (migration) {
    return this.initMigrationTable().then(() => this._conn.none(`INSERT INTO
      chum_migrations (complete_migrations)
      VALUES ($1)`, migration))
  }

  close () {
    pg.end()
  }
}
