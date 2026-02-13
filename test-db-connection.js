#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;

dotenv.config();

async function testConnection() {
  console.log('Testing database connection with:');
  console.log(`  Host: ${process.env.DATABASE_HOST}`);
  console.log(`  Port: ${process.env.DATABASE_PORT}`);
  console.log(`  Database: ${process.env.DATABASE_NAME}`);
  console.log(`  User: ${process.env.DATABASE_USER}`);
  console.log(`  Password: ${'*'.repeat(process.env.DATABASE_PASSWORD?.length || 0)}`);
  console.log();

  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connection successful!');

    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('\nDatabase info:');
    console.log(`  PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);
    console.log(`  Database: ${result.rows[0].current_database}`);
    console.log(`  User: ${result.rows[0].current_user}`);

    await client.end();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error(`  Error: ${error.message}`);
    console.error(`  Code: ${error.code}`);
    console.error(`  Detail: ${error.detail || 'N/A'}`);

    console.log('\n🔍 Troubleshooting tips:');

    if (error.code === 'ECONNREFUSED') {
      console.log('  - PostgreSQL may not be running');
      console.log('  - Check if PostgreSQL is listening on 192.168.7.203:5432');
      console.log('  - Verify postgresql.conf has: listen_addresses = \'*\'');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'EHOSTUNREACH') {
      console.log('  - Network/firewall issue - port 5432 may be blocked');
      console.log('  - Check firewall: sudo ufw allow 5432/tcp');
    } else if (error.message.includes('authentication')) {
      console.log('  - Username or password is incorrect');
      console.log('  - Check pg_hba.conf for host entry');
    } else if (error.message.includes('does not exist')) {
      console.log('  - Database "wizqueue" may not exist');
      console.log('  - Create it with: CREATE DATABASE wizqueue;');
    }

    process.exit(1);
  }
}

testConnection();
