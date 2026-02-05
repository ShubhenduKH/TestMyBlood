const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
// Supports MYSQL_URL (Railway) or individual env vars (local)
let pool;

if (process.env.MYSQL_URL) {
    // Railway MySQL - parse URL and create pool
    const url = new URL(process.env.MYSQL_URL);
    pool = mysql.createPool({
        host: url.hostname,
        port: parseInt(url.port),
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log('Using MYSQL_URL for database connection');
} else {
    // Local MySQL - use individual variables
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'testmyblood',
        port: parseInt(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log('Using local database connection');
}

// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

// Execute query helper
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        throw error;
    }
};

module.exports = { pool, testConnection, query };
