const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_sales',
  password: 'cibangkong',
  port: 5432,
})

module.exports = pool;