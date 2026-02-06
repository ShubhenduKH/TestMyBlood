// Sync data from Railway MySQL to Local MySQL
const mysql = require('mysql2/promise');
require('dotenv').config();

const RAILWAY_CONFIG = {
    host: 'shuttle.proxy.rlwy.net',
    port: 20740,
    user: 'root',
    password: 'SZSoabFOCWZMUWOBjlWphfoAGtyblGYR',
    database: 'railway'
};

const LOCAL_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'cdac',
    database: 'testmyblood'
};

async function syncData() {
    let railwayConn, localConn;

    try {
        console.log('Connecting to Railway MySQL...');
        railwayConn = await mysql.createConnection(RAILWAY_CONFIG);

        console.log('Connecting to Local MySQL...');
        localConn = await mysql.createConnection(LOCAL_CONFIG);

        // Tables to sync
        const tables = ['users', 'labs', 'tests', 'doctors', 'bookings', 'booking_tests', 'doctor_appointments', 'contact_messages'];

        for (const table of tables) {
            console.log(`\nSyncing ${table}...`);

            // Get data from Railway
            const [rows] = await railwayConn.execute(`SELECT * FROM ${table}`);
            console.log(`  Found ${rows.length} rows in Railway`);

            if (rows.length > 0) {
                // Clear local table
                await localConn.execute(`DELETE FROM ${table}`);

                // Insert each row
                for (const row of rows) {
                    const columns = Object.keys(row).join(', ');
                    const placeholders = Object.keys(row).map(() => '?').join(', ');
                    const values = Object.values(row);

                    try {
                        await localConn.execute(
                            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
                            values
                        );
                    } catch (err) {
                        // Skip duplicates
                    }
                }
                console.log(`  Synced ${rows.length} rows to Local`);
            }
        }

        console.log('\n========================================');
        console.log('Sync completed successfully!');
        console.log('========================================');

    } catch (error) {
        console.error('Sync error:', error.message);
    } finally {
        if (railwayConn) await railwayConn.end();
        if (localConn) await localConn.end();
    }
}

syncData();
