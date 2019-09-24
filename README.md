# fluent
Javascript ORM Inspired by Eloquent

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
In development

## Update
In development
