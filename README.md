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
import my_driver from "fluent-mysql";

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

https://github.com/pedrosoares/fluent-pg
https://github.com/pedrosoares/fluent-mysql

## "Working" features
This is a experimental project, can dramatically change its structure at any time.

- Select (With EagerLoader)
- Delete
- Update
- Insert
- count
- raw
- Transaction 

# Roadmap

- Add others type of relations (Only hasMany supported so far)
- Bind Select Result to Js Model to use save and delete function direct from the model.

# Usage

## Model

```
import { Model } from "fluent-orm";
import Permission from "./Column";
import Email from "./Column";

class Person extends Model {

    Permissions() {
        return this.hasMany(Permission, 'permission_id', 'id');
    }

    Emails() {
        return this.hasMany(Email);
    }

}

export default Person;
```

## Select

```
Person.query().with('Permissions', 'Emails').get().then(response => {
    console.log(response);
}).catch(error => {
    console.log(error);
});
```

## Create/Insert

Create insert a single element and return it with id. Insert is a bulk function.

```
Person.create({name, password}).then(person => {
    const dataEmails = emails.map(email => ({
        person_id: person.id,
        email: email
    }));

    Email.insert(dataEmails).then(success => {
        console.log({
            person,
            success
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
