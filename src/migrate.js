#!/usr/bin/env node
'use strict'
let pg = require('pg-promise')()
let path = require('path')
let fs = require('fs')

module.exports = (subcommand, config) => {
  let db = connect(config)
  db.task(function * (t) {
    yield createMigrationsTable(t)
    let current = yield completedMigrations(t)
    let migrations = listMigrations(config.basedir)
    if (config.debug) console.log('migrations', migrations)
    yield commands[subcommand](migrations, current, t, config)
  })
  .catch((err) => {
    console.error('DB ERROR', err)
    process.exit(1)
  })
  .then(() => pg.end())
}

function listMigrations (basedir) {
  let migrationsDir = path.join(basedir, 'migrations')
  let migrations = fs.readdirSync(migrationsDir) || []
  return migrations.map((mdir) => {
    return {
      name: mdir,
      up: path.join(migrationsDir, mdir, 'up.sql'),
      down: path.join(migrationsDir, mdir, 'down.sql'),
      check: path.join(migrationsDir, mdir, 'check.sql')
    }
  })
}

function connect (config) {
  return pg(config.connection())
}

function createMigrationsTable (db) {
  return db.query(`CREATE TABLE IF NOT EXISTS chum_migrations (
    complete_migrations TEXT PRIMARY KEY
  )`)
}

function completedMigrations (db) {
  return db.map('SELECT complete_migrations FROM chum_migrations ORDER BY complete_migrations DESC', [], row => row.complete_migrations)
}

function runMigration (db, migration, script, config) {
  let sql = fs.readFileSync(migration[script]).toString('utf8')
  console.log('EXECUTING:', migration[script])
  if (config.debug) console.log('SQL =', sql)
  return db.query(sql)
}

function markComplete (db, migration) {
  return db.none(`INSERT INTO
    chum_migrations (complete_migrations)
    VALUES ($[name])`, migration)
}

function unmarkComplete (db, migration) {
  return db.none(`DELETE FROM chum_migrations
    WHERE complete_migrations = $[name]`, migration)
}

function migrationSort (order) {
  return (a, b) => {
    if (a.name > b.name) {
      return 1 * order
    }
    if (a.name < b.name) {
      return -1 * order
    }
    return 0
  }
}

let commands = {
  up: function (migrations, completeMigrations, db, config) {
    return db.task(function * (t) {
      let sorted = migrations.slice().sort(migrationSort(1))
      for (let migration of sorted) {
        if (completeMigrations.indexOf(migration.name) < 0) {
          yield runMigration(t, migration, 'up', config)
          if (config.runCheckScripts && fs.existsSync(migration.check)) {
            try {
              yield runMigration(t, migration, 'check', config)
            } catch (e) {
              yield runMigration(t, migration, 'down', config)
              throw e
            }
          }
          yield markComplete(t, migration)
        }
      }
    })
  },
  down: function (migrations, completeMigrations, db, config) {
    return db.task(function * (t) {
      let sorted = migrations.slice().sort(migrationSort(-1))
      for (let migration of sorted) {
        if (completeMigrations.indexOf(migration.name) >= 0) {
          yield runMigration(t, migration, 'down', config)
          yield unmarkComplete(t, migration)
          return
        }
      }
    })
  }
}
