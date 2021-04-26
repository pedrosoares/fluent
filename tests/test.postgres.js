import { Configure } from './src/Configuration';
import Model from './src/Model';

Configure({
    'default': 'pgsql',
    'connections': {
        'pgsql': {
            'driver': 'pgsql',
            'host': '127.0.0.1',
            'port': '5432',
            'database': 'postgres',
            'user': 'postgres',
            'password': '1234'
        }
    }
});

class Test extends Model {

    constructor() {
        super();
        this.table = 'teste';
    }

}


Test.transaction(async (transaction, commit, rollback) => {
    await Test.create({name: "Mario do caminhão"}, {transaction}).then(test => {
        console.log("Created ", test);
    });

    await Test.insert([{name: "Ana Maria"}, {name: "Paula Latejando"}], {transaction}).then(success => {
        console.log("Creating test at batch, result: ", success);
    });

    await Test.query().where('id', '>', 1).groupBy('name', 'id').orderBy('id', 'asc').take(1).skip(1).get({transaction}).then(response => {
        console.log("response", response);
    });

    commit();
});

