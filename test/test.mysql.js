const { configurator }  = require("../src/index");

if (!!process.env.USE_MS) {
    const mysql_driver = require("fluent-mysql");
    console.log("Loading Mysql");
    configurator.use(mysql_driver.configure);
    configurator.configure({
        'default': 'mysql',
        'connections': {
            'mysql': {
                'driver': 'mysql',
                'host': 'local',
                'port': '3306',
                'database': 'forge',
                'user': 'root',
                'password': '1234'
            }
        }
    });
}
