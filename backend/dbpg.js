const {Pool} = require('pg');

const pool = new Pool({
    host: '13.200.188.9',
    user: 'postgres',
    password: 'Metalware',
    database: 'metalware',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

module.exports = pool;