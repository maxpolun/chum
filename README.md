# Chum

[![Build Status](https://travis-ci.org/maxpolun/chum.svg?branch=master)](https://travis-ci.org/maxpolun/chum)

A simple nodejs migration system for postgres.

## Features

* Sql files for migration
* simple ordered migrations
* migration generator
* migration check scripts

## Use

```sh
$ export DATABASE_URL="postgres://username:password@host:port/database"
$ chum new my-new-migration
$ $EDITOR migrations/1463494557653-my-new-migration/up.sql
$ chum migrate
$ chum migrate down
```

## Config

* uses DATABASE_URL variable by default
* if not specified, will look for a chum.config.json file
  * That file should should have a key for the current environment (E.G. development, production, etc), with a database url as the value.
  * The environment comes from NODE_ENV (with a default of development), but can be overidden with the -e or --environment argument
* -v or an environment variable of CHUM_DEBUG=true will turn on verbose logging

## What's with the name?

Chum is a type of salmon, a migratory fish. And the name wasn't taken on npm.
