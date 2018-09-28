# API

## Manager

Manager manages multiple connections and sessions into single application context.

`Manager ({ connections = [] } = {})`

`#openSession ()`

Create new session

`#runSession (fn)`

Run session by function

## Session

Session manages single connection context

`Session ({ manager, autocommit = true })`

`#factory (schemaName, criteria = {})`

Create new query by its schema name

`#begin ()`

`#commit ()`

`#rollback ()`

## Connection

Connection is single connection to data source

`Connection ({ name })`

`#begin ()`

`#commit ()`

`#rollback ()`

## Schema

You may see schema is a single table or collection.

`Schema ({ name, fields = [], modelClass = Model })`

`#attach ()`

`#filter ()`

## Field

Field defines single property of schema. The `id` property does not have to be added as field and will be implicitly added.

`Field (name, ...filters)`

`#filter ()`

## Query

To load or persist data to data source, query object works as context of single request.

## Operators

- or
- and
- eq
- ne
- gt
- gte
- lt
- lte
- in
- nin
- regex
- like
- where: use function as determinator

`#find ()`

`#insert ()`

`#set ()`

`#save ()`

`#skip ()`

`#limit ()`

`#sort ()`

`#delete ()`

`#truncate ()`

`#drop ()`

`#all ()`

`#single ()`

`#count (useSkipAndLimit = false)`
