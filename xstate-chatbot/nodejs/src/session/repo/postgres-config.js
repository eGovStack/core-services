const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: '',
    host: 'localhost',
    database: 'chat',
    port: 5432,
});

pool.on('error', (err, client) => {
    console.error('Error:', err);
});

module.exports = pool;