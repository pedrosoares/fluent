const { configurator }  = require("../src/index");

if (!!process.env.USE_PG) {
    const pg_driver = require("fluent-pg");
    console.log("Loading Postgres");
    configurator.use(pg_driver.configure);
    configurator.configure({
        'default': 'pgsql',
        'connections': {
            'pgsql': {
                'driver': 'pgsql',
                'host': 'local',
                'port': '5432',
                'database': 'postgres',
                'user': 'postgres',
                'password': '1234'
            }
        }
    });
}


