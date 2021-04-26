const { Configure }  = require("../src/Configuration");

if (!!process.env.USE_MS) {
    console.log("Loading Mysql");
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
}
