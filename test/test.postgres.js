const { Configure }  = require("../src/Configuration");

if (!!process.env.USE_PG) {
    console.log("Loading Postgres");
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
}


