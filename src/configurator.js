const connection_pool = {};
const drivers = {};

const env = (env, default_value) => {
    return process.env[env] || default_value;
};

let Configuration = {
    'default': env('DB_CONNECTION', 'mysql'),
    'connections': {
        'sqlite': {
            'driver': 'sqlite',
            'url': env('DATABASE_URL'),
            'database': env('DB_DATABASE', 'database.sqlite'),
            'prefix': '',
            'foreign_key_constraints': env('DB_FOREIGN_KEYS', true),
        },
        'mysql': {
            'driver': 'mysql',
            'host': env('DB_HOST', '127.0.0.1'),
            'port': env('DB_PORT', '3306'),
            'database': env('DB_DATABASE', 'forge'),
            'user': env('DB_USERNAME', 'forge'),
            'password': env('DB_PASSWORD', ''),
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'prefix': '',
            'prefix_indexes': true,
            'strict': true
        },
        'pgsql': {
            'driver': 'pgsql',
            'url': env('DATABASE_URL'),
            'host': env('DB_HOST', '127.0.0.1'),
            'port': env('DB_PORT', '5432'),
            'database': env('DB_DATABASE', 'forge'),
            'username': env('DB_USERNAME', 'forge'),
            'password': env('DB_PASSWORD', ''),
            'charset': 'utf8',
            'prefix': '',
            'prefix_indexes': true,
            'schema': 'public',
            'sslmode': 'prefer',
        },
        'sqlsrv': {
            'driver': 'sqlsrv',
            'url': env('DATABASE_URL'),
            'host': env('DB_HOST', 'localhost'),
            'port': env('DB_PORT', '1433'),
            'database': env('DB_DATABASE', 'forge'),
            'username': env('DB_USERNAME', 'forge'),
            'password': env('DB_PASSWORD', ''),
            'charset': 'utf8',
            'prefix': '',
            'prefix_indexes': true,
        },
    }
};

class Configurator {

    get default_connection() {
        return Configuration.default;
    }

    get_connection_configuration(connection) {
        if(Configuration.connections[connection]) return Configuration.connections[connection];
        throw new Error(`No connection configuration found for "${connection}"`);
    }

    get_driver(connection_name) {
        // find connection configuration
        const connection = Configuration.connections[connection_name];
        // configuration has connection on pool
        if (connection && connection_pool[connection_name]) return connection_pool[connection_name];
        // configuration has valid driver
        if (connection && drivers[connection.driver])
            // Create connection, put it in the pool and deliver
            return connection_pool[connection_name] = drivers[connection.driver]();
        // Throw NoDriver exception
        throw new Error(`Connection configuration "${connection_name}" not found`);
    }

    register_driver(name, driver) {
        if (Object.hasOwnProperty.call(driver, name)) throw new Error("Driver already exists");
        drivers[name] = () => driver;
    }

    configure(config = {}) {
        Configuration = Object.assign(Configuration, config);
    }

    use(config) {
        config(this);
    }

}

export { Configurator };
