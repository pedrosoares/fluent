import {Configure} from './src/Configuration';
import Model from './src/Model';

Configure({
    'default': 'mysql',
    'connections': {
        'mysql': {
            'driver': 'mysql',
            'host': '127.0.0.1',
            'port': '3306',
            'database': 'forge',
            'user': 'root',
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

Test.query().groupBy('name').orderBy('id', 'asc').take(1).skip(1).get().then(response => {
    console.log(response);
});

