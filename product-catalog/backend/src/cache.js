const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const client = createClient({ url: redisUrl });

client.on('error', (err) => console.error('Redis Client Error', err));

async function connect() {
  if (!client.isOpen) await client.connect();
}

module.exports = { client, connect };
