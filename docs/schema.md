# Schema

Schema is optional mechanism to define field data type, filter/validation, or observable behaviors.

Schema defined as part of connection options for each data collection schema. You can see collection as table in DBMS world.

What schema define:

- Name of collection
- Fields
- Observers

## How to use

```js
const manager = new Manager({
  connections: [
    // this is one of connection option
    {
      adapter: //...
      schemas: [
        // this is collection schema
        {
          name: 'cute_collection',
          fields: [
            // field schemas
          ],
          observers: [
            // observers
          ],
        }
      ],
    }
  ]
});
```

## Fields

Field schema are optional also. We need schema only if we want to enforce field to act as specific data type or implement filter/validation.

Every field extends from `NField` class.

```js
const NField = require('node-norm/schemas/nfield');
```

Default field schema:

- `NBoolean`
- `NDateTime`
- `NDouble`
- `NInteger`
- `NList`
- `NMap`
- `NReference`
- `NString`

## Filters

TBD

## Observers

TBD
