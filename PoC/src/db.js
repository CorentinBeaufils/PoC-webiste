import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '123456789',  // Remplace par le mot de passe MySQL
    database: 'PoC',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    connectTimeout: 20000
});

export default db;
