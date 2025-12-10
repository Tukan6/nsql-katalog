const pool = require('./db');

async function seed() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        category TEXT
      );
    `);

    await pool.query(`DELETE FROM products;`);

    const sample = [
      ['Red T-Shirt','Comfortable cotton t-shirt',19.99,'Clothing'],
      ['Blue Jeans','Slim fit denim',49.99,'Clothing'],
      ['Coffee Mug','Ceramic mug 300ml',9.5,'Home'],
      ['Wireless Mouse','Ergonomic mouse',25.0,'Electronics']
    ];

    for (const p of sample) {
      await pool.query('INSERT INTO products(name, description, price, category) VALUES($1,$2,$3,$4)', p);
    }

    console.log('Seed done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
