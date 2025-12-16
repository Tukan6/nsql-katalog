const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const client = createClient({ url: redisUrl });

client.on('error', (err) => console.error('Redis Client Error', err));

let isConnected = false;

async function connect() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log('Connected to Redis');
  }
  return client;
}

module.exports = { client, connect };
