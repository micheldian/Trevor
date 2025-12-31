const { Client } = require('pg');

async function removeConstraint() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'trevor_db',
    user: 'trevor_user',
    password: 'trevor_pass',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Remove the whatsapp_format constraint
    await client.query('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS whatsapp_format;');
    console.log('✅ Constraint whatsapp_format removed successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('✅ Disconnected from database');
  }
}

removeConstraint();
