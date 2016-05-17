'use strict'
let minimist = require('minimist')
let migrate = require('./migrate')
let newMigration = require('./new-migration')
let argv = minimist(process.argv.slice(2))

let getConfig = require('./config')

let command = argv._[0] || 'migrate'
let subcommand = argv._[1]

if (command === 'new') {
  newMigration(subcommand, getConfig(argv).basedir)
} else if (command === 'migrate') {
  migrate(subcommand, getConfig(argv))
} else {
  console.error('bad command to chum:', command)
  process.exit(1)
}
