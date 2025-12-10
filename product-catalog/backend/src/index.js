require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
