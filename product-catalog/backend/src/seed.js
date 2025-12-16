const { client, connect } = require('./db');

async function seed() {
  try {
    await connect();

    // Clear existing products
    const keys = await client.keys('product:[0-9]*');
    if (keys.length > 0) {
      await client.del(keys);
    }
    
    // Reset counter
    await client.set('product:id:counter', '0');

    // Create search index
    try {
      await client.ft.create('idx:products', {
        '$.id': {
          type: 'NUMERIC',
          AS: 'id',
          SORTABLE: true
        },
        '$.name': {
          type: 'TEXT',
          AS: 'name',
          SORTABLE: true
        },
        '$.description': {
          type: 'TEXT',
          AS: 'description'
        },
        '$.price': {
          type: 'NUMERIC',
          AS: 'price',
          SORTABLE: true
        },
        '$.category': {
          type: 'TAG',
          AS: 'category',
          SORTABLE: true
        }
      }, {
        ON: 'JSON',
        PREFIX: 'product:'
      });
      console.log('RedisSearch index created');
    } catch (err) {
      if (err.message.includes('Index already exists')) {
        console.log('Index already exists, skipping creation');
      } else {
        throw err;
      }
    }

    const sample = [
      { name: 'Red T-Shirt', description: 'Comfortable cotton t-shirt', price: 19.99, category: 'Clothing' },
      { name: 'Blue Jeans', description: 'Slim fit denim', price: 49.99, category: 'Clothing' },
      { name: 'Coffee Mug', description: 'Ceramic mug 300ml', price: 9.5, category: 'Home' },
      { name: 'Wireless Mouse', description: 'Ergonomic mouse', price: 25.0, category: 'Electronics' }
    ];

    for (const product of sample) {
      const id = await client.incr('product:id:counter');
      await client.json.set(`product:${id}`, '$', { id, ...product });
    }

    console.log('Seed done - created', sample.length, 'products');
    await client.quit();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
