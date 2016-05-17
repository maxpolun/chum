let path = require('path')

module.exports = (argv) => {
  return {
    env: env(argv),
    debug: argv['v'] || process.env.MIGRATE_DEBUG || false,
    runCheckScripts: !process.env.NO_CHECK,
    connection: getConstring(argv),
    basedir: basedir()
  }
}

function env (argv) {
  if (argv['e'] || argv['environment']) {
    return argv['e'] || argv['environment']
  }

  return process.env.NODE_ENV || 'development'
}

function basedir () {
  return process.cwd()
}

function configFile (argv) {
  if (argv['c'] || argv['config']) {
    return path.resolve(argv['c'] || argv['config'])
  }
  return basedir() + 'chinook.config.js'
}

function getConstring (argv) {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  let file = configFile(argv)
  let envConfig = require(file)
  if (envConfig[env(argv)]) {
    return envConfig[env(argv)]
  }

  throw new Error('No database connection found')
}
