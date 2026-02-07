const db = require('better-sqlite3')('auction.db');

try {
    db.prepare('ALTER TABLE players ADD COLUMN style TEXT').run();
    console.log('Successfully added style column to players table.');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Column style already exists.');
    } else {
        console.error('Error adding column:', err);
    }
}
