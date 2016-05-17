'use strict'
let db = require('../support/db')
let command = require('../support/command')

describe('check scripts', () => {
  let dbName, client
  beforeEach((done) => {
    db.create().then(name => { dbName = name })
    .then(done, done.fail)
  })

  afterEach((done) => {
    db.drop(dbName).then(done, done.fail)
  })

  function closeDb () {
    if (client) {
      client.close()
    }
  }
  it('continues up migrations when checks succeed', (done) => {
    command.run({
      args: 'migrate up',
      dbName,
      fixture: 'check-success'
    })
    .then(() => {
      client = db.client(dbName)
      return client.migrationHasRun('1463088284789-first')
        .then(() => client.query('select * from first'))
    })
    .then(closeDb)
    .catch(err => { closeDb(); throw err })
    .catch((err) => done.fail(err))
    .then(() => done())
  })
  it('rolls back the migration if the check fails ', (done) => {
    command.run({
      args: 'migrate up',
      dbName,
      fixture: 'check-fail'
    })
    .catch(() => null)
    .then(() => {
      client = db.client(dbName)
      return client.migrationHasNotRun('1463088284789-first')
        .then(() => client.failQuery('select * from first'))
    })
    .then(closeDb)
    .catch(err => { closeDb(); throw err })
    .catch((err) => done.fail(err))
    .then(() => done())
  })
})
