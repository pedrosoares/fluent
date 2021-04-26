import { Configure } from './src/Configuration';


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
