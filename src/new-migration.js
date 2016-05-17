'use strict'
let fs = require('fs')
let path = require('path')

module.exports = function (name, basedir) {
  let dirname = Date.now() + '-' + name
  let dirpath = path.join(basedir, 'migrations', dirname)
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

