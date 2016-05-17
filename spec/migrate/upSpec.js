let db = require('../support/db')
let command = require('../support/command')
// let co = require('co')

describe('up migrate command', () => {
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

  it('runs all up migrations', function (done) {
    command.run({
      args: 'migrate up',
      dbName,
      fixture: 'simple'
    })
    .then(() => {
      client = db.client(dbName)
      return client.migrationHasRun('1463088284789-first')
        .then(() => client.migrationHasRun('1463088284790-second'))
        .then(() => client.migrationHasRun('1463088284791-third'))
        .then(() => client.query('select * from first'))
        .then(() => client.query('select * from second'))
        .then(() => client.query('select * from third'))
    })
    .then(closeDb)
    .catch(err => { closeDb(); throw err })
    .catch((err) => done.fail(err))
    .then(() => done())
  })
  it('does not run migrations that have already been run')
})
