# fluent
Javascript ORM Inspired by Eloquent.

# Installation

```
npm install fluent-orm --save
```

or

```
yarn add fluent-orm
```

# Configuration

You can use ENV variable or call the configuration method.

## ENV

create a `.env` file like the example bellow.
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=test
DB_USERNAME=root
DB_PASSWORD=1234
```

## Configuration

In the main script you can configure like this:
```
import { configurator } from "fluent-orm";
import pg_driver from "fluent-pg";
import my_driver from "fluent-mysql-driver";

const env = (env, default_value) => {
    return process.env[env] || default_value;
};

// Add driver
configurator.use(pg_driver.configure);
configurator.use(my_driver.configure);

// Add drivers configurations
configurator.configure({
    'default': 'my_mysql_connection',
    'connections': {
        'my_mysql_connection': {
            'driver': 'mysql',
            'host': '127.0.0.1',
            'port': '3306',
            'database': env('DB_DATABASE', 'forge'), //you can also use env here
            'user': 'forge',
            'password': '',
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'prefix': '',
            'prefix_indexes': true,
            'strict': true
        },
        'my_postgres_connection': {
            'driver': 'pgsql',
            'host': '127.0.0.1',
            'port': '5432',
            'database': 'postgres',
            'user': 'postgres',
            'password': '1234'
        }
    }
});
```

## available drivers

### PostgreSQL
https://github.com/pedrosoares/fluent-pg
### Mysql
https://github.com/pedrosoares/fluent-mysql

## "Working" features
This is a experimental project, can dramatically change its structure at any time.

- Select (With EagerLoader)
- Delete
- Update
- Insert
- Insert Batch
- Count
- raw
- Transaction 

# Roadmap

- Add others type of relations (hasMany and hasOne supported so far)
- Improve @types for TypeScript

# Usage

## Model

```
import { Model } from "fluent-orm";
import Permission from "./permission.entity";
import Email from "./email.entity";

class Person extends Model {
    // ORM Fields
    _connection = "psql"; // YOU CAN CHANGE THIS TO SELECT A DIFERENT CONNECTION
    table = "person"; // TABLE NAME
    protected = ["id"]; // FIELDS TO NOT SERIALIZE
    primaryKey = "id"; // TABLE PRIMARY KEY
    foreignKey = "person_id"; // HOW THIS TABLE IS CALL REMOTELY

    // create person field to the ORM can fill-it
    id = null;
    name = null;
     
    permissions() {
        return this.hasMany(Permission, "permission_id", "id");
    }

    email() {
        return this.hasOne(Email);
    }

}

export { Person };
```
## Filters
````
const query = Model.query();
// WHERE
// field = "value"
// field > "value"
query
    .where("field", "value")
    .where("field", ">", "value");

// WHERE
// AND "field" = "value"
// AND "field" > "value"
query
    .andWhere("field", "value")
    .andWhere("field", ">", "value");

// WHERE
// OR "field" = "value"
// OR "field" > "value"
query
    .orWhere("field", "value")
    .orWhere("field", ">", "value");

// WHERE  
// field like ''
// AND field like ''
// OR field like ''
query
    .whereRaw("field like ''")
    .andWhereRaw("field like ''")
    .orWhereRaw("field like ''")
    
// Multilevel Where
// WHERE
// (field = "value"  OR field = 2)
query.where(queryBuilder =>  {
    // same as above
    queryBuilder
        .where("field", "value")
        .orWhere("field", "2");
})
````

## Select

```
Person.query().with("permissions", "email").get().then(response => {
    console.log(response.serialize());
}).catch(error => {
    console.log(error);
});
```

## Create/Insert

Create insert a single element and return it with id. Insert is a bulk function.

```
Person.create({name, password}).then(person => {
    Email.create({
        person_id: person.id,
        email: email
    }).then(new_email => {
        console.log({
            person,
            new_email
        });
    });
}).catch(error => {
    console.log(error);
})
```

## Delete
```
Person.transaction((transaction, commit, rollback) => {
    Person.query().where('id', id).firstOrFail({transaction}).then(person => {
        Person.query().where('id', person.id).delete({transaction}).then(() => {
            commit();
            res.json({
                success: 'Person deleted successfully'
            });
        });
    }).catch(error => {
        res.status(500).send({
            error: error,
            message: error.toString()
        });
        rollback();
    })
});

// OR Using async/await

const { transaction, commit, rollback } = await Person.transaction();
try {
    const person = await Person.query().where('id', id).firstOrFail({ transaction });
    await Person.query().where('id', person.id).delete({ transaction });
    commit();
} catch(err) {
    rollback();
}
```

## Update
```
Person.transaction((transaction, commit, rollback) => {
    Person.query().where('id', id).firstOrFail({transaction}).then(person => {
        Person.query().where('id', person.id).update({
            name: name
        }, {transaction}).then(() => {
            commit();
            res.json({
                success: 'Person Updated successfully'
            });
        }).catch(error => {
            res.status(500).send({
                error: error,
                message: error.toString()
            });
            rollback();
        });
    }).catch(error => {
        res.status(500).send({
            error: error,
            message: error.toString()
        });
        rollback();
    })
});
```
