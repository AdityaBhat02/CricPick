const db = require('./db');

const columns = db.pragma('table_info(teams)');
console.log('Columns in teams table:', columns);

const teams = db.prepare('SELECT * FROM teams').all();
console.log('Teams data:', teams);
