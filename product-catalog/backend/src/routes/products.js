const express = require('express');
const Joi = require('joi');
const { client, connect } = require('../db');

const router = express.Router();

const productSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().precision(2).required(),
  category: Joi.string().allow('', null),
});

// Initialize search index
async function initSearchIndex() {
  await connect();
  try {
    // Try to create index (will fail if already exists)
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
    if (!err.message.includes('Index already exists')) {
      console.error('Error creating index:', err);
    }
  }
}

initSearchIndex();

// List with search & pagination
router.get('/', async (req, res) => {
  try {
    await connect();
    const search = req.query.search || '';
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'id';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    let query = '*';
    if (search) {
      // Search in name, description, or category
      query = `(@name:${search}*) | (@description:${search}*) | (@category:{${search}*})`;
    }

    const result = await client.ft.search('idx:products', query, {
      LIMIT: { from: offset, size: limit },
      SORTBY: { BY: sortBy, DIRECTION: sortOrder }
    });

    const items = result.documents.map(doc => doc.value);

    res.json({ items, total: result.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await connect();
    const key = `product:${id}`;
    const product = await client.json.get(key);
    
    if (!product) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ product });
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

    await connect();
    
    // Generate unique ID
    const id = await client.incr('product:id:counter');
    const key = `product:${id}`;
    
    const product = {
      id: id,
      name: value.name,
      description: value.description || '',
      price: value.price,
      category: value.category || ''
    };

    await client.json.set(key, '$', product);
    
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

    await connect();
    const key = `product:${id}`;
    
    // Check if product exists
    const exists = await client.exists(key);
    if (!exists) {
      return res.status(404).json({ error: 'Not found' });
    }

    const product = {
      id: parseInt(id),
      name: value.name,
      description: value.description || '',
      price: value.price,
      category: value.category || ''
    };

    await client.json.set(key, '$', product);
    
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
    await connect();
    const key = `product:${id}`;
    
    const deleted = await client.del(key);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
