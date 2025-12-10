const express = require('express');
const Joi = require('joi');
const pool = require('../db');
const { client, connect } = require('../cache');

const router = express.Router();

const productSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().precision(2).required(),
  category: Joi.string().allow('', null),
});

// List with search & pagination
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    const q = {
      text: `SELECT * FROM products WHERE name ILIKE $1 OR category ILIKE $1 ORDER BY id LIMIT $2 OFFSET $3`,
      values: [`%${search}%`, limit, offset],
    };
    const totalQ = {
      text: `SELECT COUNT(*) FROM products WHERE name ILIKE $1 OR category ILIKE $1`,
      values: [`%${search}%`],
    };

    const [result, total] = await Promise.all([pool.query(q), pool.query(totalQ)]);
    res.json({ items: result.rows, total: parseInt(total.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product with Redis cache
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await connect();
    const key = `product:${id}`;
    const cached = await client.get(key);
    if (cached) {
      const product = JSON.parse(cached);
      return res.json({ cache: 'hit', product });
    }

    const q = { text: 'SELECT * FROM products WHERE id = $1', values: [id] };
    const result = await pool.query(q);
    const product = result.rows[0];
    if (!product) return res.status(404).json({ error: 'Not found' });

    await client.setEx(key, 600, JSON.stringify(product));
    res.json({ cache: 'miss', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const q = {
      text: 'INSERT INTO products(name, description, price, category) VALUES($1,$2,$3,$4) RETURNING *',
      values: [value.name, value.description || '', value.price, value.category || ''],
    };
    const result = await pool.query(q);
    const product = result.rows[0];
    // Optionally cache the created product
    try { await connect(); await client.setEx(`product:${product.id}`, 600, JSON.stringify(product)); } catch (e) {}
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const q = {
      text: 'UPDATE products SET name=$1, description=$2, price=$3, category=$4 WHERE id=$5 RETURNING *',
      values: [value.name, value.description || '', value.price, value.category || '', id],
    };
    const result = await pool.query(q);
    const product = result.rows[0];
    if (!product) return res.status(404).json({ error: 'Not found' });

    // Invalidate cache
    try { await connect(); await client.del(`product:${id}`); } catch (e) {}

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const q = { text: 'DELETE FROM products WHERE id=$1 RETURNING *', values: [id] };
    const result = await pool.query(q);
    const product = result.rows[0];
    if (!product) return res.status(404).json({ error: 'Not found' });

    // Invalidate cache
    try { await connect(); await client.del(`product:${id}`); } catch (e) {}

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
