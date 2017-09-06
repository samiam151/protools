const pg = require("pg");

const db = new pg.Client({
    host: "localhost",
    database: "protools",
    user: "postgres",
    password: "Skater151",
    port: 5432,
});
db.connect();


module.exports = db;
