'use strict'
let fs = require('fs')
let path = require('path')

module.exports = function (name, basedir) {
  if (/^\s*$/.test(name)) {
    throw new Error('A name is required for all migrations')
  }
  let dirname = Date.now() + '-' + name
  let dirpath = path.join(basedir, 'migrations', dirname)

  let migrationsDir = path.join(basedir, 'migrations')
  try {
    fs.mkdirSync(migrationsDir)
  } catch (e) {
    // ignore errors here
  }
  fs.mkdirSync(dirpath)

  function makeFile (name, content) {
    let filepath = path.join(dirpath, name)
    console.log('creating', filepath)
    fs.writeFileSync(filepath, content)
  }

  makeFile('up.sql', `-- ${dirname}/up.sql
-- write your new migration here`)

  makeFile('down.sql', `-- ${dirname}/down.sql
-- write how to undo your migration here`)

  makeFile('check.sql', `-- ${dirname}/check.sql
-- optionally check your migration`)
}
