# fluent
Javascript ORM Inspired by Eloquent.

## "Working" features
This is a experimental project, can dramatically change its structure at any time.

- Select (With EagerLoader)
- Delete
- Update
- Insert
- Transaction 

# Roadmap

- Add others type of relations (Only hasMany supported so far)
- Add more driver support (Only Support Mysql right now)
- Bind Select Result to Js Model to use save and delete function direct from the model.

# Use

## Model

```
import {Model} from "fluentjs";
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
})
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
